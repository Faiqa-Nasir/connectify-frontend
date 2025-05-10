import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Post from '../../../components/Post';
import ColorPalette from '../../../constants/ColorPalette';
import ScreenLayout from '../../../components/layout/ScreenLayout';
import { styles } from './styles';
import { transformPost } from '../../../utils/postTransformUtils';
import { fetchTrendPosts } from '../../../services/postService';

const TABS = ['Top', 'Latest', 'Media'];

export default function TrendDetailScreen({ route, navigation }) {
  const { trend, initialPosts = [], refresh = false } = route.params; // Receive the refresh parameter
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(refresh); // Add loading state

  // Fetch trend posts if refresh is true
  useEffect(() => {
    if (refresh) {
      handleRefresh();
    }
  }, [refresh]);

  // Transform and sort initial posts
  const sortedPosts = useMemo(() => {
    // Transform posts first
    const transformedPosts = allPosts.map(post => transformPost(post));

    if (!transformedPosts?.length) return { top: [], latest: [], media: [] };

    // Filter media posts
    const withMedia = transformedPosts.filter(post => post.media?.length > 0);
    
    // Sort by likes/engagement
    const sortedByLikes = [...transformedPosts].sort((a, b) => {
      const aEngagement = (a.likes || 0) + (a.comments || 0);
      const bEngagement = (b.likes || 0) + (b.comments || 0);
      return bEngagement - aEngagement;
    });

    // Sort by date
    const sortedByDate = [...transformedPosts].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    return {
      top: sortedByLikes,
      latest: sortedByDate,
      media: withMedia
    };
  }, [allPosts]);

  const handleRefresh = useCallback(async () => {
    setLoading(true); // Show loader
    setRefreshing(true);
    try {
      const response = await fetchTrendPosts(trend);
      setAllPosts(response.results || []);
    } catch (error) {
      console.error('Error refreshing trend posts:', error);
    } finally {
      setRefreshing(false);
      setLoading(false); // Hide loader
    }
  }, [trend]);

  // Get current tab posts with memoization
  const getCurrentPosts = useCallback(() => {
    const posts = sortedPosts[activeTab === 0 ? 'top' : activeTab === 1 ? 'latest' : 'media'];
    return posts || [];
  }, [activeTab, sortedPosts]);

  const renderContent = () => {
    const currentPosts = getCurrentPosts();
    
    return (
      <View style={styles.contentContainer}>
        {currentPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="folder1" size={48} color={ColorPalette.text_gray} />
            <Text style={styles.emptyText}>
              No {TABS[activeTab].toLowerCase()} posts found for #{trend}
            </Text>
          </View>
        ) : (
          <FlatList
            data={currentPosts}
            renderItem={({ item }) => (
              <Post 
                post={item}
                navigation={navigation}
                showActions={true}
                isDetailView={false}
              />
            )}
            keyExtractor={item => `${trend}-${activeTab}-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={ColorPalette.gradient_text}
                colors={[ColorPalette.gradient_text]}
              />
            }
          />
        )}
      </View>
    );
  };

  if (loading && refreshing) {
    return (
      <ScreenLayout backgroundColor={ColorPalette.dark_bg} statusBarStyle="light-content">
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={ColorPalette.gradient_text} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={ColorPalette.dark_bg} statusBarStyle="light-content">
      <View style={styles.container}>
        <View style={styles.tabs}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab]}
              onPress={() => setActiveTab(index)}
            >
              <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </View>
    </ScreenLayout>
  );
}