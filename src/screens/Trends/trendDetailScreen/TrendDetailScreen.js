import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import PeopleList from '../../../components/peopleList/PeopleList';
import ColorPalette from '../../../constants/ColorPalette';
import { styles } from './styles';

const TABS = ['Top', 'Latest', 'People', 'Media'];

const POSTS_DATA = [
  {
    id: '1',
    name: 'Komol Kuchkarov',
    username: '@kkuchkarov',
    avatar: 'https://via.placeholder.com/48',
    timestamp: '6d',
    content: 'When we first launched #SQUID, we set a goal to double our downloads by the end of 2019. We hit 47K+ downloads!',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KHlJ2SMTId6saFtOYLZWXWoEJ8i0fi.png'],
  },
];

const PEOPLE_DATA = [
  { id: '1', name: 'Alice Johnson', username: '@alice_j', avatar: 'https://via.placeholder.com/48' },
  { id: '2', name: 'Bob Smith', username: '@bobsmith', avatar: 'https://via.placeholder.com/48' },
];

export default function TrendDetailScreen({ route }) {
  const [activeTab, setActiveTab] = useState(0); // Index-based tabs
  const [liked, setLiked] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  const toggleLike = () => setLiked(!liked);

  const handleSwipe = ({ nativeEvent }) => {
    if (nativeEvent.translationX < -20) {
      // Swipe left
      setActiveTab(prev => (prev < TABS.length - 1 ? prev + 1 : prev));
    } else if (nativeEvent.translationX > 20) {
      // Swipe right
      setActiveTab(prev => (prev > 0 ? prev - 1 : prev));
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.header}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.images.length > 0 && <Image source={{ uri: item.images[0] }} style={styles.singleImage} />}
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <AntDesign name={liked ? 'heart' : 'hearto'} size={20} color={liked ? 'red' : '#aaa'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCommentsVisible(true)}>
          <Feather name="message-circle" size={20} color="#aaa" style={styles.iconSpacing} />
        </TouchableOpacity>
        <Feather name="repeat" size={20} color="#aaa" style={styles.iconSpacing} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === index && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipeable Content */}
      <PanGestureHandler
        onGestureEvent={handleSwipe}
        activeOffsetX={[-10, 10]} // Adjust for sensitivity
        minDeltaX={10} // Minimum horizontal distance to detect a swipe
        minVelocityX={0.1} // Minimum velocity to detect a swipe
      >
        <View style={styles.contentContainer}>
          {activeTab === 2 && <PeopleList data={PEOPLE_DATA} />}
          {activeTab === 3 && (
            <FlatList data={POSTS_DATA} renderItem={({ item }) => <Image source={{ uri: item.images[0] }} style={styles.gridImage} />} numColumns={3} keyExtractor={item => item.id} />
          )}
          {activeTab !== 2 && activeTab !== 3 && <FlatList data={POSTS_DATA} renderItem={renderPost} keyExtractor={item => item.id} />}
        </View>
      </PanGestureHandler>

      {/* Comments Modal */}
      <Modal visible={commentsVisible} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setCommentsVisible(false)}>
          <View style={styles.commentsContainer}>
            <Text style={styles.commentText}>Comments</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}