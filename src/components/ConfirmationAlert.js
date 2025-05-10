import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const ConfirmationAlert = ({ 
  visible, 
  message, 
  onCancel, 
  onConfirm, 
  cancelText = "Cancel", 
  confirmText = "Confirm",
  confirmColor = "#FF4D4F",  // Default: red color for destructive actions
  cancelColor = ColorPalette.grey_text
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.alertContainer}>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: cancelColor }]}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: confirmColor }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: ColorPalette.background_dark || '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorPalette.border_color || '#2A2A2A',
  },
  message: {
    fontFamily: 'CG-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: ColorPalette.white,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ColorPalette.border_color || '#2A2A2A',
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 77, 79, 0.1)', // Semi-transparent red
    borderWidth: 1,
    borderColor: '#FF4D4F',
  },
  buttonText: {
    fontFamily: 'CG-Medium',
    fontSize: 15,
  },
});

export default ConfirmationAlert;
