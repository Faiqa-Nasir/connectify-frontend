import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { MessageCircle, Heart, Repeat2, Share } from 'lucide-react-native';
import ColorPalette from '../../constants/ColorPalette';
import styles from './styles';

export default function Post({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    return (
      <View style={styles.imageGrid}>
        {post.images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={post.images.length === 1 ? styles.singleImage : styles.multipleImage}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{post.name}</Text>
          <Text style={styles.username}>{post.username}</Text>
        </View>
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      
      {renderImages()}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(!showComments)}
        >
          <MessageCircle 
            size={20} 
            color={ColorPalette.text_gray}
          />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Repeat2 
            size={20} 
            color={ColorPalette.text_gray}
          />
          <Text style={styles.actionText}>{post.reshares}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleLike}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Heart
              size={20}
              color={isLiked ? ColorPalette.accent : ColorPalette.text_gray}
              fill={isLiked ? ColorPalette.accent : 'none'}
            />
          </Animated.View>
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share 
            size={20} 
            color={ColorPalette.text_gray}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}