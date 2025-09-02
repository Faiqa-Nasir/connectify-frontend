import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateTokens, logout } from './redux/authSlice';

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Note: Token restoration is now handled in Navigator component's bootstrap
    
    // Listen for token refresh events from apiService
    const handleTokenRefreshed = (event) => {
      console.log('Token refreshed event received:', event.detail);
      dispatch(updateTokens(event.detail));
    };
    
    // Listen for auth errors that require logout
    const handleAuthError = () => {
      dispatch(logout());
    };
    
    // Listen for explicit logout events
    const handleAuthLogout = () => {
      console.log('Auth logout event received');
      dispatch(logout());
    };
    
    // Add event listeners
    window.addEventListener('token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('auth-logout', handleAuthLogout);
    
    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [dispatch]);

  // ...existing code...
};

export default App;