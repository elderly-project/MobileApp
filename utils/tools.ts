// Mock tools for ElevenLabs integration
// These are basic implementations for demo purposes

const get_battery_level = async () => {
  console.log('Mock: Getting battery level');
  // In a real implementation, this would use a library like expo-battery
  return 0.85; // Return mock battery level of 85%
};

const change_brightness = async (params: { level: number }) => {
  console.log('Mock: Changing brightness to', params.level);
  // In a real implementation, this would use a library like expo-brightness
  return 'Brightness changed';
};

const flash_screen = async () => {
  console.log('Mock: Flashing screen');
  // In a real implementation, this might animate a view to flash
  return 'Screen flashed';
};

export default {
  get_battery_level,
  change_brightness,
  flash_screen,
};
