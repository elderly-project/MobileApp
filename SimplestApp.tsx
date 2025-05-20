import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import FallbackButton from './components/FallbackButton';

interface SimplestAppProps {
  onSignOut: () => void;
  onViewUserData: () => void;
}

export default function SimplestApp({ onSignOut, onViewUserData }: SimplestAppProps) {
  const [showVoiceInfo, setShowVoiceInfo] = useState(false);
  
  // Check if we're on web
  const isWeb = Platform.OS === 'web';
  
  const handleVoiceAssistant = () => {
    setShowVoiceInfo(true);
    // Hide the message after 3 seconds
    setTimeout(() => setShowVoiceInfo(false), 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HealthCompanion AI</Text>
        <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.subtitle}>Your Health Dashboard</Text>
        <Text style={styles.description}>
          The app is working correctly. Use the button below to view your health data.
        </Text>
        
        <TouchableOpacity 
          style={styles.dataButton}
          onPress={onViewUserData}
        >
          <Text style={styles.dataButtonText}>View My Health Data</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.assistantContainer}>
        <Text style={styles.assistantTitle}>Voice Assistant</Text>
        
        {showVoiceInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Voice assistant functionality is available in the mobile app or in compatible browsers.
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <FallbackButton 
            onPress={handleVoiceAssistant}
            title="Voice Assistant" 
            subtitle={isWeb ? "Web Version" : "Tap to Start"}
          />
        </View>
        
        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>Try saying:</Text>
          <Text style={styles.helpExample}>"What's my schedule today?"</Text>
          <Text style={styles.helpExample}>"Remind me about my medicine"</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EFF6FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#93C5FD',
  },
  signOutButtonText: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  dataButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  dataButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  assistantContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  assistantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  helpTextContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    marginBottom: 6,
  },
  helpExample: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: 'rgba(254, 243, 199, 0.7)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
}); 