import React, { useState, useRef, useCallback, memo, useMemo, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import ColorPalette from '../constants/ColorPalette';
import parseText from '../utils/parseText';
import CommentsModal from './CommentsModal/CommentsModal';
import SendModal from './SendModal';
import MediaViewer from './MediaViewer';
import { deletePost } from '../services/postService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingIndicator from './common/LoadingIndicator';
import OptionsMenu from './common/OptionsMenu';
import { fetchUserData } from '../utils/userUtils';
import CustomAlert from './CustomAlert';
import ConfirmationAlert from './ConfirmationAlert';
import { getReactionTypes, reactToPost, removeReaction } from '../services/reactionService';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

// Create a memoized MediaItem component for better performance
const MediaItem = memo(({ item, index, onPress, isVideo, videoRef, imageLoading, setImageLoading, imageError, setImageError }) => {
    // Check if item is a valid media URL
    const isValidUrl = useMemo(() => {
        return item && typeof item === 'string' && 
            (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('file://'));
    }, [item]);
    
    // If not a valid URL, render a placeholder instead
    if (!isValidUrl) {
        return (
            <View style={styles.mediaItemContainer}>
                <View style={styles.mediaError}>
                    <Ionicons 
                        name={isVideo ? "videocam-outline" : "image-outline"} 
                        size={48} 
                        color={ColorPalette.grey_text} 
                    />
                    <Text style={styles.mediaErrorText}>
                        {isVideo ? "Video not available" : "Image not available"}
                    </Text>
                </View>
            </View>
        );
    }
    
    return (
        <TouchableOpacity
            style={styles.mediaItemContainer}
            onPress={() => onPress(index)}
            activeOpacity={0.9}
        >
            {imageLoading[index] && (
                <View style={styles.mediaLoading}>
                    <LoadingIndicator size="large" />
                </View>
            )}
            
            {imageError[index] ? (
                <View style={styles.mediaError}>
                    <Ionicons 
                        name={isVideo ? "videocam-off-outline" : "image-outline"} 
                        size={48} 
                        color={ColorPalette.grey_text} 
                    />
                    <Text style={styles.mediaErrorText}>
                        {isVideo ? "Video could not be loaded" : "Media could not be loaded"}
                    </Text>
                </View>
            ) : isVideo ? (
                <View style={styles.videoContainer}>
                    <Video
                        ref={ref => { videoRef.current[index] = ref; }}
                        source={{ uri: item }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                        shouldPlay={false}
                        isLooping
                        isMuted={true}
                        onLoadStart={() => {
                            setImageLoading(prev => ({ ...prev, [index]: true }));
                        }}
                        onLoad={() => {
                            setImageLoading(prev => ({ ...prev, [index]: false }));
                        }}
                        onError={() => {
                            setImageLoading(prev => ({ ...prev, [index]: false }));
                            setImageError(prev => ({ ...prev, [index]: true }));
                        }}
                        useNativeControls={false}
                    />
                    {/* Video indicator */}
                    <View style={styles.videoIndicator}>
                        <Ionicons name="play" size={36} color="#FFF" />
                    </View>
                </View>
            ) : (
                <Image
                    source={{ uri: item }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                    onLoadStart={() => {
                        setImageLoading(prev => ({ ...prev, [index]: true }));
                    }}
                    onLoad={() => {
                        setImageLoading(prev => ({ ...prev, [index]: false }));
                    }}
                    onError={() => {
                        setImageLoading(prev => ({ ...prev, [index]: false }));
                        setImageError(prev => ({ ...prev, [index]: true }));
                    }}
                    defaultSource={{ uri: 'https://via.placeholder.com/300' }}
                />
            )}
            
            {/* Click to expand indicator */}
            <View style={styles.expandIndicator}>
                <Ionicons name="expand-outline" size={20} color="#FFF" />
            </View>
        </TouchableOpacity>
    );
});

const Post = ({ post, onPostDeleted }) => {
    const navigation = useNavigation();
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [sendModalVisible, setSendModalVisible] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [reactionTypes, setReactionTypes] = useState([]);
    const [currentReaction, setCurrentReaction] = useState(post.user_reaction || null);
    const [reactionCount, setReactionCount] = useState(post.reaction_count || 0);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Custom alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertLoading, setAlertLoading] = useState(false);
    
    // Confirmation alert state
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    
    // Add state for tracking image loading and errors
    const [imageLoading, setImageLoading] = useState({});
    const [imageError, setImageError] = useState({});
    const [mediaViewerVisible, setMediaViewerVisible] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const videoRefs = useRef({});

    // Reference to the more button for positioning the menu
    const moreButtonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    // Add optimistic state
    const [optimisticReaction, setOptimisticReaction] = useState(null);
    const [optimisticCount, setOptimisticCount] = useState(post.reaction_count || 0);

    // Fetch current user data when component mounts
    useEffect(() => {
        const getUserData = async () => {
            const userData = await fetchUserData();
            if (userData) {
                setCurrentUserId(userData.id);
            }
        };
        
        getUserData();
    }, []);

    // Fetch reaction types when component mounts
    useEffect(() => {
        const loadReactionTypes = async () => {
            try {
                const types = await getReactionTypes();
                setReactionTypes(types);
            } catch (error) {
                console.error('Error loading reaction types:', error);
            }
        };
        loadReactionTypes();
    }, []);

    // Update initial states with post data
    useEffect(() => {
        if (post) {
            setCurrentReaction(post.user_reaction);
            setReactionCount(post.reaction_count || 0);
        }
    }, [post]);

    // Determine if post belongs to current user
    const isCurrentUserPost = useMemo(() => {
        return Number(post.user?.id) === currentUserId;
    }, [post.user?.id, currentUserId]);

    // Check if post has a category
    const hasCategory = useMemo(() => {
        return !!post.text_category;
    }, [post.text_category]);

    // Update the hashtag click handler with correct route name
    const handleHashtagPress = (hashtag) => {
        // Remove # symbol if present and convert to uppercase for consistency
        const cleanHashtag = hashtag.replace('#', '').toUpperCase();
        navigation.navigate('TrendDetailsScreen', {
            trend: cleanHashtag,
            initialPosts: [], // Initial posts will be loaded in TrendDetailScreen
            refresh: true // Pass refresh parameter
        });
    };

    // Function to handle mention clicks
    const handleMentionPress = (mention) => {
        console.log(`Mention pressed: ${mention}`);
        // Navigate to user profile or show user info
    };

    // Function to determine if media is a video - memoized for performance
    const isVideo = useCallback((mediaUrl) => {
        if (!mediaUrl || typeof mediaUrl !== 'string') return false;
        
        try {
            return mediaUrl.includes('.mp4') || 
                  mediaUrl.includes('.mov') || 
                  mediaUrl.includes('video');
        } catch (error) {
            console.log('Error checking media type:', error);
            return false;
        }
    }, []);
    
    // Filter out invalid media URIs
    const validMedia = useMemo(() => {
        if (!post?.media || !Array.isArray(post.media)) return [];
        
        return post.media.filter(item => 
            item && typeof item === 'string' && 
            (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('file://'))
        );
    }, [post?.media]);

    // Open media viewer with a specific media item - memoized for performance
    
    const openMediaViewer = useCallback((index) => {
        setSelectedMediaIndex(index);
        setMediaViewerVisible(true);
        
        // Pause all videos when opening the media viewer
        Object.values(videoRefs.current).forEach(ref => {
            if (ref) ref.pauseAsync();
        });
    }, []);

    // Memoized renderItem function
    const renderMediaItem = useCallback(({ item, index }) => {
        try {
            const mediaIsVideo = isVideo(item);
            
            return (
                <MediaItem 
                    item={item}
                    index={index}
                    onPress={openMediaViewer}
                    isVideo={mediaIsVideo}
                    videoRef={videoRefs}
                    imageLoading={imageLoading}
                    setImageLoading={setImageLoading}
                    imageError={imageError}
                    setImageError={setImageError}
                />
            );
        } catch (error) {
            console.log('Error rendering media item:', error);
            return (
                <View style={styles.mediaError}>
                    <Ionicons name="alert-circle-outline" size={48} color={ColorPalette.grey_text} />
                    <Text style={styles.mediaErrorText}>Failed to render media</Text>
                </View>
            );
        }
    }, [imageLoading, imageError, isVideo, openMediaViewer]);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    // Optimize performance with keyExtractor memoization
    const keyExtractor = useCallback((item, index) => `${post.id}-media-${index}`, [post.id]);

    // Optimize getItemLayout for better FlatList performance
    const getItemLayout = useCallback((data, index) => ({
        length: screenWidth - 32, // Account for margins
        offset: (screenWidth - 32) * index,
        index,
    }), []);

    // Render a profile image or placeholder
    const renderProfileImage = () => {
        const validProfileImage = post.user?.profileImage && 
            typeof post.user.profileImage === 'string' && 
            (post.user.profileImage.startsWith('http://') || 
             post.user.profileImage.startsWith('https://') || 
             post.user.profileImage.startsWith('file://'));
             
        if (!validProfileImage) {
            return (
                <View style={styles.profilePicPlaceholder}>
                    <Text style={styles.profilePicText}>
                        {post.user.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
            );
        }
        
        return (
            <Image 
                source={{ uri: post.user.profileImage }} 
                style={styles.profilePic}
                onError={() => console.log('Error loading profile image')}
            />
        );
    };

    // Function to show custom alert
    const showAlert = (type, message, loading = false) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertLoading(loading);
        setAlertVisible(true);
        
        // Auto-hide success/error alerts after 3 seconds
        if (!loading) {
            setTimeout(() => {
                setAlertVisible(false);
            }, 3000);
        }
    };

    // Function to hide custom alert
    const hideAlert = () => {
        setAlertVisible(false);
    };
    
    // Function to show confirmation dialog
    const showConfirmation = (message, action) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);  // Store the callback function
        setConfirmVisible(true);
    };

    // Function to handle post deletion
    const handleDeletePost = useCallback(async () => {
        // Show confirmation dialog
        showConfirmation(
            'Are you sure you want to delete this post? This action cannot be undone.',
            async () => {
                try {
                    setIsDeleting(true);
                    setShowOptions(false);
                    
                    // Call the API to delete the post
                    await deletePost(post.id);
                    
                    // Update local storage - store recently deleted posts IDs
                    try {
                        const deletedPostsJson = await AsyncStorage.getItem('deletedPosts');
                        const deletedPosts = deletedPostsJson ? JSON.parse(deletedPostsJson) : [];
                        
                        // Add current post ID and timestamp to the deleted posts array
                        deletedPosts.push({
                            id: post.id,
                            deletedAt: new Date().toISOString()
                        });
                        
                        // Keep only the last 50 deleted posts
                        const trimmedDeletedPosts = deletedPosts.slice(-50);
                        
                        await AsyncStorage.setItem('deletedPosts', JSON.stringify(trimmedDeletedPosts));
                    } catch (storageError) {
                        console.error('Error updating deleted posts in storage:', storageError);
                    }
                    
                    // Notify parent component to update its state
                    if (onPostDeleted) {
                        onPostDeleted(post.id);
                    }
                    
                    // Show success message
                    showAlert('success', 'Post deleted successfully');
                } catch (error) {
                    // Show error message
                    showAlert('error', error.message || 'Failed to delete post. Please try again.');
                } finally {
                    setIsDeleting(false);
                }
            }
        );
    }, [post.id, onPostDeleted]);

    // Function to handle more options menu
    const toggleOptionsMenu = useCallback(() => {
        if (!showOptions) {
            // Get the position of the more button to position the menu relative to it
            moreButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
                setMenuPosition({
                    top: pageY + height -5, // Position below the button with a small gap
                    right: screenWidth - (pageX + width) + 5 // Align with the right edge of button
                });
                setShowOptions(true);
            });
        } else {
            setShowOptions(false);
        }
    }, [showOptions]);
    
    // Create options array for the OptionsMenu component
    const menuOptions = useMemo(() => {
        const options = [];
        
        // Only add delete option if it's the current user's post
        if (isCurrentUserPost) {
            options.push({
                icon: 'trash-outline',
                text: 'Delete',
                color: '#FF4D4F',
                onPress: handleDeletePost,
                disabled: isDeleting
            });
        }
        
        // Remove the cancel option since we'll close automatically when clicking outside
        
        return options;
    }, [isCurrentUserPost, handleDeletePost, isDeleting]);

    // Handle reaction with optimistic update
    const handleReaction = async (reactionTypeId) => {
        if (reactionLoading) return;
        
        setReactionLoading(true);
        
        // Get reaction details for optimistic update
        const newReaction = reactionTypes.find(r => r.id === reactionTypeId);
        
        // Store previous state for rollback
        const previousReaction = currentReaction;
        const previousCount = reactionCount;
        
        try {
            if (currentReaction?.id === reactionTypeId) {
                // Remove reaction if clicking the same one
                setCurrentReaction(null);
                setReactionCount(prev => Math.max(0, prev - 1));
                setShowReactionPicker(false);
                
                await removeReaction(post.id);
            } else {
                // Add or change reaction
                setCurrentReaction(newReaction);
                setReactionCount(prev => !currentReaction ? prev + 1 : prev);
                setShowReactionPicker(false);

                const response = await reactToPost(post.id, reactionTypeId);
                
                if (!response.isOptimistic) {
                    setCurrentReaction({
                        id: reactionTypeId,
                        name: response.reaction_type,
                        emoji: response.emoji,
                        type: response.reaction_type
                    });
                }
            }
        } catch (error) {
            // Rollback on error
            setCurrentReaction(previousReaction);
            setReactionCount(previousCount);
            showAlert('error', error.message);
        } finally {
            setReactionLoading(false);
        }
    };

    // Get the appropriate icon based on reaction type
    const getReactionIcon = useCallback(() => {
        if (!currentReaction) return "heart-outline";
        
        // Map reaction types to icons
        const iconMap = {
            like: "heart",
            love: "heart",
            haha: "happy",
            wow: "surprise",
            sad: "sad",
            angry: "flame"
        };

        return iconMap[currentReaction.type] || "heart";
    }, [currentReaction]);

    // Replace the reaction button render function
    const renderReactionButton = () => (
        <View style={styles.reactionWrapper}>
            <TouchableOpacity 
                onLongPress={() => setShowReactionPicker(true)}
                onPress={() => handleReaction(1)}
                style={styles.actionButton}
                disabled={reactionLoading}
            >
                <Ionicons 
                    name={getReactionIcon()} 
                    size={20} 
                    color={currentReaction ? "#FF6B6B" : ColorPalette.grey_text} 
                />
                <Text style={styles.actionText}>{reactionCount}</Text>
            </TouchableOpacity>

            {/* Reaction Picker Modal */}
            {showReactionPicker && (
                <View style={styles.reactionPicker}>
                    <View style={styles.reactionPickerContent}>
                        {reactionTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => handleReaction(type.id)}
                                style={[
                                    styles.reactionItem,
                                    currentReaction?.id === type.id && styles.selectedReactionItem
                                ]}
                            >
                                <Text style={styles.reactionEmoji}>{type.emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

    // If post data is missing or invalid, don't render anything
    if (!post || !post.user) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Custom Alert */}
            <CustomAlert
                visible={alertVisible}
                type={alertType}
                message={alertMessage}
                loading={alertLoading}
            />
            
            {/* Confirmation Alert */}
            <ConfirmationAlert
                visible={confirmVisible}
                message={confirmMessage}
                onCancel={() => setConfirmVisible(false)}
                onConfirm={() => {
                    setConfirmVisible(false);
                    if (confirmAction) confirmAction();
                }}
                cancelText="Cancel"
                confirmText="Delete"
                confirmColor="#FF4D4F"
            />
            
            {/* Deleting Overlay */}
            {isDeleting && (
                <LoadingIndicator 
                    overlay 
                    message="Deleting post..." 
                />
            )}

            {/* Post Header with User Info */}
            <View style={styles.header}>
                {renderProfileImage()}
                <View style={styles.userInfoContainer}>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{post.user.displayName || post.user.username}</Text>
                        <Text style={styles.userHandle}>@{post.user.username.toLowerCase()}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.timestamp}>{post.timeAgo}</Text>
                        
                        {/* Display category pill if available */}
                        {hasCategory && (
                            <View style={styles.categoryPill}>
                                <Text style={styles.categoryText}>{post.text_category}</Text>
                            </View>
                        )}
                    </View>
                    
                    {/* Caption - Now appears below user info but above media */}
                    <TouchableOpacity 
                        activeOpacity={0.8} 
                        onPress={toggleExpanded}
                        style={styles.captionTextContainer}
                    >
                        <Text
                            style={styles.captionText}
                            numberOfLines={isExpanded ? null : 4}
                            ellipsizeMode="tail"
                        >
                            {parseText(post.caption, {
                                baseStyle: { color: ColorPalette.white, fontFamily: 'CG-Regular' },
                                specialStyle: { color: ColorPalette.gradient_text, fontFamily: 'CG-Regular' },
                                onHashtagPress: handleHashtagPress,
                                onMentionPress: handleMentionPress
                            })}
                        </Text>
                        {post.caption && post.caption.length > 80 && !isExpanded && (
                            <Text style={styles.showMoreText}>
                                Show more
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity 
                    ref={moreButtonRef}
                    style={styles.moreButton}
                    onPress={toggleOptionsMenu}
                >
                    <Ionicons name="ellipsis-horizontal" size={20} color={ColorPalette.grey_text} />
                </TouchableOpacity>
            </View>

            {/* Options Menu - Pass position from the measured coordinates */}
            <OptionsMenu 
                visible={showOptions}
                options={menuOptions}
                style={{
                    position: 'absolute',
                    top: menuPosition.top,
                    right: menuPosition.right,
                    maxWidth: 120,
                }}
                onBackdropPress={() => setShowOptions(false)}
                closeOnSelect={true}
            />

            {/* Media Gallery - Now appears after the caption */}
            {validMedia.length > 0 && (
                <View style={styles.mediaContainer}>
                    <FlatList
                        data={validMedia}
                        renderItem={renderMediaItem}
                        keyExtractor={keyExtractor}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        getItemLayout={getItemLayout}
                        removeClippedSubviews={true} // Improve memory usage
                        maxToRenderPerBatch={2} // Limit batch size for smoother rendering
                        windowSize={3} // Reduce window size to improve performance
                        initialNumToRender={1} // Only render the first item initially
                    />
                    {validMedia.length > 1 && (
                        <View style={styles.mediaIndicator}>
                            <Text style={styles.mediaCounter}>
                                {currentIndex + 1}/{validMedia.length}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Actions Bar */}
            <View style={styles.actionsBar}>
                {renderReactionButton()}
                
                <TouchableOpacity 
                    onPress={() => setCommentsVisible(true)} 
                    style={styles.actionButton}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={ColorPalette.grey_text} />
                    <Text style={styles.actionText}>{post.comments || 0}</Text>
                </TouchableOpacity>
        
                
                <TouchableOpacity 
                    onPress={() => setBookmarked(!bookmarked)}
                    style={styles.actionButton}
                >
                    <Ionicons 
                        name={bookmarked ? "bookmark" : "bookmark-outline"} 
                        size={20} 
                        color={bookmarked ? ColorPalette.green : ColorPalette.grey_text} 
                    />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}
                                    onPress={() => setSendModalVisible(true)}>
                    <Ionicons name="share-outline" size={20} color={ColorPalette.grey_text} />
                </TouchableOpacity>
            </View>

            {/* Comments Modal */}
            <CommentsModal
                visible={commentsVisible}
                onClose={() => setCommentsVisible(false)}
                postId={post.id}
            />
            
            {/* Send Modal */}
            <SendModal
                visible={sendModalVisible}
                onClose={() => setSendModalVisible(false)}
                postId={post.id}
                postImage={post.media && post.media.length > 0 ? post.media[0] : null}
                postCaption={post.caption}
                postUsername={post.user.username}
            />
            
            {/* Media Viewer Modal */}
            <MediaViewer
                visible={mediaViewerVisible}
                onClose={() => setMediaViewerVisible(false)}
                media={validMedia}
                initialIndex={selectedMediaIndex}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: ColorPalette.main_black,
        marginBottom: 15,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: ColorPalette.border_color || '#2A2A2A',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    profilePic: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    userInfoContainer: {
        flex: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 2,
    },
    userName: {
        color: ColorPalette.white,
        fontFamily: 'CG-Bold',
        fontSize: 15,
        marginRight: 4,
    },
    userHandle: {
        color: ColorPalette.grey_text,
        fontFamily: 'CG-Regular',
        fontSize: 14,
        marginRight: 4,
    },
    dot: {
        color: ColorPalette.grey_text,
        marginRight: 4,
    },
    timestamp: {
        color: ColorPalette.grey_text,
        fontFamily: 'CG-Regular',
        fontSize: 14,
    },
    moreButton: {
        padding: 4,
    },
    captionTextContainer: {
        marginTop: 4,
    },
    captionText: {
        color: ColorPalette.white,
        fontFamily: 'CG-Regular',
        fontSize: 15,
        lineHeight: 20,
    },
    showMoreText: {
        color: ColorPalette.gradient_text,
        fontFamily: 'CG-Regular',
        marginTop: 2,
        fontSize: 14,
    },
    mediaContainer: {
        marginTop: 12,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        height: 300,
        backgroundColor: '#1A1A1A', // Slightly lighter than background for contrast
    },
    mediaItemContainer: {
        width: screenWidth - 32,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    mediaLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 1,
    },
    mediaError: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ColorPalette.border_color || '#2A2A2A',
        borderStyle: 'dashed',
    },
    mediaErrorText: {
        marginTop: 12,
        color: ColorPalette.grey_text,
        fontFamily: 'CG-Regular',
        textAlign: 'center',
    },
    mediaImage: {
        width: screenWidth - 32, // Screen width minus horizontal margins
        height: 300,
        borderRadius: 12,
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoIndicator: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    expandIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 6,
        borderRadius: 12,
        zIndex: 2,
    },
    mediaIndicator: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    mediaCounter: {
        color: ColorPalette.white,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    actionsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingHorizontal: 16,
        height: 40, // Fixed height for consistency
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        minWidth: 40, // Minimum width for touch target
    },
    actionText: {
        color: ColorPalette.grey_text,
        marginLeft: 4, // Reduced from 6
        fontSize: 13,
        fontFamily: 'CG-Regular',
    },
    profilePicPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: ColorPalette.green,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profilePicText: {
        color: ColorPalette.white,
        fontFamily: 'CG-Bold',
        fontSize: 18,
    },
    // Styles for category pill
    categoryPill: {
        backgroundColor: ColorPalette.green + '30', // Semi-transparent version of the green color
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: ColorPalette.green,
    },
    categoryText: {
        color: ColorPalette.green,
        fontSize: 12,
        fontFamily: 'CG-Medium',
    },
    reactionWrapper: {
        position: 'relative',
        zIndex: 1,
    },
    reactionPicker: {
        position: 'absolute',
        bottom: 45,
        left: -10,
        backgroundColor: ColorPalette.card_bg,
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 'auto',
    },
    reactionPickerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    reactionItem: {
        padding: 4,
        marginHorizontal: 2,
        borderRadius: 12,
        backgroundColor: 'transparent',
        minWidth: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedReactionItem: {
        backgroundColor: ColorPalette.green + '20',
    },
    reactionEmoji: {
        fontSize: 18, // Reduced from 20
    },
});

// Export as memoized component to prevent unnecessary re-renders
export default memo(Post);
