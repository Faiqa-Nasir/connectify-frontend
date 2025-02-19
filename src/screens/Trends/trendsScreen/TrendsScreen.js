import React from 'react';
import { View, Text, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import styles from './styles';
import ColorPalette from '../../../constants/ColorPalette';
import TrendItem from '../../../components/TrendItem/trendItem.js';

const TRENDS_DATA = [
  { id: '1', hashtag: '#SPORTS', posts: 2066 },
  { id: '2', hashtag: '#Finals', posts: 1066 },
  { id: '3', hashtag: '#SPORTSWEEK', posts: 876 },
  { id: '4', hashtag: '#CodingChallenges', posts: 256 },
  { id: '5', hashtag: '#ThesisHelp', posts: 198 },
  { id: '6', hashtag: '#CodeBees', posts: 156 },
  { id: '7', hashtag: '#ExamPreparation', posts: 100 },
  { id: '8', hashtag: '#AttendanceShortage', posts: 85 },
];

const FeaturedEvent = () => (
  <View style={styles.featuredCard}>
    <ImageBackground
      source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZRQ2LX6QgsjoYRJ6ssO4xMgC1QP4Ni.png' }}
      style={styles.featuredImage}
    >
      <LinearGradient
        colors={[ColorPalette.gradient_start, ColorPalette.gradient_end]}
        style={styles.overlay}
      >
        <Text style={styles.eventLabel}>Events</Text>
        <Text style={styles.eventTitle}>Sports Gala 2025</Text>
      </LinearGradient>
    </ImageBackground>
  </View>
);

export default function TrendsScreen() {
  const navigation = useNavigation(); // Get navigation object

  const renderTrendItem = ({ item }) => (
    <TrendItem
      hashtag={item.hashtag}
      posts={item.posts}
      onPress={() => console.log(`Pressed ${item.hashtag}`)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={TRENDS_DATA}
        renderItem={renderTrendItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={FeaturedEvent}
        contentContainerStyle={styles.trendsListContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Plus Button */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => navigation.navigate('CreateTrendScreen')} // Replace with your screen name
      >
        <AntDesign name="plus" size={32} color="white" style={{ alignSelf: 'center',backgroundColor:ColorPalette.gradient_end,padding:8,borderRadius:50 }} />
      </TouchableOpacity>
    </View>
  );
}
