import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

const LoadingIndicator = ({ 
  size = 'large', 
  color = ColorPalette.green, 
  fullScreen = false,
  message = '',
  overlay = false,
  style = {}
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? <Text style={styles.loadingText}>{message}</Text> : null}
      </View>
    );
  }
  
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? <Text style={styles.loadingText}>{message}</Text> : null}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.loadingText}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorPalette.main_black,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 20,
    borderRadius: 12,
  },
  loadingText: {
    color: ColorPalette.white,
    marginTop: 12,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  }
});

export default LoadingIndicator;
