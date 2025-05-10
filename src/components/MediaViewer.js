import React, { useState, useRef, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import ColorPalette from '../constants/ColorPalette';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create a memoized component for media items
const MediaViewerItem = memo(({ 
  item, 
  index, 
  isVideo, 
  loading, 
  error, 
  isPaused, 
  isControlsVisible,
  currentIndex,
  setLoading,
  setError,
  toggleControls,
  togglePlayPause,
  videoRefs
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={1}
      style={styles.mediaItemContainer}
      onPress={toggleControls}
    >
      {loading[index] && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={ColorPalette.green} />
        </View>
      )}

      {error[index] ? (
        <View style={styles.errorContainer}>
          <Ionicons name={isVideo ? "videocam-off-outline" : "image-outline"} size={64} color="#FFF" />
          <Text style={styles.errorText}>
            {isVideo ? "Video could not be loaded" : "Image could not be loaded"}
          </Text>
        </View>
      ) : isVideo ? (
        <Video
          ref={(ref) => { videoRefs.current[index] = ref; }}
          source={{ uri: item }}
          style={styles.media}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay={!isPaused[index] && currentIndex === index}
          isLooping
          onLoadStart={() => setLoading(prev => ({ ...prev, [index]: true }))}
          onLoad={() => setLoading(prev => ({ ...prev, [index]: false }))}
          onError={(error) => {
            console.log(`Error loading video: ${error}`);
            setLoading(prev => ({ ...prev, [index]: false }));
            setError(prev => ({ ...prev, [index]: true }));
          }}
          useNativeControls={false}
        />
      ) : (
        <Image
          source={{ uri: item }}
          style={styles.media}
          resizeMode="contain"
          onLoadStart={() => setLoading(prev => ({ ...prev, [index]: true }))}
          onLoad={() => setLoading(prev => ({ ...prev, [index]: false }))}
          onError={() => {
            console.log(`Error loading image at index ${index}`);
            setLoading(prev => ({ ...prev, [index]: false }));
            setError(prev => ({ ...prev, [index]: true }));
          }}
        />
      )}

      {/* Video controls overlay */}
      {isVideo && isControlsVisible && currentIndex === index && (
        <TouchableOpacity 
          style={styles.videoControlOverlay}
          activeOpacity={1}
          onPress={() => togglePlayPause(index)}
        >
          {isPaused[index] && (
            <Ionicons name="play" size={64} color="#FFF" style={styles.playIcon} />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const MediaViewer = ({ 
  visible, 
  onClose, 
  media, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [isPaused, setIsPaused] = useState({});
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const flatListRef = useRef(null);
  const videoRefs = useRef({});

  // Memoized functions to prevent recreating on each render
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex - 1, 
        animated: true 
      });
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flatListRef.current?.scrollToIndex({ 
        index: currentIndex + 1, 
        animated: true 
      });
    }
  }, [currentIndex, media.length]);

  const toggleControls = useCallback(() => {
    setIsControlsVisible(prev => !prev);
  }, []);

  const togglePlayPause = useCallback((index) => {
    setIsPaused(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const isVideo = useCallback((mediaUrl) => {
    if (!mediaUrl) return false;
    return mediaUrl.includes('.mp4') || 
           mediaUrl.includes('.mov') || 
           mediaUrl.includes('video');
  }, []);

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
      
      // Pause all videos except the current one
      Object.keys(videoRefs.current).forEach(key => {
        const index = parseInt(key);
        if (index !== viewableItems[0].index) {
          setIsPaused(prev => ({ ...prev, [index]: true }));
        }
      });
    }
  }, []);

  // Memoized render function
  const renderMediaItem = useCallback(({ item, index }) => {
    const mediaIsVideo = isVideo(item);

    return (
      <MediaViewerItem
        item={item}
        index={index}
        isVideo={mediaIsVideo}
        loading={loading}
        error={error}
        isPaused={isPaused}
        isControlsVisible={isControlsVisible}
        currentIndex={currentIndex}
        setLoading={setLoading}
        setError={setError}
        toggleControls={toggleControls}
        togglePlayPause={togglePlayPause}
        videoRefs={videoRefs}
      />
    );
  }, [loading, error, isPaused, isControlsVisible, currentIndex, toggleControls, togglePlayPause, isVideo]);

  // Memoized keyExtractor
  const keyExtractor = useCallback((item, index) => `expanded-media-${index}`, []);

  // Memoized getItemLayout
  const getItemLayout = useCallback((data, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);

  // Return null when not visible
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Media carousel */}
        <FlatList
          ref={flatListRef}
          data={media}
          keyExtractor={keyExtractor}
          renderItem={renderMediaItem}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          windowSize={3}
        />

        {/* Navigation and counter */}
        {isControlsVisible && (
          <View style={styles.controlsContainer}>
            {/* Previous button */}
            <TouchableOpacity 
              style={[
                styles.navButton, 
                currentIndex === 0 && styles.disabledButton
              ]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={currentIndex === 0 ? "#666" : "#FFF"} 
              />
            </TouchableOpacity>

            {/* Counter */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {media.length}
              </Text>
            </View>

            {/* Next button */}
            <TouchableOpacity 
              style={[
                styles.navButton, 
                currentIndex === media.length - 1 && styles.disabledButton
              ]}
              onPress={goToNext}
              disabled={currentIndex === media.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={28} 
                color={currentIndex === media.length - 1 ? "#666" : "#FFF"} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  mediaItemContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: screenWidth,
    height: screenHeight,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'CG-Regular',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  counterContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'CG-Medium',
  },
  videoControlOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playIcon: {
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default memo(MediaViewer);
