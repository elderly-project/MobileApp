import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import SimplestApp from './SimplestApp';
import Auth from './components/Auth';
import UserData from './components/UserData';
import { supabase, getCurrentUser, getUserProfile, getUserMedications, getUserAppointments } from './utils/supabase';
import ConvAiDOMComponent from './components/ConvAI';
import tools from './utils/tools';
import { Platform } from 'react-native';
import { ZoomProvider } from './contexts/ZoomContext';

export default function App() {
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserData, setShowUserData] = useState(false);
  const [showSection, setShowSection] = useState<'appointments' | 'medications' | 'profile' | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to get session: " + sessionError.message);
          setLoading(false);
          return;
        }

        console.log("Session data:", data);
        const hasSession = !!data.session;
        setSession(hasSession);
        
      } catch (error) {
        console.error('Error checking session:', error);
        setError("Exception checking session: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log("Auth state changed:", _event, session ? "Has session" : "No session");
          const hasSession = !!session;
          setSession(hasSession);
        }
      );

      // Clean up subscription
      return () => {
        data.subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setError("Failed to set up auth listener: " + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  }, []);

  const handleAuthenticated = async () => {
    console.log("User authenticated");
    setSession(true);
  };

  const handleSignOut = () => {
    console.log("User signed out");
    setSession(false);
    setShowUserData(false);
  };

  const handleViewUserData = (section: 'appointments' | 'medications' | 'profile') => {
    setShowSection(section);
    setShowUserData(true);
  };

  return (
    <ZoomProvider>
      <AppContent 
        session={session}
        loading={loading}
        error={error}
        showUserData={showUserData}
        showSection={showSection}
        handleAuthenticated={handleAuthenticated}
        handleSignOut={handleSignOut}
        handleViewUserData={handleViewUserData}
        setError={setError}
        setLoading={setLoading}
        setSession={setSession}
        setShowUserData={setShowUserData}
        setShowSection={setShowSection}
      />
    </ZoomProvider>
  );
}

interface AppContentProps {
  session: boolean;
  loading: boolean;
  error: string | null;
  showUserData: boolean;
  showSection: 'appointments' | 'medications' | 'profile' | null;
  handleAuthenticated: () => void;
  handleSignOut: () => void;
  handleViewUserData: (section: 'appointments' | 'medications' | 'profile') => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSession: (session: boolean) => void;
  setShowUserData: (show: boolean) => void;
  setShowSection: (section: 'appointments' | 'medications' | 'profile' | null) => void;
}

function AppContent({ 
  session, 
  loading, 
  error, 
  showUserData, 
  showSection, 
  handleAuthenticated, 
  handleSignOut, 
  handleViewUserData,
  setError,
  setLoading,
  setSession,
  setShowUserData,
  setShowSection
}: AppContentProps) {
  // If there's an error, display it
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient 
          colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text 
            style={styles.errorButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              // Re-check session
              supabase.auth.getSession().then(
                ({ data }) => {
                  setSession(!!data.session);
                  setLoading(false);
                }
              ).catch(e => {
                setError("Retry failed: " + (e instanceof Error ? e.message : String(e)));
                setLoading(false);
              });
            }}
          >
            Retry
          </Text>
          <View style={styles.domComponentContainer}>
          
        </View>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  // While checking for existing session
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient 
          colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  // If not authenticated, show Auth component
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient 
          colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill} 
        />
        <Auth onAuthenticated={handleAuthenticated} />
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  // If user wants to see their data
  if (showUserData) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill} 
      />
      <View style={styles.userDataHeader}>
        <TouchableOpacity 
          style={styles.topBackButton}
          onPress={() => {
            setShowUserData(false);
            setShowSection(null);
          }}
        >
          <ArrowLeft size={24} color="#1E40AF" />
        </TouchableOpacity>
        <Text style={styles.userDataTitle}>
          {showSection === 'profile' ? 'Profile' : 
           showSection === 'medications' ? 'Medications' : 
           showSection === 'appointments' ? 'Appointments' : 'Health Data'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <View style={styles.userDataContent}>
        <UserData onSignOut={handleSignOut} show={showSection ?? undefined} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}


  // If authenticated, show the main app
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill} 
      />
      <SimplestApp onSignOut={handleSignOut} onViewUserData={handleViewUserData} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  domComponentContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  domComponent: {
    width: 120,
    height: 120,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1E40AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  userDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  topBackButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  userDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40, // Same width as back button to center the title
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 20, // fixed distance from bottom
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16, // optional padding for horizontal spacing
  },
  backButton: {
    backgroundColor: '#3B82F6',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: 'white',
  },
  userDataContent: {
    flex: 1,
  },
});
