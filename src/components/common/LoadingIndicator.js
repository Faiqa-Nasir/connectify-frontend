import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

const LoadingIndicator = ({ 
  size = 'large', 
  color = ColorPalette.green, 
  message = '', 
  fullScreen = false,
  overlay = false,
  style = {}
}) => {
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          {message ? <Text style={styles.overlayMessage}>{message}</Text> : null}
        </View>
      </View>
    );
  }

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    backgroundColor: ColorPalette.dark_bg,
  },
  message: {
    marginTop: 10,
    color: ColorPalette.white,
    fontSize: 14,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: ColorPalette.bg,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  overlayMessage: {
    marginTop: 10,
    color: ColorPalette.white,
    fontSize: 14,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
});

export default LoadingIndicator;
