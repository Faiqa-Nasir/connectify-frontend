import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { styles } from './styles';
import ColorPalette from '../../constants/ColorPalette';

const Button = ({ routeName, text }) => {
  const navigation = useNavigation(); // Get navigation instance
  const startButtonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: startButtonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const handlePressIn = () => {
    startButtonScale.value = withSpring(0.95); // Slight scale down
    buttonOpacity.value = withTiming(0.9, { duration: 100 }); // Slight fade
  };

  const handlePressOut = () => {
    startButtonScale.value = withSpring(1); // Scale back to normal
    buttonOpacity.value = withTiming(1, { duration: 100 }); // Fade back to normal
  };

  const handlePress = () => {
    // Animate button press
    startButtonScale.value = withSpring(0.9);
    buttonOpacity.value = withTiming(0.8, { duration: 100 }, () => {
      // Navigate after animation completes
      navigation.navigate(routeName, { trend: text });
      // Reset animation
      startButtonScale.value = withSpring(1);
      buttonOpacity.value = withTiming(1);
    });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.startButton, animatedStyle]}>
        <LinearGradient
          colors={[ColorPalette.gradient_start, ColorPalette.gradient_end]} // Use your gradient colors
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.startText}>{text || 'Start Trend'}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Button;