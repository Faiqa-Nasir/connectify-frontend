import { BASE_URL, AUTH_ENDPOINTS } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    console.log('Login successful');
    
    // Store tokens and user data
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    console.error('Login error details:', error);
    if (error.name === 'AbortError') {
      throw new Error('Login request timed out. Check your network connection.');
    }
    throw error;
  }
};

// Refresh token
export const refreshToken = async (refreshToken) => {
  try {
    const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }
    
    // Store new access token
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
    
    return data;
  } catch (error) {
    throw error;
  }
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
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
