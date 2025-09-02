import React from 'react';
import { 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  View 
} from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

/**
 * A common layout component for consistent spacing and status bar handling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.backgroundColor - Background color for the screen
 * @param {string} props.statusBarStyle - Style for status bar ('light-content' or 'dark-content')
 * @param {Object} props.style - Additional styles for the container
 * @returns {React.ReactElement} Wrapped components with consistent layout
 */
const ScreenLayout = ({ 
  children, 
  backgroundColor = ColorPalette.main_black,
  statusBarStyle = 'light-content',
  style
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor} 
        translucent={false} 
      />
      <View style={[styles.container, { backgroundColor }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 30,
  },
});

export default ScreenLayout;
