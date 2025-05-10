import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ColorPalette from '../constants/ColorPalette';


const CustomCheckbox = ({ value, onValueChange }) => {

  return (
    <TouchableOpacity onPress={() => onValueChange(!value)} style={styles.checkboxContainer}>
      <View style={[styles.checkbox, value && styles.checked]}>
        {value && <MaterialIcons name="check" size={10} color={ColorPalette.white} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderColor: ColorPalette.text_black,
    backgroundColor: ColorPalette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: ColorPalette.text_black,
  },
});

export default CustomCheckbox;
