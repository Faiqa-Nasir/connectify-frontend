import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/redux/store'; // Make sure you have this file
import Navigator from './src/navigation/Navigator';
import ColorPalette from './src/constants/ColorPalette';
import { getStoredTokens } from './src/services/tokenService';
import { restoreToken } from './src/redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Component to handle bootstrap process
const Bootstrap = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Check for tokens in storage
        const tokens = await getStoredTokens();
        const userString = await AsyncStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        // If tokens exist, restore auth state
        if (tokens && tokens.access) {
          dispatch(restoreToken({ tokens, user }));
          console.log('Auth state restored from storage');
        } else {
          console.log('No tokens found in storage');
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: ColorPalette.white }}>
        <ActivityIndicator size="large" color={ColorPalette.green} />
      </View>
    );
  }

  return children;
};

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar backgroundColor={ColorPalette.main_black} barStyle="light-content" />
        <Bootstrap>
          <Navigator />
        </Bootstrap>
      </NavigationContainer>
    </Provider>
  );
}
