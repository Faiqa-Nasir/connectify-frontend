import { StyleSheet } from 'react-native';
import ColorPalette from '../../../constants/ColorPalette';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.dark_bg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: ColorPalette.green,
    paddingVertical: 0,
    borderBottomWidth: 1.0,
    borderBottomColor: ColorPalette.white,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    position: 'relative',
    alignItems: 'center',
  },
  activeTab: {
    position: 'relative',
  },
  tabText: {
    color: ColorPalette.white,
    fontSize: 15,
    fontFamily: 'CG-Regular',
  },
  activeTabText: {
    color: ColorPalette.gradient_text,
    fontFamily: 'CG-Medium',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: ColorPalette.gradient_text,
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: ColorPalette.text_gray,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: ColorPalette.text_white,
    fontFamily: 'CG-Medium',
    fontSize: 14,
  }
});
