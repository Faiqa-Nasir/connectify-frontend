import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import ColorPalette from '../../constants/ColorPalette';
import UserOnlineCircle from '../../components/UserOnlineCircle';
import CreatePostButton from '../../components/CreatePostButton';
import { fetchPostFeed } from '../../services/postService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import ScreenLayout from '../../components/layout/ScreenLayout';
import PostList from '../../components/PostList';

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

    return (
        <ScreenLayout 
            backgroundColor={ColorPalette.dark_bg} 
            statusBarStyle="light-content"
        >
            <PostList
                fetchPostsFunction={fetchHomePosts}
                ListHeaderComponent={renderOnlineUsers}
                navigation={navigation}
                keyExtractorPrefix="home-post"
                emptyText="No posts found"
                
            />
            <CreatePostButton />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    // ...existing styles related to layout and online users...
    onlineUsersSection: {
        marginBottom: 10,
        marginTop: 20,
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
});

export default HomeScreen;