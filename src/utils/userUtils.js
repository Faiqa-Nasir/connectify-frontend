import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fetches the current user data from AsyncStorage
 * @returns {Promise<Object|null>} The user data object or null if not found
 */
export const fetchUserData = async () => {
  try {
    const userJSON = await AsyncStorage.getItem('user');
    if (userJSON) {
      return JSON.parse(userJSON);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  return null;
};

/**
 * Updates the user data in AsyncStorage
 * @param {Object} userData - The user data to store
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const updateUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};
