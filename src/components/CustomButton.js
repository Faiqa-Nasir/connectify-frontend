import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import ColorPalette from '../constants/ColorPalette';
import { useFonts } from 'expo-font';
const CustomButton = ({ title, onPress, backgroundColor = ColorPalette.green, textColor = ColorPalette.white, icon }) => {
    const [fontsLoaded] = useFonts({
 'CG-Medium': require('../../assets/fonts/ClashGrotesk-Medium.otf'),
      });
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor }]} onPress={onPress}>
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
});

export default CustomButton;
