import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ColorPalette from '../../constants/ColorPalette';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function TrendItem({ hashtag, posts }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('TrendsDetailScreen', {
      trend: hashtag,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
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
      <Feather name="more-vertical" size={20} color={ColorPalette.text_gray} />
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
  content: {
    flex: 1,
  },
  hashtag: {
    color: ColorPalette.text_white,
    fontSize: 16,
    fontWeight: '500',
  },
  postsMask: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  gradientText: {
    height: 18, // Match text height
    width: '100%', // Make sure gradient covers text width
  },
});
