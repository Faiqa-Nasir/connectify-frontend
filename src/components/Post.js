import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPalette from '../constants/ColorPalette';
import parseText from '../utils/parseText';
import CommentsModal from './CommentsModal/CommentsModal';
import SendModal from './SendModal';

const { width: screenWidth } = Dimensions.get('window');

const Post = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [sendModalVisible, setSendModalVisible] = useState(false);

    // Function to handle hashtag clicks
    const handleHashtagPress = (hashtag) => {
        console.log(`Hashtag pressed: ${hashtag}`);
        // Add navigation or search functionality here
    };

    // Function to handle mention clicks
    const handleMentionPress = (mention) => {
        console.log(`Mention pressed: ${mention}`);
        // Navigate to user profile or show user info
    };

    const renderMediaItem = ({ item }) => {
        return (
            <Image
                source={{ uri: item }}
                style={styles.mediaImage}
                resizeMode="cover"
            />
        );
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    return (
        <View style={styles.container}>
            {/* Post Header with User Info */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: post.user.profileImage }} style={styles.profilePic} />
                    <Text style={styles.username}>{post.user.username}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color={ColorPalette.white} />
                </TouchableOpacity>
            </View>

            {/* Media Gallery - replace Carousel with FlatList */}
            <View style={styles.mediaContainer}>
                <FlatList
                    data={post.media}
                    renderItem={renderMediaItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    getItemLayout={(data, index) => ({
                        length: screenWidth,
                        offset: screenWidth * index,
                        index,
                    })}
                />
                {post.media.length > 1 && (
                    <View style={styles.mediaIndicator}>
                        <Text style={styles.mediaCounter}>
                            {currentIndex + 1}/{post.media.length}
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions Bar */}
            <View style={styles.actionsBar}>
                <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.actionButton}>
                    <Ionicons name={liked ? "heart" : "heart-outline"} size={26} color={liked ? "#FF6B6B" : ColorPalette.white} />
                    <Text style={{ color: ColorPalette.white, marginLeft: 4, fontFamily: 'CG-Regular' }}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setCommentsVisible(true)}>
                    <Ionicons name="chatbubble-outline" size={24} color={ColorPalette.white} />
                    <Text style={{ color: ColorPalette.white, marginLeft: 4, fontFamily: 'CG-Regular' }}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setSendModalVisible(true)}>
                    <Ionicons name="paper-plane-outline" size={24} color={ColorPalette.white} />
                    <Text style={{ color: ColorPalette.white, marginLeft: 4, fontFamily: 'CG-Regular' }}>{post.shares}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setBookmarked(!bookmarked)}>
                    <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={24} color={ColorPalette.white} />
                </TouchableOpacity>
            </View>

            {/* Caption */}
            <View style={styles.captionContainer}>
                <View style={styles.captionWrapper}>
                    <TouchableOpacity 
                        activeOpacity={0.8} 
                        onPress={toggleExpanded}
                        style={styles.captionTextContainer}
                    >
                        <Text
                            style={styles.captionText}
                            numberOfLines={isExpanded ? null : 2}
                            ellipsizeMode="tail"
                        >
                            <Text style={styles.captionUsername} onPress={() => console.log("Username pressed : ", post.user.username)}>
                                {post.user.username + "  "}
                            </Text>
                            {parseText(post.caption, {
                                baseStyle: { color: ColorPalette.white, fontFamily: 'CG-Regular' },
                                specialStyle: { color: ColorPalette.gradient_text, fontFamily: 'CG-Regular' },
                                onHashtagPress: handleHashtagPress,
                                onMentionPress: handleMentionPress
                            })}
                        </Text>
                        {post.caption.length > 80 && (
                            <Text style={styles.showMoreText}>
                                {isExpanded ? "Show less" : "Show more"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Timestamp */}
            <Text style={styles.timestamp}>{post.timeAgo}</Text>

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
                postImage={post.media[0]}
                postCaption={post.caption}
                postUsername={post.user.username}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: ColorPalette.main_black,
        marginBottom: 15,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: ColorPalette.green,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePic: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    username: {
        color: ColorPalette.white,
        fontFamily: 'CG-Medium',
    },
    mediaContainer: {
        position: 'relative',
        height: 400,
        width: screenWidth, // Full screen width
        backgroundColor: ColorPalette.white,
    },
    mediaImage: {
        width: screenWidth, // Full screen width
        height: 400,
    },
    mediaIndicator: {
        position: 'absolute',
        top: 5,
        right: 5,
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
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    actionButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginRight: 16,
    },
    captionContainer: {
        paddingHorizontal: 10,
        marginBottom: 6,
    },
    captionWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    captionUsername: {
        color: ColorPalette.white,
        fontFamily: 'CG-Semibold',
    },
    captionTextContainer: {
        flex: 1,
    },
    captionText: {
        color: ColorPalette.white,
        fontFamily: 'CG-Regular',
    },
    showMoreText: {
        color: ColorPalette.grey_text,
        fontFamily: 'CG-Regular',
        marginTop: 2,
        fontSize: 12,
    },
    specialText: {
        color: ColorPalette.green,
        fontFamily: 'CG-Regular',
    },
    timestamp: {
        paddingHorizontal: 10,
        color: ColorPalette.grey_text,
        fontSize: 12,
        marginBottom: 8,
        fontFamily: 'CG-Regular',
    },
});

export default Post;
