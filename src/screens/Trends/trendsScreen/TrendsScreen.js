import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import styles from './styles';
import ColorPalette from '../../../constants/ColorPalette';
import TrendItem from '../../../components/TrendItem/trendItem.js';
import { fetchTrends } from '../../../services/postService';
import ScreenLayout from '../../../components/layout/ScreenLayout';
// const SectionHeader = () => (
//   <View style={styles.sectionHeader}>
//     <Text style={styles.sectionTitle}>Popular Trends</Text>
//     <Text style={styles.sectionSubtitle}>
//       <AntDesign name="rocket1" size={14} color={ColorPalette.text_gray} style={{ marginRight: 6 }} />
//       Discover what's happening
//     </Text>
//   </View>
// );

const FeaturedEvent = ({ trend }) => {
  if (!trend) return null;

  // Format hashtag: remove # and capitalize
  const formattedHashtag = `${trend.hashtag}`;

  return (
    <View style={styles.featuredCard}>
      <LinearGradient
        colors={[ColorPalette.gradient_start, ColorPalette.gradient_end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredBackground}
      >
        <View style={styles.patternOverlay} />
        <View style={styles.featuredContent}>
          <Text style={styles.eventLabel}>Trending Now</Text>
          <Text style={styles.eventTitle}>{formattedHashtag}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.eventStats}>
              {trend.post_count} posts  • Most engaging trend
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function TrendsScreen() {
  const navigation = useNavigation();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredTrend, setFeaturedTrend] = useState(null);

  const loadTrends = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const trendsData = await fetchTrends();
      setTrends(trendsData);
      
      // Select featured trend based on engagement and post count
      const featured = trendsData.reduce((max, trend) => {
        const engagement = trend.posts?.reduce((sum, post) => 
          sum + (post.likes_count || 0) + (post.comments_count || 0), 0
        ) || 0;
        const score = (engagement * 0.7) + (trend.post_count * 0.3);
        return score > (max.score || 0) ? { ...trend, score } : max;
      }, {});
      
      setFeaturedTrend(featured);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrends(false);
  }, []);

  useEffect(() => {
    loadTrends();
  }, []);

  const renderTrendItem = ({ item, index }) => {
    // Format hashtag: remove # and capitalize
    const formattedHashtag = `#${(item.hashtag)}`;
    
    return (
      <TrendItem
        hashtag={formattedHashtag}
        posts={item.post_count}
        index={index}
        onPress={() => navigation.navigate('TrendsDetailScreen', {
          trend: item.hashtag,
          initialPosts: item.posts
        })}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <AntDesign name="notification" size={48} color={ColorPalette.text_gray} />
      <Text style={styles.emptyStateText}>
        No trends available at the moment.{'\n'}Check back later!
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ScreenLayout backgroundColor={ColorPalette.dark_bg} statusBarStyle="light-content">
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={ColorPalette.gradient_text} />
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout backgroundColor={ColorPalette.dark_bg} statusBarStyle="light-content">
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTrends()}>
            <Text style={{ color: ColorPalette.text_white, fontFamily: 'CG-Medium' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={ColorPalette.dark_bg} statusBarStyle="light-content">
      <View style={styles.container}>
        <FlatList
          data={trends}
          renderItem={renderTrendItem}
          keyExtractor={item => item.hashtag}
          ListHeaderComponent={() => (
            <>
              <FeaturedEvent trend={featuredTrend} />
              {/* <SectionHeader /> */}
            </>
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.trendsListContainer,
            trends.length === 0 && { flex: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ColorPalette.gradient_text}
              colors={[ColorPalette.gradient_text]}
            />
          }
        />

        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => navigation.navigate('CreateTrendScreen')}
        >
          <LinearGradient
            colors={[ColorPalette.gradient_start, ColorPalette.gradient_end]}
            style={{ width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }}
          >
            <AntDesign name="plus" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}
