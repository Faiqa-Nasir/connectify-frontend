import { StyleSheet, Dimensions } from 'react-native';
import ColorPalette from '../../../constants/ColorPalette';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.bg,
  },
  featuredCard: {
    width: width,
    height: 200,
    marginBottom: 20,
    paddingHorizontal: 0
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  eventLabel: {
    color: ColorPalette.text_white,
    fontSize: 14,
    opacity: 0.8,
  },
  eventTitle: {
    color: ColorPalette.text_white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: ColorPalette.gradient_start, // Use your theme color
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  }
  
});

export default styles;