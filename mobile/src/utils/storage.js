import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  SAVED_FORMS: 'uas_saved_forms',
  CHAT_HISTORY: 'uas_chat_history',
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

// Save chat history
export const saveChatHistory = async (messages) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error('Error saving chat history:', error);
    return false;
  }
};

// Get chat history
export const getChatHistory = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Clear chat history
export const clearChatHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }
};

