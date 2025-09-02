import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const CustomDialog = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default" // or "destructive"
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View style={styles.dialogContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  type === "destructive" && styles.destructiveButton
                ]} 
                onPress={onConfirm}
              >
                <Text style={[
                  styles.confirmButtonText,
                  type === "destructive" && styles.destructiveButtonText
                ]}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: ColorPalette.card_bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorPalette.border_color,
  },
  content: {
    padding: 20,
  },
  title: {
    color: ColorPalette.white,
    fontSize: 20,
    fontFamily: 'CG-Bold',
    marginBottom: 10,
  },
  message: {
    color: ColorPalette.grey_text,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: ColorPalette.green,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  destructiveButton: {
    backgroundColor: ColorPalette.dark_red,
  },
  cancelButtonText: {
    color: ColorPalette.grey_text,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  confirmButtonText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  destructiveButtonText: {
    color: ColorPalette.white,
  },
});

export default CustomDialog;
