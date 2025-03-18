import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';
import UserOnlineCircle from '../../components/UserOnlineCircle';
import Post from '../../components/Post';

const dummyUsers = [
    { id: '1', username: 'JohnDoe', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', username: 'JaneSmith', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', username: 'MikeJohnson', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', username: 'EmilyBrown', profileImage: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: '5', username: 'DavidWilson', profileImage: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: '6', username: 'SarahLee', profileImage: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const dummyPosts = [
    {
        id: '1',
        user: dummyUsers[0],
        media: [
            'https://images.unsplash.com/photo-1501854140801-50d01698950b',
            'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1',
        ],
        caption: 'Beautiful day hiking in the mountains!\nWhat a view! Absolutely breathtaking.\n#nature #adventure @malick',
        likes: 124,
        comments: 8,
        shares: 5,
        timeAgo: '2 hours ago'
    },
    {
        id: '2',
        user: dummyUsers[1],
        media: [
            'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023',
        ],
        caption: 'Enjoying my coffee and the amazing view this morning ☕.\nCan\'t get enough of this peaceful scenery.\nPerfect start to the day!',
        likes: 89,
        comments: 5,
        shares: 2,
        timeAgo: '5 hours ago'
    },
    {
        id: '3',
        user: dummyUsers[2],
        media: [
            'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b',
            'https://images.unsplash.com/photo-1593642532781-03e79bf5bec2',
            'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
        ],
        caption: 'Just got this new tech gadget! What do you think?.\nIt\'s a game changer!\nSo many cool features. #tech #newgadget',
        likes: 212,
        comments: 24,
        timeAgo: '1 day ago'
    },
    {
        id: '4',
        user: dummyUsers[3],
        media: [
            'https://images.unsplash.com/photo-1551316679-9c6ae9dec224',
        ],
        caption: 'Exploring the city today!\nSo much to see and do.\nLoving the urban vibes. #citylife #explore',
        likes: 45,
        comments: 3,
        shares: 1,
        timeAgo: '2 days ago'
    },
];

// Data structure for our main FlatList
const sections = [
    { 
        id: 'onlineUsers',
        type: 'onlineUsers',
        title: 'Online Users',
        data: dummyUsers
    },
    {
        id: 'recentPosts',
        type: 'recentPosts',
        title: 'Recent Posts',
        data: dummyPosts
    }
];

const HomeScreen = ({ route, navigation }) => {
    // Get the workspace ID from navigation params
    const { organizationId, organizationName } = route.params || {};
    
    useEffect(() => {
        // Load workspace data when the screen opens
        if (organizationId) {
            // You can fetch additional workspace data here if needed
            console.log(`Loading workspace: ${organizationId}`);
        }
    }, [organizationId]);

    const renderOnlineUsers = (users) => {
        return (
            <FlatList
                horizontal
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserOnlineCircle user={item} />}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
            />
        );
    };

    const renderItem = ({ item }) => {
        if (item.type === 'onlineUsers') {
            return (
                <View>
                    <Text style={styles.title}>{item.title}</Text>
                    {renderOnlineUsers(item.data)}
                </View>
            );
        } else if (item.type === 'recentPosts') {
            return (
                <View style={styles.postsContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.data.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </View>
            );
        }
        return null;
    };

    return (
        <FlatList
            data={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.container}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.dark_bg,
        paddingTop: 60,
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
    postsContainer: {
        marginBottom: 20,
    }
});