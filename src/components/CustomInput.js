import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';
import { useFonts } from 'expo-font';

const CustomInput = ({ placeholder, secureTextEntry, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [fontsLoaded] = useFonts({
    'CG-Regular': require('../../assets/fonts/ClashGrotesk-Regular.otf'),
    'CG-Bold': require('../../assets/fonts/ClashGrotesk-Bold.otf'),
    'CG-Semibold': require('../../assets/fonts/ClashGrotesk-Semibold.otf'),
    'CG-Medium': require('../../assets/fonts/ClashGrotesk-Medium.otf'),
  });

  return (
    <TextInput
      style={[styles.input, isFocused && styles.inputFocused]}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      placeholderTextColor={ColorPalette.text_light}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: ColorPalette.light_bg,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderColor: ColorPalette.grey_text,
    borderWidth: 1,
  },
  inputFocused: {
    borderColor: ColorPalette.green,
    borderWidth: 1.5,
  },
});

export default CustomInput;
