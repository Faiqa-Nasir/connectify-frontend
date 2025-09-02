import { StyleSheet, Dimensions } from 'react-native';
import ColorPalette from '../../../constants/ColorPalette';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  trendsListContainer: {
    paddingBottom: 80, // Space for floating button
  },
  featuredCard: {
    width: width,
    height: 200,
    marginBottom: 24,
    marginTop: 16,
  },
  featuredBackground: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  featuredContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  eventLabel: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    opacity: 0.9,
    marginBottom: 8,
  },
  eventTitle: {
    color: ColorPalette.text_white,
    fontSize: 36,
    fontFamily: 'CG-Medium',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventStats: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    opacity: 0.9,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retryButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  errorText: {
    color: ColorPalette.text_white,
    fontFamily: 'CG-Regular',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: ColorPalette.border_color,
    backgroundColor: ColorPalette.card_bg,
  },
  sectionTitle: {
    color: ColorPalette.text_white,
    fontSize: 24,
    fontFamily: 'CG-Medium',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: ColorPalette.text_gray,
    fontSize: 14,
    fontFamily: 'CG-Regular',
    opacity: 0.8,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: ColorPalette.text_gray,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  }
});

export default styles;