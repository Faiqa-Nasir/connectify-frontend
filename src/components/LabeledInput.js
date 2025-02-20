import React,{useState} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import ColorPalette from "../constants/ColorPalette";

const LabeledInput = ({ label, placeholder, secureTextEntry, onChangeText, rightIcon }) => {
  
    const [isFocused, setIsFocused] = useState(false);
    return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
      style={[styles.input, isFocused && styles.inputFocused]}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: ColorPalette.text_gray,
    marginBottom: 5,
    fontFamily: 'CG-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.light_bg,

    borderRadius: 10,
    borderColor: ColorPalette.grey_text,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    padding: 15,
    fontFamily: 'CG-Medium',
  },
  iconContainer: {
    padding: 10,
  },
  inputFocused: {
      borderColor: ColorPalette.green,
      borderWidth: 1,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,    
  },

});

export default LabeledInput;