// Mock tools for ElevenLabs integration
// These are basic implementations for demo purposes

const get_battery_level = async () => {
  console.log('Mock: Getting battery level');
  // In a real implementation, this would use a library like expo-battery
  return { level: 0.85 }; // Return mock battery level of 85%
};

const change_brightness = async (params: { level: number }) => {
  console.log('Mock: Changing brightness to', params.level);
  // In a real implementation, this would use a library like expo-brightness
  return { success: true };
};

const flash_screen = async () => {
  console.log('Mock: Flashing screen');
  // In a real implementation, this might animate a view to flash
  return { success: true };
};

export default {
  get_battery_level,
  change_brightness,
  flash_screen,
};
