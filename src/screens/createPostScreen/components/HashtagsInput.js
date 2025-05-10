import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ColorPalette from '../../../constants/ColorPalette';

const HashtagsInput = ({ hashtags }) => {
  if (!hashtags || hashtags.length === 0) {
    return null;
  }
  
  // Remove duplicates
  const uniqueHashtags = [...new Set(hashtags)];
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {uniqueHashtags.map((tag, index) => (
          <View key={`tag-${index}`} style={styles.hashtag}>
            <Text style={styles.hashtagText}>#{tag}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 4,
  },
  hashtag: {
    backgroundColor: ColorPalette.green + '40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  hashtagText: {
    color: ColorPalette.green,
    fontFamily: 'CG-Medium',
    fontSize: 14,
  },
});

export default memo(HashtagsInput);
