import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'user_data';

/**
 * Fetches the current user data from AsyncStorage
 * @returns {Promise<Object|null>} The user data object or null if not found
 */
export const fetchUserData = async () => {
  try {
    const storedData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Updates the user data in AsyncStorage
 * @param {Object} newData - The new data to merge with existing user data
 * @returns {Promise<Object>} The updated user data object
 * @throws {Error} If there is an error during the update process
 */
export const updateUserData = async (newData) => {
  try {
    // Get existing data
    const existingData = await fetchUserData();

    // Merge existing and new data
    const updatedData = {
      ...existingData,
      ...newData,
    };

    // Store updated data
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedData));

    return updatedData;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};
