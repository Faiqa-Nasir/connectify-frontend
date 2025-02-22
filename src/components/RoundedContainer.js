import React from 'react';
import { View, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const RoundedContainer = ({ children, backgroundColor }) => {
  return (
    <View style={[styles.container, { backgroundColor: backgroundColor ? backgroundColor : ColorPalette.light_bg }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 20,
    maxHeight: '70%',
    width: '100%',
  },
});

export default RoundedContainer;
