import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredTokens } from '../services/tokenService';
import axios from 'axios';
import { BASE_URL, USER_ENDPOINTS } from '../constants/ApiConstants';

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

/**
 * Loads or refreshes user data from API and stores it in AsyncStorage
 * This should be called immediately after login or when the app opens
 * @returns {Promise<Object|null>} The user data object or null if failed
 */
export const initializeUserData = async () => {
  try {
    // Check if we have valid tokens
    const tokens = await getStoredTokens();
    if (!tokens || !tokens.access) {
      console.log('No valid tokens found, cannot initialize user data');
      return null;
    }
    
    // Fetch user data from API
    const response = await axios.get(`${BASE_URL}${USER_ENDPOINTS.PROFILE}`, {
      headers: {
        Authorization: `Bearer ${tokens.access}`
      }
    });
    
    if (response.data) {
      // Store user data in AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
      console.log('User data initialized successfully');
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing user data:', error);
    
    // If we fail but have cached data, return that instead
    try {
      const cachedData = await fetchUserData();
      return cachedData;
    } catch (e) {
      return null;
    }
  }
};

/**
 * Clears all user data from AsyncStorage
 * This should be called during logout
 * @returns {Promise<void>}
 */
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
