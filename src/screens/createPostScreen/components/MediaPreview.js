import React, { memo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import ColorPalette from '../../../constants/ColorPalette';

const MediaItem = memo(({ item, index, onRemove }) => {
  const isVideo = item.type === 'video' || item.uri.includes('.mp4') || item.uri.includes('.mov');
  
  return (
    <View style={styles.mediaItem}>
      {isVideo ? (
        <Video
          source={{ uri: item.uri }}
          style={styles.mediaPreview}
          resizeMode="cover"
          shouldPlay={false}
          isMuted={true}
          useNativeControls={false}
        />
      ) : (
        <Image
          source={{ uri: item.uri }}
          style={styles.mediaPreview}
          resizeMode="cover"
        />
      )}
      
      {/* Video indicator */}
      {isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={24} color="#FFF" />
        </View>
      )}
      
      {/* Remove button */}
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(index)}
      >
        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );
});

const MediaPreview = ({ mediaFiles, onRemoveMedia }) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Media ({mediaFiles.length}/5)</Text>
      </View>
      
      <FlatList
        data={mediaFiles}
        renderItem={({ item, index }) => (
          <MediaItem
            item={item}
            index={index}
            onRemove={onRemoveMedia}
          />
        )}
        keyExtractor={(item, index) => `media-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mediaList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPalette.card_bg || '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  title: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 14,
  },
  mediaList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
});

export default memo(MediaPreview);
