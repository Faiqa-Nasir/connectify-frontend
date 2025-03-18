import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreToken, updateTokens, logout } from './redux/authSlice';
import { getStoredTokens } from './services/tokenService';

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const [userString, tokens] = await Promise.all([
          AsyncStorage.getItem('user'),
          getStoredTokens()
        ]);
        
        if (userString && tokens) {
          const user = JSON.parse(userString);
          dispatch(restoreToken({ user, tokens }));
        }
      } catch (e) {
        console.error('Failed to load auth state:', e);
      }
    };
    
    loadStoredCredentials();
    
    // Listen for token refresh events from apiService
    const handleTokenRefreshed = (event) => {
      dispatch(updateTokens(event.detail));
    };
    
    // Listen for auth errors that require logout
    const handleAuthError = () => {
      dispatch(logout());
    };
    
    // Add event listeners
    window.addEventListener('token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth-error', handleAuthError);
    
    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [dispatch]);
  
  // ...existing code...
};

export default App;