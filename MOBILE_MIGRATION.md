# Mobile App Migration Guide

This document outlines the changes made to convert the UAS Reporting web application to a mobile app.

## Overview

The application has been refactored to support both web and mobile platforms. The mobile app is built using React Native with Expo, while the backend remains unchanged and serves both web and mobile clients.

## Key Changes

### 1. Project Structure

A new `mobile/` directory has been created containing the React Native mobile application:

```
mobile/
├── App.js                    # Main app with navigation
├── app.json                  # Expo configuration
├── package.json              # Mobile dependencies
├── babel.config.js           # Babel configuration
├── src/
│   ├── config/
│   │   └── api.js            # API endpoint configuration
│   ├── components/
│   │   └── UnitSelectionModal.js
│   ├── screens/
│   │   ├── HomeScreen.js     # Report sightings
│   │   ├── SightingsScreen.js # View 10 most recent sightings
│   │   └── MapScreen.js      # Interactive map
│   └── utils/
│       ├── storage.js        # AsyncStorage utilities
│       ├── location.js       # GPS/location services
│       └── camera.js         # Camera integration
```

### 2. Technology Stack Changes

#### Web → Mobile Replacements

| Web Technology | Mobile Replacement | Purpose |
|---------------|-------------------|---------|
| `react-router-dom` | `@react-navigation/native` | Navigation |
| `leaflet` / `react-leaflet` | `react-native-maps` | Maps |
| `localStorage` | `@react-native-async-storage/async-storage` | Data persistence |
| HTML `<input type="file">` | `expo-image-picker` / `expo-camera` | Photo capture |
| Browser geolocation API | `expo-location` | GPS coordinates |
| CSS | StyleSheet (React Native) | Styling |

### 3. Component Architecture

#### Navigation
- **Web**: Uses `BrowserRouter` with `Routes` and `Route` components
- **Mobile**: Uses `NavigationContainer` with `BottomTabNavigator` for tab-based navigation

#### Forms
- **Web**: Standard HTML form elements (`<input>`, `<select>`, `<textarea>`)
- **Mobile**: React Native components (`TextInput`, `Picker`, `TouchableOpacity`)

#### Maps
- **Web**: Leaflet with OpenStreetMap tiles
- **Mobile**: React Native Maps with native map providers

### 4. Mobile-Specific Features

#### Camera Integration
- Direct camera access via `expo-camera`
- Photo library selection via `expo-image-picker`
- Automatic image upload to backend

#### Location Services
- GPS coordinate capture using `expo-location`
- Reverse geocoding for address lookup
- Automatic location permission handling

#### Offline Support
- Forms saved locally using AsyncStorage
- Data syncs when connection is restored

### 5. Backend Changes

#### CORS Configuration
Updated `backend/main.py` to allow mobile app connections:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Web app origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Note**: For production, update `allow_origins` to include your production web app URLs for security.

### 6. API Configuration

The mobile app uses the same FastAPI backend. Update the API URL in `mobile/src/config/api.js`:

```javascript
const API_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8000'  // For physical device testing
  : 'https://your-production-api.com';
```

**Important**: When testing on a physical device, use your computer's local IP address instead of `localhost`.

## Running the Mobile App

### Prerequisites
1. Install Node.js (v18+)
2. Install Expo CLI: `npm install -g expo-cli`
3. Install dependencies: `cd mobile && npm install`

### Development
```bash
cd mobile
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

### Building for Production
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Feature Parity

### ✅ Implemented
- Report sightings with photos
- View 10 most recent sightings (no search)
- Map visualization with circle search
- Unit selection
- Form saving (local storage)
- GPS location capture
- Camera integration

### ❌ Not Available on Mobile
- AI Analysis / LLM chat (removed)
- Admin panel (removed)
- Advanced search functionality (removed)
- Word document export (not available on mobile)
- MoW map integration (web uses Leaflet, mobile uses react-native-maps)

## Testing Checklist

- [ ] Install dependencies: `cd mobile && npm install`
- [ ] Update API URL in `src/config/api.js`
- [ ] Start backend: `docker-compose up` or `python -m uvicorn backend.main:app`
- [ ] Start mobile app: `cd mobile && npm start`
- [ ] Test on simulator/emulator or physical device
- [ ] Verify location permissions
- [ ] Test camera functionality
- [ ] Test form submission
- [ ] Test map visualization

## Troubleshooting

### API Connection Issues
- Ensure backend is running
- Check API URL configuration
- For physical devices, use local IP instead of `localhost`
- Verify CORS settings in backend

### Build Issues
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

### Location Services
- Grant location permissions when prompted
- Check device location settings
- For iOS simulator, set location in Features > Location

## Next Steps

1. **Production Deployment**:
   - Update CORS to specific origins
   - Configure production API URL
   - Set up app store accounts (iOS/Android)

2. **Enhanced Features**:
   - Push notifications
   - Enhanced offline sync
   - Performance optimization

3. **Testing**:
   - Device testing on iOS and Android
   - Performance optimization
   - Battery usage optimization

## Notes

- The mobile app shares the same backend API as the web application
- Both web and mobile apps can run simultaneously
- Data is synchronized through the shared backend
- Mobile app uses native device features (camera, GPS) for better UX

