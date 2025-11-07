import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  SAVED_FORMS: 'uas_saved_forms',
};

// Save forms
export const saveForm = async (formData) => {
  try {
    const savedForms = await getSavedForms();
    savedForms.push({
      ...formData,
      saved_at: new Date().toISOString(),
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(savedForms));
    return true;
  } catch (error) {
    console.error('Error saving form:', error);
    return false;
  }
};

// Get saved forms
export const getSavedForms = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_FORMS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved forms:', error);
    return [];
  }
};


