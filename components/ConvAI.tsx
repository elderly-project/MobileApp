'use dom';

import { useConversation } from '@11labs/react';
import { Mic } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

import tools from '../utils/tools';
import { getCurrentUser, getUserProfile, getUserMedications, getUserAppointments } from '../utils/supabase';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.log(error);
    console.error('Microphone permission denied');
    return false;
  }
}

export default function ConvAiDOMComponent({
  platform,
  get_battery_level,
  change_brightness,
  flash_screen,
}: {
  dom?: import('expo/dom').DOMProps;
  platform: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
}) {
  const [isLoadingData, setIsLoadingData] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      AccessibilityInfo.announceForAccessibility('Voice assistant connected. You can start speaking.');
    },
    onDisconnect: () => {
      console.log('Disconnected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      AccessibilityInfo.announceForAccessibility('Voice assistant disconnected.');
    },
    onMessage: (message) => {
      console.log(message);
      // Announce AI responses for accessibility
      AccessibilityInfo.announceForAccessibility(message.message);
    },
    onError: (error) => {
      console.error('Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      AccessibilityInfo.announceForAccessibility('An error occurred. Please try again.');
    },
  });

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      console.log('Starting fetchUserData for voice assistant...');
      
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        console.log('No user found');
        return null;
      }

      console.log('User found:', user.id);

      // Fetch profile
      console.log('Fetching profile...');
      const profileData = await getUserProfile(user.id);
      console.log('Profile data:', profileData ? 'loaded' : 'null');
      
      // Fetch medications
      console.log('Fetching medications...');
      const medsData = await getUserMedications(user.id);
      console.log('Medications data:', medsData ? `${medsData.length} items` : 'null');
      
      // Fetch appointments
      console.log('Fetching appointments...');
      const apptsData = await getUserAppointments(user.id);
      console.log('Appointments data:', apptsData ? `${apptsData.length} items` : 'null');

      // Format the data for the voice agent (same structure as web app)
      const formattedUserData = {
        profile: profileData || {},
        medications: medsData || [],
        appointments: apptsData || []
      };

      console.log('User data loaded for voice agent:', {
        profile: !!formattedUserData.profile,
        medications: formattedUserData.medications.length,
        appointments: formattedUserData.appointments.length
      });

      return formattedUserData;

    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Format user data for dynamic variables (same as web app)
  const prepareDynamicVariables = (userData: any) => {
    if (!userData) {
      return { platform };
    }

    // Basic profile info
    const vars: Record<string, string | number | boolean> = {
      platform,
      user_name: userData.profile?.full_name || 'User',
      age: userData.profile?.age || 'unknown',
      gender: userData.profile?.gender || 'unspecified',
      medical_conditions: userData.profile?.medical_conditions?.join(', ') || 'None recorded',
      allergies: userData.profile?.allergies?.join(', ') || 'None recorded',
      emergency_contact: userData.profile?.emergency_contact || 'Not specified',
      medication_count: userData.medications?.length || 0,
      appointment_count: userData.appointments?.length || 0,
    };
    
    // Process medications (up to 5)
    const medications = userData.medications || [];
    for (let i = 1; i <= 5; i++) {
      if (i <= medications.length) {
        vars[`med${i}_name`] = medications[i-1].name;
        vars[`med${i}_dosage`] = medications[i-1].dosage;
        vars[`med${i}_frequency`] = medications[i-1].frequency;
        vars[`med${i}_doctor`] = medications[i-1].prescribing_doctor || 'Not specified';
        vars[`med${i}_notes`] = medications[i-1].notes || 'None';
      } else {
        vars[`med${i}_name`] = 'none';
        vars[`med${i}_dosage`] = 'none';
        vars[`med${i}_frequency`] = 'none';
        vars[`med${i}_doctor`] = 'none';
        vars[`med${i}_notes`] = 'none';
      }
    }
    
    // Process appointments (up to 3)
    const appointments = userData.appointments || [];
    
    // Format next appointment (index 0)
    if (appointments.length > 0) {
      const nextAppt = appointments[0];
      const apptDate = nextAppt.appointment_date ? new Date(nextAppt.appointment_date) : null;
      
      vars.next_appointment_date = apptDate ? apptDate.toLocaleDateString() : 'not specified';
      vars.next_appointment_doctor = nextAppt.doctor_name || 'not specified';
      vars.next_appointment_location = nextAppt.location || 'not specified';
      vars.next_appointment_purpose = nextAppt.title || 'not specified';
    } else {
      vars.next_appointment_date = 'none scheduled';
      vars.next_appointment_doctor = 'none';
      vars.next_appointment_location = 'none';
      vars.next_appointment_purpose = 'none';
    }
    
    // Process additional appointments
    for (let i = 2; i <= 3; i++) {
      if (i <= appointments.length) {
        const appt = appointments[i-1];
        const apptDate = appt.appointment_date ? new Date(appt.appointment_date) : null;
        
        vars[`apt${i}_date`] = apptDate ? apptDate.toLocaleDateString() : 'not specified';
        vars[`apt${i}_doctor`] = appt.doctor_name || 'not specified';
        vars[`apt${i}_location`] = appt.location || 'not specified';
        vars[`apt${i}_purpose`] = appt.title || 'not specified';
      } else {
        vars[`apt${i}_date`] = 'none';
        vars[`apt${i}_doctor`] = 'none';
        vars[`apt${i}_location`] = 'none';
        vars[`apt${i}_purpose`] = 'none';
      }
    }
    
    return vars;
  };

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        AccessibilityInfo.announceForAccessibility('Microphone permission is needed to use voice features.');
        alert('Microphone permission is needed to use voice features.');
        return;
      }

      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Show loading state
      setIsLoadingData(true);
      AccessibilityInfo.announceForAccessibility('Loading your health data...');

      // Fetch user data
      const userData = await fetchUserData();

      // Get the dynamic variables
      const dynamicVariables = prepareDynamicVariables(userData);
      
      console.log('Starting conversation with dynamic variables:', dynamicVariables);

      // Hide loading state
      setIsLoadingData(false);

      // Start the conversation with your agent (using same agent ID as web app)
      await conversation.startSession({
        agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'mW5EqEQKH3n04CZsF8Ds',
        dynamicVariables: dynamicVariables,
        clientTools: {
          get_battery_level,
          change_brightness,
          flash_screen,
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsLoadingData(false);
      AccessibilityInfo.announceForAccessibility('Failed to start voice assistant. Please try again.');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await conversation.endSession();
  }, [conversation]);

  return (
    <Pressable
      style={[
        styles.callButton, 
        conversation.status === 'connected' && styles.callButtonActive,
        isLoadingData && styles.callButtonLoading
      ]}
      onPress={
        isLoadingData 
          ? undefined 
          : conversation.status === 'disconnected' 
            ? startConversation 
            : stopConversation
      }
      accessible={true}
      accessibilityLabel={
        isLoadingData 
          ? 'Loading health data...' 
          : conversation.status === 'connected' 
            ? 'Stop voice assistant' 
            : 'Start voice assistant'
      }
      accessibilityHint="Double tap to toggle voice assistant"
      accessibilityRole="button"
      disabled={isLoadingData}
    >
      <View
        style={[
          styles.buttonInner,
          conversation.status === 'connected' && styles.buttonInnerActive,
          isLoadingData && styles.buttonInnerLoading,
        ]}
      >
        <Mic 
          size={40} 
          color="#FFFFFF" 
          strokeWidth={2} 
          style={[
            styles.buttonIcon,
            isLoadingData && styles.buttonIconLoading
          ]} 
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  callButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  callButtonLoading: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  buttonInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonInnerActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonInnerLoading: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
  buttonIconLoading: {
    opacity: 0.5,
  },
});
