import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { AUTH_ENDPOINTS } from '../constants/ApiConstants';
import axios from 'axios';

/**
 * Check if the access token is expired
 * @param {string} token - The access token to check
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    console.log('Token decoded with library:', decoded);
    
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Add a buffer of 30 seconds to refresh before actual expiration
    const isExpired = decoded.exp < currentTime + 30;
    console.log(`Token expires at ${new Date(decoded.exp * 1000).toLocaleString()}, current time is ${new Date(currentTime * 1000).toLocaleString()}, isExpired: ${isExpired}`);
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If there's any error, consider the token expired
  }
};

/**
 * Directly refresh token through API call
 * @param {string} refreshToken - The refresh token to use
 * @returns {Promise<{access: string, refresh: string}>} - New tokens
 */
export const refreshTokenAPI = async (refreshToken) => {
  try {
    const response = await axios.post(BASE_URL + AUTH_ENDPOINTS.REFRESH, {
      refresh: refreshToken
    });
    
    return {
      access: response.data.access,
      refresh: response.data.refresh || refreshToken
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Get stored tokens from AsyncStorage
 * @returns {Promise<{access: string, refresh: string}|null>}
 */
export const getStoredTokens = async () => {
  try {
    const tokensString = await AsyncStorage.getItem('tokens');
    return tokensString ? JSON.parse(tokensString) : null;
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    return null;
  }
};

/**
 * Store tokens in AsyncStorage
 * @param {Object} tokens - The tokens to store
 * @returns {Promise<void>}
 */
export const storeTokens = async (tokens) => {
  try {
    await AsyncStorage.setItem('tokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

/**
 * Remove tokens from AsyncStorage
 * @returns {Promise<void>}
 */
export const removeTokens = async () => {
  try {
    await AsyncStorage.removeItem('tokens');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

/**
 * Get user ID from token
 * @param {string} token - The access token
 * @returns {number|null} - User ID or null if not found
 */
export const getUserIdFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.user_id || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};

/**
 * Get token expiration date
 * @param {string} token - The token to check
 * @returns {Date|null} - Expiration date or null if not found
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};
