import axios from 'axios';
import { BASE_URL } from '../constants/ApiConstants';
import { isTokenExpired, refreshTokenAPI, getStoredTokens } from './tokenService';

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to track if we're refreshing a token
let isRefreshing = false;
// Queue of requests that are waiting for the token to be refreshed
let failedQueue = [];

// Process failed queue - execute or reject pending requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to refresh the token and get a new access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const newTokens = await refreshTokenAPI(refreshToken);
    
    // Dispatch is now handled in the refresh token function
    return newTokens;
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    throw error;
  }
};

// Add request interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      // Get tokens directly from AsyncStorage instead of Redux store
      const tokens = await getStoredTokens();
      
      if (tokens?.access) {
        // Check if token is expired
        const needsRefresh = isTokenExpired(tokens.access);
        
        // If the access token is expired and not already refreshing, refresh it
        if (needsRefresh && !isRefreshing) {
          isRefreshing = true;
          
          try {
            // Get a new access token
            const newTokens = await refreshAccessToken(tokens.refresh);
            
            // Update the request Authorization header with new token
            config.headers.Authorization = `Bearer ${newTokens.access}`;
            
            // Notify Redux store through a custom event
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('token-refreshed', { 
                detail: newTokens 
              }));
            }
            
            // Process any requests that were waiting for the token refresh
            processQueue(null, newTokens.access);
          } catch (error) {
            processQueue(error, null);
            
            // Emit logout event if refresh failed
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('auth-error', { 
                detail: { message: 'Token refresh failed' } 
              }));
            }
            
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Token is valid or we're already refreshing, set the Authorization header
          config.headers.Authorization = `Bearer ${tokens.access}`;
        }
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is not 401 or the request has already been retried, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Mark the request as retried to prevent infinite loops
    originalRequest._retry = true;
    
    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    
    isRefreshing = true;
    
    try {
      // Get tokens directly from AsyncStorage
      const tokens = await getStoredTokens();
      
      if (!tokens?.refresh) {
        throw new Error('No refresh token available');
      }
      
      // Refresh token
      const newTokens = await refreshAccessToken(tokens.refresh);
      
      // Update the authorization header and retry the request
      originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
      
      // Notify Redux store through a custom event
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('token-refreshed', { 
          detail: newTokens 
        }));
      }
      
      // Process any queued requests
      processQueue(null, newTokens.access);
      
      // Retry the original request
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Emit logout event
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: { message: 'Token refresh failed' } 
        }));
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
