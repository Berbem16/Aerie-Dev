import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';

// Request camera permissions
export const requestCameraPermission = async () => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Camera permission denied' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Request media library permissions
export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Media library permission denied' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Take a photo with camera
export const takePhoto = async () => {
  try {
    const permissionResult = await requestCameraPermission();
    if (!permissionResult.success) {
      return permissionResult;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return {
        success: true,
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
    }

    return { success: false, error: 'Photo capture cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Pick image from gallery
export const pickImage = async () => {
  try {
    const permissionResult = await requestMediaLibraryPermission();
    if (!permissionResult.success) {
      return permissionResult;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return {
        success: true,
        images: result.assets.map((asset) => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        })),
      };
    }

    return { success: false, error: 'Image selection cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

