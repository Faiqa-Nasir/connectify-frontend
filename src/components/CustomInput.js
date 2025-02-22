import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import ColorPalette from '../constants/ColorPalette';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons/';

const CustomInput = ({ placeholder, secureTextEntry, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [fontsLoaded] = useFonts({
    'CG-Regular': require('../../assets/fonts/ClashGrotesk-Regular.otf'),
    'CG-Bold': require('../../assets/fonts/ClashGrotesk-Bold.otf'),
    'CG-Semibold': require('../../assets/fonts/ClashGrotesk-Semibold.otf'),
    'CG-Medium': require('../../assets/fonts/ClashGrotesk-Medium.otf'),
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && isPasswordVisible}
        onChangeText={onChangeText}
        placeholderTextColor={ColorPalette.text_light}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity style={styles.iconContainer} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <MaterialIcons 
            name={isPasswordVisible ? "visibility" : "visibility-off"} 
            size={24} 
            color={ColorPalette.grey_text} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.light_bg,
    borderRadius: 10,
    marginVertical: 10,
    borderColor: ColorPalette.grey_text,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 15,
  },
  inputFocused: {
    borderColor: ColorPalette.green,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  iconContainer: {
    padding: 10,
  },
});

export default CustomInput;
