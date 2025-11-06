# AERIE UAS Reporting - Mobile App

React Native mobile application for UAS (Unmanned Aircraft Systems) sighting reporting.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- Physical device with Expo Go app installed (for testing on real devices)

## Installation

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Install additional dependencies for React Native:
```bash
npm install @react-native-picker/picker react-native-vector-icons
```

3. For iOS (if developing for iOS):
```bash
cd ios
pod install
cd ..
```

## Configuration

1. Update API URL in `src/config/api.js`:
   - For development on physical device: Use your computer's local IP address (e.g., `http://192.168.1.100:8000`)
   - For production: Update with your production API URL

2. Update app configuration in `app.json`:
   - Bundle identifier (iOS)
   - Package name (Android)
   - App name and version

## Running the App

### Development Mode

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your physical device

### Building for Production

#### iOS
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

## Features

- **Report Sightings**: Submit UAS sightings with location, photos, and descriptions
- **View Sightings**: Browse and search all reported sightings
- **Map Visualization**: View sightings on an interactive map
- **AI Analysis**: Chat with AI assistant for sighting analysis
- **Offline Support**: Forms saved locally using AsyncStorage
- **Camera Integration**: Take photos directly from the app
- **GPS Integration**: Get current location automatically

## Project Structure

```
mobile/
├── App.js                 # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── config/
│   │   └── api.js        # API configuration
│   ├── components/
│   │   └── UnitSelectionModal.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── SightingsScreen.js
│   │   ├── MapScreen.js
│   │   ├── AnalysisScreen.js
│   │   └── AdminScreen.js
│   └── utils/
│       ├── storage.js    # AsyncStorage utilities
│       ├── location.js   # Location services
│       └── camera.js     # Camera utilities
```

## Backend Connection

The mobile app connects to the same FastAPI backend as the web application. Make sure:

1. Backend is running and accessible
2. CORS is configured to allow mobile app requests
3. API URL is correctly configured in `src/config/api.js`

## Permissions

The app requires the following permissions:
- **Location**: For GPS coordinates when reporting sightings
- **Camera**: For taking photos of UAS sightings
- **Media Library**: For selecting photos from gallery

These permissions are requested at runtime when needed.

## Troubleshooting

### API Connection Issues
- Ensure backend is running
- Check API URL in `src/config/api.js`
- For physical device testing, use your computer's local IP instead of `localhost`
- Ensure backend CORS allows requests from your device

### Build Issues
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

### Location Services
- Ensure location permissions are granted
- Check device location settings
- For iOS simulator, set a location in Features > Location

## Notes

- The app uses Expo for easier development and deployment
- For production builds, consider using EAS Build (Expo Application Services)
- Some features (like Word document export) are not available in mobile app
- Admin panel is simplified for mobile interface

