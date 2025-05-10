import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Post from '../Post';
import ColorPalette from '../../constants/ColorPalette';
import { transformPost } from '../../utils/postTransformUtils';
import LoadingIndicator from '../common/LoadingIndicator';

const PostList = ({ 
  fetchPostsFunction, 
  ListHeaderComponent, 
  ListEmptyComponent,
  navigation,
  initialPosts = [],
  initialPage = 1,
  initialHasMore = true,
  onScroll,
  pageSize = 10,
  refreshEnabled = true,
  emptyText = "No posts yet",
  refreshControlColors = [ColorPalette.green],
  refreshControlTintColor = ColorPalette.green,
  keyExtractorPrefix = "post",
  onPostCountChange, // New prop for notifications
}) => {
  // State for posts, pagination, and loading states
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState(null);
  
  // Reference to the FlatList
  const flatListRef = useRef(null);

  // Fetch posts with pagination support
  const fetchPosts = useCallback(async (pageNumber = 1, shouldRefresh = false) => {
    if (shouldRefresh) {
      setRefreshing(true);
    } else if (!initialLoadComplete && pageNumber === 1) {
      setLoading(true);
    }
    
    try {
      const response = await fetchPostsFunction(pageNumber, pageSize);
      
      // Process posts using the shared transformPost function if needed
      const newPosts = response.data.results || [];
      const processedPosts = newPosts.map(post => 
        typeof post.id !== 'undefined' ? transformPost(post) : post
      );
      
      if (shouldRefresh || pageNumber === 1) {
        setPosts(processedPosts);
        if (pageNumber === 1) {
          setInitialLoadComplete(true);
        }
      } else {
        // Filter out any duplicates when appending
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = processedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      }
      
      // Check if there are more posts to fetch
      setHasMore(!!response.data.next);
      
      setPage(pageNumber);
      return { 
        posts: processedPosts, 
        total: response.data.count || 0,
        hasMore: !!response.data.next
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to load posts. Please try again.');
      return { posts: [], total: 0, hasMore: false };
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchPostsFunction, pageSize, initialLoadComplete]);

  // Load data on mount
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    const { total } = await fetchPosts(1, true);
    return total;
  }, [fetchPosts, refreshing]);

  // Load more posts when reaching the end
  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || refreshing) return;
    
    const nextPage = page + 1;
    fetchPosts(nextPage);
  }, [hasMore, loading, refreshing, page, fetchPosts]);

  // Generate a truly unique key for each post
  const keyExtractor = useCallback((item, index) => {
    return `${keyExtractorPrefix}-${item.id}-${index}`;
  }, [keyExtractorPrefix]);

  // Handle post deletion - updated to notify parent about count change
  const handlePostDeleted = useCallback((deletedPostId) => {
    // Remove the deleted post from the list
    setPosts(prev => {
      const newPosts = prev.filter(post => post.id !== deletedPostId);
      
      // Notify parent component about the updated post count
      if (onPostCountChange && newPosts.length !== prev.length) {
        onPostCountChange(newPosts.length);
      }
      
      return newPosts;
    });
  }, [onPostCountChange]);

  // Update post count on refresh or initial load
  useEffect(() => {
    if (onPostCountChange && initialLoadComplete) {
      onPostCountChange(posts.length);
    }
  }, [posts.length, initialLoadComplete, onPostCountChange]);

  // Render post item
  const renderPostItem = useCallback(({ item }) => {
    return (
      <Post 
        post={item} 
        navigation={navigation} 
        onPostDeleted={handlePostDeleted}
      />
    );
  }, [navigation,handlePostDeleted]);

  // Default empty component
  const defaultEmptyComponent = useCallback(() => {
    // When initially loading, show only the loading indicator
    if (loading && !initialLoadComplete) {
      return (
        <LoadingIndicator 
          fullScreen={true}
        />
      );
    }
    
    // Only show "no posts" UI after initial load is complete
    if (!loading && posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={ColorPalette.grey_text} />
          <Text style={styles.emptyText}>{emptyText}</Text>
          <TouchableOpacity 
            style={styles.createPostButton}
            onPress={() => navigation?.navigate('CreatePost')}
          >
            <Text style={styles.createPostText}>Create Your First Post</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  }, [loading, initialLoadComplete, posts.length, emptyText, navigation]);

  // Footer component showing loading indicator or end of list
  const renderFooter = useCallback(() => {
    if (!posts.length) return null;
    
    if (loading && hasMore && initialLoadComplete) {
      return (
        <LoadingIndicator 
          size="small" 
          style={styles.loader} 
        />
      );
    }
    
    if (!hasMore && posts.length > 0) {
      return (
        <Text style={styles.endOfPostsText}>No more posts</Text>
      );
    }
    
    return null;
  }, [loading, hasMore, posts.length, initialLoadComplete]);

  // Initial loading screen (fullscreen loader)
  if (loading && !initialLoadComplete && posts.length === 0) {
    return <LoadingIndicator fullScreen={true} />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent || defaultEmptyComponent}
      ListFooterComponent={renderFooter}
      contentContainerStyle={[
        styles.listContent,
        posts.length === 0 && { flex: 1 } // This ensures empty component fills space
      ]}
      refreshControl={
        refreshEnabled ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={refreshControlColors}
            tintColor={refreshControlTintColor}
          />
        ) : null
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      initialNumToRender={5}
      windowSize={10}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  endOfPostsText: {
    textAlign: 'center',
    color: ColorPalette.grey_text,
    padding: 16,
    fontFamily: 'CG-Regular',
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPalette.main_black,
  },
});

export default PostList;
