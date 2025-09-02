import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Animated
} from 'react-native';
import ColorPalette from '../../constants/ColorPalette';
import UserOnlineCircle from '../../components/UserOnlineCircle';
import CreatePostButton from '../../components/CreatePostButton';
import { fetchPostFeed } from '../../services/postService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenLayout from '../../components/layout/ScreenLayout';
import PostList, { AnimatedPostList } from '../../components/PostList';
import Header, { HEADER_HEIGHT } from '../../components/Header';

// Create a memoized user circle component to prevent unnecessary re-renders
const MemoizedUserOnlineCircle = memo(UserOnlineCircle);

const HomeScreen = ({ route, navigation }) => {
    // Get the workspace ID from navigation params or AsyncStorage
    const { organizationId, organizationName } = route?.params || {};
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    
    // Define dummy data for online users
    const dummyUsers = [
        { id: '1', username: 'JohnDoe', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: '2', username: 'JaneSmith', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { id: '3', username: 'MikeJohnson', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg' },
        { id: '4', username: 'EmilyBrown', profileImage: 'https://randomuser.me/api/portraits/women/4.jpg' },
        { id: '5', username: 'DavidWilson', profileImage: 'https://randomuser.me/api/portraits/men/5.jpg' },
        { id: '6', username: 'SarahLee', profileImage: 'https://randomuser.me/api/portraits/women/6.jpg' },
    ];

    // Load current workspace from AsyncStorage
    useEffect(() => {
        const loadWorkspace = async () => {
            try {
                const storedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
                if (storedWorkspace) {
                    setCurrentWorkspace(JSON.parse(storedWorkspace));
                }
            } catch (error) {
                console.error('Error loading workspace from storage:', error);
            }
        };
        
        loadWorkspace();
    }, []);

    // Wrapper for the fetchPostFeed function to match the PostList component's expected format
    const fetchHomePosts = useCallback(async (pageNumber, pageSize) => {
        try {
            const data = await fetchPostFeed(pageNumber);
            return { data: data }; // Wrap in the format PostList expects
        } catch (error) {
            console.error('Error fetching home posts:', error);
            throw error;
        }
    }, []);

    // Refs for optimizing list rendering
    const userListRef = useRef(null);
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastOffset = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const isScrolling = useRef(false);
    const scrollEndTimeout = useRef(null);

    // Memoized key extractors for better performance
    const userKeyExtractor = useCallback((item) => item.id, []);

    // Memoized render item functions
    const renderUserItem = useCallback(({ item }) => (
        <MemoizedUserOnlineCircle user={item} />
    ), []);

    // Render the online users section
    const renderOnlineUsers = useCallback(() => (
        <View style={styles.onlineUsersSection}>
            <Text style={styles.title}>Online Users</Text>
            <FlatList
                ref={userListRef}
                horizontal
                data={dummyUsers}
                keyExtractor={userKeyExtractor}
                renderItem={renderUserItem}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
            />
        </View>
    ), [userKeyExtractor, renderUserItem, dummyUsers]);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { 
            useNativeDriver: true,
            listener: ({ nativeEvent }) => {
                if (isScrolling.current) return;

                const currentOffset = nativeEvent.contentOffset.y;
                const diff = currentOffset - lastOffset.current;

                // Clear any existing timeout
                if (scrollEndTimeout.current) {
                    clearTimeout(scrollEndTimeout.current);
                }

                // Set a new timeout
                scrollEndTimeout.current = setTimeout(() => {
                    lastOffset.current = currentOffset;
                }, 100);

                if (currentOffset <= 0) {
                    Animated.spring(headerTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 0
                    }).start();
                } else if (Math.abs(diff) > 5) { // Increased threshold
                    isScrolling.current = true;
                    Animated.spring(headerTranslateY, {
                        toValue: diff > 0 ? -HEADER_HEIGHT : 0,
                        useNativeDriver: true,
                        bounciness: 0
                    }).start(() => {
                        isScrolling.current = false;
                    });
                }
            }
        }
    );

    // Enhanced cleanup
    useEffect(() => {
        return () => {
            scrollY.setValue(0);
            headerTranslateY.setValue(0);
            isScrolling.current = false;
            if (scrollEndTimeout.current) {
                clearTimeout(scrollEndTimeout.current);
            }
        };
    }, []);

    // Add refresh handling when returning from creating a post
    useFocusEffect(
        useCallback(() => {
            const refreshFeed = route.params?.refreshFeed;
            if (refreshFeed) {
                // Clear the parameter to prevent multiple refreshes
                navigation.setParams({ refreshFeed: undefined });
                // PostList will handle refresh internally
            }
        }, [route.params?.refreshFeed, navigation])
    );

    const handleCreatePost = () => {
        navigation.navigate('CreatePost');
    };

    return (
        <ScreenLayout 
            backgroundColor={ColorPalette.dark_bg} 
            statusBarStyle="light-content"
        >
            <Header 
            title={currentWorkspace?.name || organizationName}
                onCreatePost={handleCreatePost} 
                animatedStyle={{ transform: [{ translateY: headerTranslateY }] }}
            />
            <AnimatedPostList
                fetchPostsFunction={fetchHomePosts}
                ListHeaderComponent={renderOnlineUsers}
                navigation={navigation}
                keyExtractorPrefix="home-post"
                emptyText="No posts found"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.listContainer,
                    { paddingTop: HEADER_HEIGHT }
                ]}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    onlineUsersSection: {
        marginBottom: 10,
        marginTop: 30,
    },
    title: {
        fontSize: 18,
        color: ColorPalette.white,
        marginBottom: 5,
        fontFamily: 'CG-Medium',
        paddingHorizontal: 10,
    },
    list: {
        marginTop: 10,
        marginBottom: 20
    },
    listContent: {
        paddingHorizontal: 10,
    },
    listContainer: {
        flexGrow: 1,
    },
});

export default HomeScreen;