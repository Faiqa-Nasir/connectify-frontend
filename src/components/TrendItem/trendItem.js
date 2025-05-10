import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ColorPalette from '../../constants/ColorPalette';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TrendItem({ hashtag, posts, onPress, index }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.hashtag}>{hashtag}</Text>

        {/* Gradient Text Effect */}
        <MaskedView maskElement={<Text style={styles.postsMask}>{posts} Posts</Text>}>
          <LinearGradient
            colors={[ColorPalette.gradient_text, ColorPalette.gradient_end]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // Horizontal gradient
            style={styles.gradientText}
          />
        </MaskedView>
      </View>
      <Feather name="chevron-right" size={20} color={ColorPalette.text_gray} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    borderBottomColor: ColorPalette.card_bg,
    
  },
  indexContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ColorPalette.card_bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  indexText: {
    color: ColorPalette.text_white,
    fontSize: 14,
    fontFamily: 'CG-Medium',
  },
  content: {
    flex: 1,
    marginLeft: 8,
  },
  hashtag: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontWeight: '500',
  },
  postsMask: {
    fontSize: 14,
    fontWeight: 'semibold',
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  gradientText: {
    height: 22, // Match text height
    width: '100%', // Make sure gradient covers text width
  },
});
