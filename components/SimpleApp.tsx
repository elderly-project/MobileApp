import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../utils/supabase';

export default function SimpleApp() {
  const [status, setStatus] = React.useState('Loading...');

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test if Supabase connection works
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        
        if (error) {
          console.error('Supabase error:', error);
          setStatus(`Database Error: ${error.message}`);
        } else {
          console.log('Supabase connection successful:', data);
          setStatus('Connected to database successfully');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>HealthCompanion AI</Text>
        <Text style={styles.subtitle}>Debug Mode</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={async () => {
            try {
              setStatus('Checking connection...');
              const { data, error } = await supabase
                .from('user_profiles')
                .select('count')
                .limit(1);

              if (error) {
                setStatus(`Database Error: ${error.message}`);
              } else {
                setStatus(`Connected to database - ${new Date().toLocaleTimeString()}`);
              }
            } catch (e) {
              setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
            }
          }}

        >
          <Text style={styles.buttonText}>Test Database Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            alert('App is working!');
          }}
        >
          <Text style={styles.buttonText}>Test Alert</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 32,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#93C5FD',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E40AF',
  },
  statusText: {
    fontSize: 14,
    color: '#4B5563',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 