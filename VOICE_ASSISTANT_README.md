# Voice Assistant Instructions

## Setup and Run

1. Install all dependencies:
   ```
   npm install
   ```

2. Configure your ElevenLabs Agent:
   - Create a new agent on the ElevenLabs platform (https://elevenlabs.io)
   - Set up the system prompt and first message as shown in the documentation
   - Configure client tools for battery level, brightness control, and screen flashing
   - Copy your agent ID to the `utils/config.ts` file

3. Start the app with tunnel option (for HTTPS):
   ```
   npx expo start --tunnel
   ```

4. Run on device or simulator:
   ```
   npx expo run:ios
   ```
   or
   ```
   npx expo run:android
   ```

## Troubleshooting

### Microphone Access Issues

- For Web: Make sure you're using HTTPS or localhost
- For iOS/Android: Grant microphone permissions in device settings
- Check app.json permissions configuration

### Agent Connection Issues

- Verify your agent ID in config.ts
- Check network connectivity
- Look at console logs for detailed error messages

## Using the Voice Assistant

Tap the microphone button to start the voice assistant. You can ask:

- "What's my battery level?"
- "Change my screen brightness to 80%"
- "Flash my screen"
- Other health-related questions

Tap the button again to stop the voice assistant.
