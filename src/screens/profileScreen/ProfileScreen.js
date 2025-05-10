import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ColorPalette from '../../constants/ColorPalette';
import api from '../../services/apiService';
import { POST_ENDPOINTS } from '../../constants/ApiConstants';
import ScreenLayout from '../../components/layout/ScreenLayout';
import PostList from '../../components/PostList';
import { fetchUserData } from '../../utils/userUtils';

const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    postCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  // Track if the userInfo is sticky
  const [isUserInfoSticky, setIsUserInfoSticky] = useState(false);

  // Use the fetchUserData utility and set the local state
  const loadUserData = useCallback(async () => {
    try {
      const user = await fetchUserData();
      if (user) {
        setUserData(user);
        return user;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  }, []);

  // Handle real-time updates to post count
  const handlePostCountChange = useCallback((count) => {
    setStats(prev => ({
      ...prev,
      postCount: count
    }));
  }, []);

  // Wrapper function for the PostList component
  const fetchUserPosts = useCallback(async (pageNumber, pageSize) => {
    try {
      const response = await api.get(POST_ENDPOINTS.USER_POSTS, {
        params: {
          page: pageNumber,
          page_size: pageSize
        }
      });
      
      // Update post count in stats
      if (pageNumber === 1) {
        setStats(prev => ({
          ...prev,
          postCount: response.data.count || 0
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      
      throw error;
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await loadUserData();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [loadUserData]);

  // Check for new posts passed via navigation params
  useEffect(() => {
    if (route.params?.newPost) {
      // If we have a new post directly from navigation
      const newPost = route.params.newPost;
      
      // Update stats immediately
      setStats(prev => ({
        ...prev,
        postCount: prev.postCount + 1
      }));
      
      // Clear the navigation params to prevent duplicate posts
      navigation.setParams({ newPost: undefined });
    }
  }, [route.params?.newPost, navigation]);
  
  // Add a useEffect to detect the refresh parameter from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      // Refresh posts from API when coming back from post creation
      fetchUserPosts();
      
      // Clear the refresh param to avoid multiple refreshes
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh, navigation]);

  // Navigate to account settings
  const navigateToAccountSettings = () => {
    navigation.navigate('Account');
  };

  // Handle scroll events to determine when UserInfo becomes sticky
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Threshold at which we consider the header sticky (adjust as needed)
    const threshold = 180;
    setIsUserInfoSticky(offsetY > threshold);
  };

  // Render the header with user info and stats
  const renderHeader = () => (
    <>
      <View style={styles.profileHeader}>
        {/* User Info Section - This will be duplicated for the sticky version */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            {userData?.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData?.first_name?.charAt(0) || userData?.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {userData ? `${userData.first_name} ${userData.last_name}` : 'Loading...'}
            </Text>
            <Text style={styles.userHandle}>@{userData?.username || 'username'}</Text>
          </View>
          <View style={styles.postsCountWrapper}>
            <Text style={styles.statNumber}>{stats.postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createPostBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add" size={22} color={ColorPalette.white} />
          </TouchableOpacity>
        </View>
        
        {/* Posts Heading */}
        <View style={styles.postsHeaderContainer}>
          <Text style={styles.postsHeading}>My Posts</Text>
        </View>
      </View>
    </>
  );

  // Render the sticky user info bar
  const renderStickyUserInfo = () => (
    <View style={[styles.stickyUserInfoContainer, isUserInfoSticky ? styles.stickyActive : styles.stickyHidden]}>
      <View style={styles.stickyAvatarContainer}>
        {userData?.profileImage ? (
          <Image 
            source={{ uri: userData.profileImage }} 
            style={styles.stickyAvatar} 
          />
        ) : (
          <View style={styles.stickyAvatarPlaceholder}>
            <Text style={styles.stickyAvatarText}>
              {userData?.first_name?.charAt(0) || userData?.email?.charAt(0) || '?'}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.stickyUserInfo}>
        <Text style={styles.stickyUserName}>
          {userData ? `${userData.first_name} ${userData.last_name}` : 'Loading...'}
        </Text>
        <Text style={styles.stickyUserHandle}>@{userData?.username || 'username'}</Text>
      </View>
      <View style={styles.stickyPostsCountWrapper}>
        <Text style={styles.stickyStatNumber}>{stats.postCount}</Text>
        <Text style={styles.stickyStatLabel}>Posts</Text>
      </View>
    </View>
  );

  return (
    <ScreenLayout 
      backgroundColor={ColorPalette.main_black} 
      statusBarStyle="light-content"
    >
      {/* Header with title and account button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={navigateToAccountSettings}
        >
          <Ionicons name="settings-outline" size={24} color={ColorPalette.white} />
        </TouchableOpacity>
      </View>
      
      {/* Sticky User Info that appears when scrolling */}
      {renderStickyUserInfo()}
      
      {/* Use our new PostList component with the onPostCountChange prop */}
      <PostList
        fetchPostsFunction={fetchUserPosts}
        ListHeaderComponent={renderHeader}
        navigation={navigation}
        onScroll={handleScroll}
        keyExtractorPrefix="profile-post"
        emptyText="No posts yet"
        onPostCountChange={handlePostCountChange}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.main_black,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  headerTitle: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Medium',
  },
  settingsButton: {
    padding: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: ColorPalette.white,
    fontSize: 32,
    fontFamily: 'CG-Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: ColorPalette.white,
    fontSize: 22,
    fontFamily: 'CG-Bold',
    marginBottom: 4,
  },
  userHandle: {
    color: ColorPalette.grey_text,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    marginBottom: 4,
  },
  userRole: {
    color: ColorPalette.green,
    fontSize: 14,
    fontFamily: 'CG-Medium',
  },
  postsCountWrapper: {
    alignItems: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: ColorPalette.border_color || '#2A2A2A',
  },
  actionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: ColorPalette.card_bg || '#1A1A1A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  editProfileText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  createPostBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postsHeaderContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  postsHeading: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: ColorPalette.grey_text,
    fontSize: 16,
    fontFamily: 'CG-Regular',
    marginTop: 16,
    marginBottom: 24,
  },
  createPostButton: {
    backgroundColor: ColorPalette.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createPostText: {
    color: ColorPalette.white,
    fontSize: 16,
    fontFamily: 'CG-Medium',
  },
  loader: {
    marginVertical: 20,
  },
  stickyUserInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorPalette.main_black,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
    position: 'absolute',
    top: 40, // Just below the header container
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyActive: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  stickyHidden: {
    opacity: 0,
    transform: [{ translateY: -60 }],
  },
  stickyAvatarContainer: {
    marginRight: 12,
  },
  stickyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  stickyAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ColorPalette.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyAvatarText: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Bold',
  },
  stickyUserInfo: {
    flex: 1,
  },
  stickyUserName: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Medium',
  },
  stickyUserHandle: {
    color: ColorPalette.grey_text,
    fontSize: 12,
    fontFamily: 'CG-Regular',
  },
  stickyPostsCountWrapper: {
    alignItems: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: ColorPalette.border_color || '#2A2A2A',
  },
  stickyStatNumber: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Bold',
  },
  stickyStatLabel: {
    color: ColorPalette.grey_text,
    fontSize: 12,
    fontFamily: 'CG-Regular',
  },
  statNumber: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Bold',
  },
    statLabel: {
        color: ColorPalette.grey_text,
        fontSize: 14,
        fontFamily: 'CG-Regular',
    },
});

export default ProfileScreen;
