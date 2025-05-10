import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Animated
} from 'react-native';
import DynamicModal from '../DynamicModal';
import ColorPalette from '../../constants/ColorPalette';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Enhanced dummy comments with replies
const initialComments = [
  {
    id: '1',
    user: {
      username: 'JohnDoe',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    text: 'This is such a great post! Love the content you share.',
    timeAgo: '2h ago',
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        user: {
          username: 'MaryJane',
          profileImage: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        text: 'I completely agree with you!',
        timeAgo: '1h ago',
        likes: 3,
        isLiked: false,
      }
    ]
  },
  {
    id: '2',
    user: {
      username: 'MaryJane',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' 
    },
    text: 'Amazing view! Where was this taken?',
    timeAgo: '5h ago',
    likes: 8,
    isLiked: false,
    replies: []
  },
  {
    id: '3',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '4',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '5',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '6',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '7',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '8',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '9',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '10',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '11',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/7.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
  {
    id: '12',
    user: {
      username: 'RobertSmith',
      profileImage: 'https://randomuser.me/api/portraits/men/8.jpg'
    },
    text: 'I was there last month, it was incredible!',
    timeAgo: '1d ago',
    likes: 5,
    isLiked: false,
    replies: []
  },
];

const CommentsModal = ({ visible, onClose, postId }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Fix: Create animation values as a ref to prevent re-creation on each render
  const [likeAnimations, setLikeAnimations] = useState({});
  
  // Initialize animations when comments change
  useEffect(() => {
    const newAnimations = {};
    comments.forEach(comment => {
      newAnimations[comment.id] = newAnimations[comment.id] || new Animated.Value(1);
      if (comment.replies) {
        comment.replies.forEach(reply => {
          newAnimations[reply.id] = newAnimations[reply.id] || new Animated.Value(1);
        });
      }
    });
    setLikeAnimations(newAnimations);
  }, [comments]);

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    // Fix: Check if animation exists before using it
    if (!likeAnimations[commentId]) {
      likeAnimations[commentId] = new Animated.Value(1);
      setLikeAnimations({...likeAnimations});
    }

    // Animate the like button
    Animated.sequence([
      Animated.timing(likeAnimations[commentId], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimations[commentId], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Update comment likes
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked,
                };
              }
              return reply;
            })
          };
        } else if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      });
    });
  };

  const handleReply = (username, commentId) => {
    setReplyingTo({ username, commentId });
    setReplyText(`@${username} `);
  };

  const submitReply = () => {
    if (!replyingTo || replyText.trim() === '') return;

    const newReply = {
      id: `${replyingTo.commentId}-${Date.now()}`,
      user: {
        username: 'CurrentUser',
        profileImage: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      text: replyText.trim(),
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
    };

    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === replyingTo.commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
    });

    setReplyText('');
    setReplyingTo(null);
  };

  const submitComment = () => {
    if (comment.trim() === '') return;

    const newComment = {
      id: `comment-${Date.now()}`,
      user: {
        username: 'CurrentUser',
        profileImage: 'https://randomuser.me/api/portraits/men/5.jpg'
      },
      text: comment.trim(),
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments([...comments, newComment]);
    setComment('');
  };

  const renderReply = ({ item, parentId }) => {
    // Fix: Check if animation exists before using it
    const animation = likeAnimations[item.id] || new Animated.Value(1);
    
    return (
      <View style={styles.replyContainer}>
        <Image source={{ uri: item.user.profileImage }} style={styles.replyProfileImage} />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={() => handleLikeComment(item.id, true, parentId)}
            >
              <Animated.View style={{ transform: [{ scale: animation }] }}>
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={14} 
                  color={item.isLiked ? "#FF6B6B" : ColorPalette.grey_text} 
                />
              </Animated.View>
              <Text style={styles.likes}>{item.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleReply(item.user.username, parentId)}>
              <Text style={styles.reply}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderComment = ({ item }) => {
    // Fix: Check if animation exists before using it
    const animation = likeAnimations[item.id] || new Animated.Value(1);
    
    return (
      <View style={styles.commentContainer}>
        <Image source={{ uri: item.user.profileImage }} style={styles.profileImage} />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={() => handleLikeComment(item.id)}
            >
              <Animated.View style={{ transform: [{ scale: animation }] }}>
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={14} 
                  color={item.isLiked ? "#FF6B6B" : ColorPalette.grey_text} 
                />
              </Animated.View>
              <Text style={styles.likes}>{item.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleReply(item.user.username, item.id)}>
              <Text style={styles.reply}>Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Replies section */}
          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map(reply => renderReply({ item: reply, parentId: item.id }))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.inputContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/5.jpg' }} 
            style={styles.currentUserImage}
          />
          <TextInput
            style={styles.input}
            placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
            placeholderTextColor={ColorPalette.grey_text}
            value={replyingTo ? replyText : comment}
            onChangeText={replyingTo ? setReplyText : setComment}
            blurOnSubmit={false}
          />
          
          {replyingTo && (
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.cancelButton}>
              <Ionicons name="close-circle" size={20} color={ColorPalette.grey_text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => {
              if (replyingTo && replyText.trim() !== '') {
                submitReply();
              } else if (!replyingTo && comment.trim() !== '') {
                submitComment();
              }
            }}
            disabled={(replyingTo ? replyText.trim() === '' : comment.trim() === '')}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={(replyingTo ? replyText.trim() !== '' : comment.trim() !== '') 
                ? ColorPalette.gradient_text 
                : ColorPalette.grey_text} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <DynamicModal
      visible={visible}
      onClose={onClose}
      title="Comments"
      height="80%"
      noScrollView={true}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {renderFooter()}
    </DynamicModal>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add padding to ensure comments aren't hidden behind input
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    color: ColorPalette.white,
    fontFamily: 'CG-Semibold',
    marginBottom: 2,
  },
  commentText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    marginBottom: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    color: ColorPalette.grey_text,
    fontSize: 12,
    marginRight: 10,
    fontFamily: 'CG-Regular',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  likes: {
    color: ColorPalette.grey_text,
    fontSize: 12,
    marginLeft: 3,
    fontFamily: 'CG-Regular',
  },
  reply: {
    color: ColorPalette.grey_text,
    fontSize: 12,
    fontFamily: 'CG-Regular',
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 12,
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  replyProfileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ColorPalette.main_black,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyboardAvoidView: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currentUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    backgroundColor: ColorPalette.dark_gray,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  cancelButton: {
    marginRight: 10,
  },
});

export default CommentsModal;
