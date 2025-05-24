import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import FallbackButton from './components/FallbackButton';
import { useNavigation } from '@react-navigation/native';
import ConvAiDOMComponent from './components/ConvAI';
import tools from './utils/tools';



interface SimplestAppProps {
  onSignOut: () => void;
  onViewUserData: (section: 'appointments' | 'medications' | 'profile') => void;
}

export default function SimplestApp({ onSignOut, onViewUserData }: SimplestAppProps) {
  const [showVoiceInfo, setShowVoiceInfo] = useState(false);
  const isWeb = Platform.OS === 'web';



  const handleVoiceAssistant = () => {
    setShowVoiceInfo(true);
    setTimeout(() => setShowVoiceInfo(false), 3000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HealthCompanion AI</Text>
        <TouchableOpacity onPress={() => onViewUserData('profile')} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Layout */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridButton} onPress={() => onViewUserData('appointments')}>
            <View style={styles.buttonContent}>
              <Text style={styles.gridIcon}>📅</Text>
              <Text style={styles.gridText}>Appointments</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridButton} onPress={() => onViewUserData('medications')}>
            <View style={styles.buttonContent}>
              <Text style={styles.gridIcon}>💊</Text>
              <Text style={styles.gridText}>Medications</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Voice Assistant Section (full width) */}
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
          <ConvAiDOMComponent
                      dom={{ style: styles.domComponent }}
                      platform={Platform.OS}
                      get_battery_level={tools.get_battery_level}
                      change_brightness={tools.change_brightness}
                      flash_screen={tools.flash_screen}
                    />
        </View>
      </View>
    </View>
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
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: '#EFF6FF',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  gridContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  voiceAssistant: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
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
  buttonContainer: {
    marginBottom: 16,
  },
  assistantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 16,
  },
  voiceButton: {
    marginBottom: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    padding: 20,
  },
  voiceMic: {
    fontSize: 32,
    color: 'white',
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
    backgroundColor: '#FEF3C7',
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
  gridButton: {
  flex: 1,
  height: 100,
  backgroundColor: '#3B82F6',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
},
buttonContent: {
  justifyContent: 'center',
  alignItems: 'center',
},
gridIcon: {
  fontSize: 32, // larger icon
  marginBottom: 6,
},
gridText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},

});
