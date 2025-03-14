import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './src/navigation/tabNavigation/TabNavigation';
import { StatusBar } from 'react-native';
import ColorPalette from './src/constants/ColorPalette';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={ColorPalette.main_black} barStyle="light-content" />
      <TabNavigation />
    </NavigationContainer>
  );
}
