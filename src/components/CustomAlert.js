import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const CustomAlert = ({ visible, type, message, loading }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalBackground}>
        <View style={styles.alertContainer}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={ColorPalette.green} style={styles.loader} />
              <Text style={styles.loadingText}>{message || 'Please wait...'}</Text>
            </>
          ) : (
            <Text style={[
              styles.message, 
              type === 'error' && styles.errorText,
              type === 'success' && styles.successText
            ]}>
              {message}
            </Text>
          )}
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
    width: '50%',
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: 'CG-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: ColorPalette.text_black,
  },
  errorText: {
    color: 'red',
  },
  successText: {
    color: 'green',
  },
  loader: {
    marginBottom: 15,
  },
  loadingText: {
    fontFamily: 'CG-Regular',
    fontSize: 16,
    color: ColorPalette.text_black,
    textAlign: 'center',
  },
});

export default CustomAlert;
