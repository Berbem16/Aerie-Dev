import * as Location from 'expo-location';

// Request location permissions
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Location permission denied' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current location
export const getCurrentLocation = async () => {
  try {
    const permissionResult = await requestLocationPermission();
    if (!permissionResult.success) {
      return permissionResult;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses && addresses.length > 0) {
      const address = addresses[0];
      const parts = [
        address.street,
        address.city,
        address.region,
        address.country,
      ].filter(Boolean);
      return parts.join(', ');
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Geocode address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const locations = await Location.geocodeAsync(address);
    if (locations && locations.length > 0) {
      const location = locations[0];
      return {
        success: true,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address,
      };
    }
    return { success: false, error: 'Location not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

