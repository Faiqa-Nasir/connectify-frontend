import { BASE_URL, AUTH_ENDPOINTS } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { storeTokens, removeTokens } from './tokenService';

// Keys for storing tokens and user data
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Test the API connection
export const testApiConnection = async () => {
  try {
    console.log(`Testing connection to: ${BASE_URL}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return {
      success: true,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('API Connection Test Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      name: error.name
    };
  }
};

/**
 * Directly refresh token through API call with improved error handling
 * @param {string} refreshToken - The refresh token to use
 * @returns {Promise<{access: string, refresh: string}>} - New tokens
 */
export const refreshTokenAPI = async (refreshToken) => {
  try {
    // Make sure we have the correct refresh token endpoint
    const refreshEndpoint = AUTH_ENDPOINTS.REFRESH || AUTH_ENDPOINTS.REFRESH_TOKEN;
    console.log(`Attempting to refresh token at: ${BASE_URL}${refreshEndpoint}`);
    
    // Create a new axios instance for this specific request to avoid circular dependencies
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}${refreshEndpoint}`,
      data: { refresh: refreshToken },
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000, // 10 second timeout
    });
    
    console.log('Token refresh successful');
    
    const newTokens = {
      access: response.data.access,
      refresh: response.data.refresh || refreshToken
    };
    
    // Store tokens in both formats for compatibility
    await storeTokens(newTokens);
    
    // Also store in individual keys for other parts of the app
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.access);
    if (newTokens.refresh) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refresh);
    }
    
    return newTokens;
  } catch (error) {
    console.error('Error refreshing token details:', error);
    
    if (error.response && error.response.status === 401) {
      console.log('Refresh token is invalid or expired, forcing logout');
      // Clear all tokens since refresh token is invalid
      await logout();
      throw new Error('Authentication expired. Please login again.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Token refresh request timed out. Check network connection.');
    } else if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      throw new Error(`Token refresh failed with status: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received when refreshing token. Check network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

// Login user with username/email and password
export const loginUser = async (login, password) => {
  try {
    console.log(`Attempting to login at: ${BASE_URL}${AUTH_ENDPOINTS.LOGIN}`);
    console.log('Login payload:', { login });
    
    // Test connection first
    const connectionTest = await testApiConnection();
    console.log('Connection test result:', connectionTest);
    
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.error}`);
    }
    
    // First, clear any existing tokens to prevent conflicts
    await removeTokens();
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ login, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      console.error('Login error:', data);
      throw new Error(data.error || `Login failed with status: ${response.status}`);
    }
    
    console.log('Login successful, storing tokens');
    
    // Make sure we have both tokens
    if (!data.access || !data.refresh) {
      throw new Error('Login response missing tokens');
    }
    
    const newTokens = {
      access: data.access,
      refresh: data.refresh
    };
    
    // Store in both formats
    await storeTokens(newTokens);
    
    // Store tokens and user data in individual keys too
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
    
    if (data.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    
    console.log('Tokens stored successfully');
    
    // Notify app that tokens have been refreshed
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('token-refreshed', { 
        detail: newTokens 
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Login error details:', error);
    if (error.name === 'AbortError') {
      throw new Error('Login request timed out. Check your network connection.');
    }
    throw error;
  }
};

// Refresh token (using the existing function but updated)
export const refreshToken = async (refreshToken) => {
  // Use the refreshTokenAPI function instead of duplicating code
  return await refreshTokenAPI(refreshToken);
};

// Get stored user data
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Clear auth data on logout
export const logout = async () => {
  try {
    console.log('Performing logout, clearing all tokens');
    
    // Clear tokens in both storage formats
    await removeTokens();
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      'user',
      'tokens'
    ]);
    
    // Also clear workspace selection
    await AsyncStorage.removeItem('selectedWorkspace');
    
    console.log('Logout complete, tokens cleared');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
