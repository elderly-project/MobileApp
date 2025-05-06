import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Platform } from 'react-native';

import ConvAiDOMComponent from './components/ConvAI';
import tools from './utils/tools';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill} 
      />

      <View style={styles.topContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>HealthCompanion AI</Text>
          <Text style={styles.subtitle}>Your Personal Health Assistant</Text>
        </View>

        <Text style={styles.description}>
          Your friendly voice assistant for health and wellness. Tap and speak to:
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.emoji}>📋</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Medication Reminders</Text>
              <Text style={styles.featureSubtext}>Never miss your medications</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.emoji}>🏥</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Doctor Appointments</Text>
              <Text style={styles.featureSubtext}>Easy scheduling and reminders</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.emoji}>💪</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Wellness Check-ins</Text>
              <Text style={styles.featureSubtext}>Daily health monitoring</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.emoji}>🚶‍♂️</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Activity Tracking</Text>
              <Text style={styles.featureSubtext}>Monitor your daily activities</Text>
            </View>
          </View>
        </View>

        <Text style={styles.instructionText}>
          Tap the button below and speak naturally
        </Text>
        
        <View style={styles.domComponentContainer}>
          <ConvAiDOMComponent
            dom={{ style: styles.domComponent }}
            platform={Platform.OS}
            get_battery_level={tools.get_battery_level}
            change_brightness={tools.change_brightness}
            flash_screen={tools.flash_screen}
          />
        </View>

        <View style={styles.helpTextContainer}>
          <Text style={styles.helpText}>Try saying:</Text>
          <Text style={styles.helpExample}>"What's my schedule today?"</Text>
          <Text style={styles.helpExample}>"Remind me about my medicine"</Text>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContent: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#3B82F6',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#1E40AF',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.8,
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    maxWidth: 340,
    marginBottom: 24,
    shadowColor: '#93C5FD',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF6FF',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  featureSubtext: {
    fontSize: 13,
    color: '#60A5FA',
  },
  instructionText: {
    fontSize: 18,
    color: '#1E40AF',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  domComponentContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  domComponent: {
    width: 120,
    height: 120,
  },
  helpTextContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 14,
    maxWidth: 260,
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
});
