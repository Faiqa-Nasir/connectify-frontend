import React, { useCallback, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';
import { useSelector } from 'react-redux';
import ScreenLayout from '../../components/layout/ScreenLayout';
import PostList, { AnimatedPostList } from '../../components/PostList';
import Header, { HEADER_HEIGHT } from '../../components/Header';
import { fetchAnnouncements } from '../../services/postService';
import { clearAnnouncementCache } from '../../services/commentService';


const NoticeBoardScreen = ({ navigation }) => {
    const user = useSelector(state => state.auth.user);
    const isAdmin = user?.role === 'admin';
    
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastOffset = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const isScrolling = useRef(false);
    const scrollEndTimeout = useRef(null);

    // Add cleanup effect
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

    const fetchAnnouncementPosts = useCallback(async (pageNumber, pageSize) => {
        try {
            if (pageNumber === 1) {
                // Clear cache when refreshing from start
                await clearAnnouncementCache();
            }
            const data = await fetchAnnouncements(pageNumber);
            return { data: data };
        } catch (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }
    }, []);

    const handleCreateAnnouncement = () => {
        // Pass type as a parameter to CreatePost screen
        navigation.navigate('CreatePost', { 
            postType: 'announcement',
            title: 'Announcement',
        });
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { 
            useNativeDriver: true,
            listener: ({ nativeEvent }) => {
                if (isScrolling.current) return;

                const currentOffset = nativeEvent.contentOffset.y;
                const diff = currentOffset - lastOffset.current;

                if (scrollEndTimeout.current) {
                    clearTimeout(scrollEndTimeout.current);
                }

                scrollEndTimeout.current = setTimeout(() => {
                    lastOffset.current = currentOffset;
                }, 100);

                if (currentOffset <= 0) {
                    Animated.spring(headerTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 0
                    }).start();
                } else if (Math.abs(diff) > 5) {
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

    return (
        <ScreenLayout 
            backgroundColor={ColorPalette.dark_bg} 
            statusBarStyle="light-content"
        >
            <Header 
                title="Announcements"
                showCreateButton={isAdmin}
                onCreatePost={handleCreateAnnouncement}
                animatedStyle={{ transform: [{ translateY: headerTranslateY }] }}
            />
            <View style = {{ flex: 1, marginTop: HEADER_HEIGHT+6 }}>
            <AnimatedPostList
                fetchPostsFunction={fetchAnnouncementPosts}
                navigation={navigation}
                keyExtractorPrefix="announcement"
                emptyText="No announcements found"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={[
                    styles.listContainer,
                    { paddingTop: HEADER_HEIGHT }
                ]}
            />
            </View>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,

    },
});

export default NoticeBoardScreen;