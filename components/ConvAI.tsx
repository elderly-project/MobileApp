'use dom';

import { useConversation } from '@11labs/react';
import { Mic } from 'lucide-react-native';
import { useCallback } from 'react';
import { View, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

import tools from '../utils/tools';

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

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: 'agent_01jw21p1h0e4dsfnv17dxwrspw',
        dynamicVariables: {
          platform,
        },
        clientTools: {
          get_battery_level,
          change_brightness,
          flash_screen,
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      AccessibilityInfo.announceForAccessibility('Failed to start voice assistant. Please try again.');
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await conversation.endSession();
  }, [conversation]);

  return (
    <Pressable
      style={[styles.callButton, conversation.status === 'connected' && styles.callButtonActive]}
      onPress={conversation.status === 'disconnected' ? startConversation : stopConversation}
      accessible={true}
      accessibilityLabel={conversation.status === 'connected' ? 'Stop voice assistant' : 'Start voice assistant'}
      accessibilityHint="Double tap to toggle voice assistant"
      accessibilityRole="button"
    >
      <View
        style={[
          styles.buttonInner,
          conversation.status === 'connected' && styles.buttonInnerActive,
        ]}
      >
        <Mic size={40} color="#FFFFFF" strokeWidth={2} style={styles.buttonIcon} />
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
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
});
