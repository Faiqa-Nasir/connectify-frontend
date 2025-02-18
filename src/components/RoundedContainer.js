import React from 'react';
import { View, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const RoundedContainer = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.light_bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 20,
    maxHeight: '70%',
    width: '100%',
    paddingTop:50,
  },
});

export default RoundedContainer;
