import { StyleSheet } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor:ColorPalette.bg_post,
    borderBottomColor: ColorPalette.bg_post,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'CG-Medium',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontFamily: 'CG-Bold',
  },
  username: {
    color: ColorPalette.text_gray,
    fontSize: 14,
    fontFamily: 'CG-Medium',
  },
  content: {
    color: ColorPalette.text_white,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
    fontFamily: 'CG-Regular',
  },
  imageGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  multipleImage: {
    width: '49.5%',
    height: 150,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: ColorPalette.text_gray,
    marginLeft: 4,
    fontFamily: 'CG-Regular',
  },
  timestamp: {
    color: ColorPalette.text_gray,
    fontSize: 14,
    marginLeft: 'auto',
    fontFamily: 'CG-Regular',
  },
});