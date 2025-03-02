import React, { useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  Animated, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../../constants/ColorPalette';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DynamicModal = ({ 
  visible = false, 
  onClose, 
  title = '', 
  children, 
  showCloseIcon = true,
  height = '60%',
  animationType = 'slide',
  swipeToDismiss = true,
  backgroundColor = ColorPalette.main_black,
  contentContainerStyle = {},
  noScrollView = false  // New prop to indicate if content shouldn't be wrapped in ScrollView
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  // Animation to show the modal
  useEffect(() => {
    if (visible) {
      // Animate modal in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      // Animate modal out
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleGesture = (event) => {
    if (!swipeToDismiss) return;
    
    const { translationY } = event.nativeEvent;
    
    if (translationY > 100) {
      onClose();
    }
  };

  const calculateHeight = () => {
    if (typeof height === 'string' && height.includes('%')) {
      const percentage = parseInt(height) / 100;
      return { height: SCREEN_HEIGHT * percentage };
    }
    return { height };
  };

  const modalContainerStyle = [
    styles.modalContainer,
    calculateHeight(),
    { backgroundColor },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <PanGestureHandler onGestureEvent={handleGesture} enabled={swipeToDismiss}>
          <Animated.View 
            style={[
              modalContainerStyle,
              { transform: [{ translateY }] }
            ]}
          >
            {/* Header with title and close button */}
            <View style={styles.header}>
              <View style={styles.dragIndicator} />
              
              <Text style={styles.title}>{title}</Text>
              
              {showCloseIcon && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={ColorPalette.white} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Content area - conditionally wrap in a ScrollView */}
            {noScrollView ? (
              <View style={[styles.contentContainerDirect, contentContainerStyle]}>
                {children}
              </View>
            ) : (
              <View 
                style={[styles.contentContainer, contentContainerStyle]}
              >
                {children}
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: ColorPalette.main_black,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  dragIndicator: {
    position: 'absolute',
    top: 0,
    width: 50,
    height: 5,
    backgroundColor: ColorPalette.grey_text,
    borderRadius: 3,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'CG-Medium',
    color: ColorPalette.white,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  contentContainerDirect: {
    flex: 1,
    padding: 0,
  },
});

export default DynamicModal;
