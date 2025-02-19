import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';
import { useFonts } from 'expo-font';
const CustomInput = ({ placeholder, secureTextEntry, onChangeText }) => {
      const [fontsLoaded] = useFonts({
          'CG-Regular': require('../../assets/fonts/ClashGrotesk-Regular.otf'),
          'CG-Bold': require('../../assets/fonts/ClashGrotesk-Bold.otf'),
          'CG-Semibold': require('../../assets/fonts/ClashGrotesk-Semibold.otf'),
          'CG-Medium': require('../../assets/fonts/ClashGrotesk-Medium.otf'),
        });
    return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      onChangeText={onChangeText}
      placeholderTextColor={ColorPalette.text_light}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: ColorPalette.white,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderColor: ColorPalette.grey_text,
  },
});

export default CustomInput;
