import { StyleSheet, Dimensions } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  startButton: {
    borderRadius: 24,
    overflow: 'hidden', // Ensures the gradient stays within the rounded button
    width: 180, // Slightly larger button
    height: 56, // Increased height for better touch area
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
  },
  gradientButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  startText: {
    color: '#fff',
    fontSize: 18, // Slightly larger font
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Text shadow for better readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});