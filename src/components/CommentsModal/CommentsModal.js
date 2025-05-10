import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TextInput, 
  Platform,
  TouchableOpacity,
  Animated,
  ActivityIndicator
} from 'react-native';
import DynamicModal from '../DynamicModal';
import ColorPalette from '../../constants/ColorPalette';
import { Ionicons } from '@expo/vector-icons';
import { fetchComments, createComment, fetchReplies, updateComment, deleteComment } from '../../services/commentService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserData } from '../../utils/userUtils';
import LoadingIndicator from '../common/LoadingIndicator';
import ConfirmationAlert from '../ConfirmationAlert';
import CustomAlert from '../CustomAlert';

const CommentsModal = ({ visible, onClose, postId }) => {
  // State for comment input and handling
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Current user data
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI state
  const [likeAnimations, setLikeAnimations] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Error handling
  const [error, setError] = useState(null);
  
  // Confirmation dialog
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Custom alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  
  // Flat list reference for scrolling
  const flatListRef = useRef(null);

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

  // Get current user data when component mounts
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setCurrentUser(userData);
          
          // Update is_own flag for existing comments after getting user data
          if (comments.length > 0) {
            setComments(prevComments => 
              prevComments.map(comment => ({
                ...comment,
                is_own: Number(comment.user?.id) === Number(userData.id),
                replies: comment.replies?.map(reply => ({
                  ...reply,
                  is_own: Number(reply.user?.id) === Number(userData.id)
                }))
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (visible) {
      getUserData();
    }
  }, [visible, comments.length]);

  // Fetch comments when modal becomes visible or postId changes
  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  // Function to load comments from API
  const loadComments = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
      setPage(1);
    } else if (!refresh && page === 1) {
      setLoading(true);
    }
    
    try {
      setError(null);
      const response = await fetchComments(postId, 1);
      
      if (response?.data?.results) {
        // Process comments to add is_own flag based on current user
        const processedComments = response.data.results.map(comment => ({
          ...comment,
          is_own: currentUser ? Number(comment.user?.id) === Number(currentUser.id) : false,
          replies: comment.replies?.map(reply => ({
            ...reply,
            is_own: currentUser ? Number(reply.user?.id) === Number(currentUser.id) : false
          }))
        }));
        
        setComments(processedComments);
        
        // Check if there are more pages based on total count and page size
        const totalCount = response.data.count || 0;
        const currentResults = response.data.results.length;
        const hasNextPage = totalCount > currentResults && !!response.data.next;
        
        setHasMore(hasNextPage);
      } else {
        setComments([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError(error.message || 'Failed to load comments. Please try again.');
      showAlert('error', error.message || 'Failed to load comments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to load more comments (pagination)
  const loadMoreComments = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      // Double-check if current comments count indicates we need another page
      const currentCommentsCount = comments.length;
      if (currentCommentsCount < page * 10) {
        console.log('No need to load more comments, current count is less than expected');
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      
      const response = await fetchComments(postId, nextPage, 10, false);
      
      if (response?.data?.results?.length > 0) {
        // Process new comments to add is_own flag based on current user
        const processedNewComments = response.data.results.map(comment => ({
          ...comment,
          is_own: currentUser ? Number(comment.user?.id) === Number(currentUser.id) : false,
          replies: comment.replies?.map(reply => ({
            ...reply,
            is_own: currentUser ? Number(reply.user?.id) === Number(currentUser.id) : false
          }))
        }));
        
        setComments(prev => [...prev, ...processedNewComments]);
        
        // Check if there might be more pages after this one
        const totalCount = response.data.count || 0;
        const hasNextPage = totalCount > (currentCommentsCount + response.data.results.length);
        
        setHasMore(hasNextPage && !!response.data.next);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
      // No need to show an alert for pagination errors
      setHasMore(false); // Prevent further attempts if an error occurs
    } finally {
      setLoadingMore(false);
    }
  };

  // Function to handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      // Set refreshing to true to show the loading indicator
      setRefreshing(true);
      
      // Reset pagination
      setPage(1);
      setHasMore(true);
      
      // Make API call to get fresh data
      fetchComments(postId, 1)
        .then(response => {
          if (response?.data?.results) {
            // Process comments to add is_own flag based on current user
            const processedComments = response.data.results.map(comment => ({
              ...comment,
              is_own: currentUser ? Number(comment.user?.id) === Number(currentUser.id) : false,
              replies: comment.replies?.map(reply => ({
                ...reply,
                is_own: currentUser ? Number(reply.user?.id) === Number(currentUser.id) : false
              }))
            }));
            
            setComments(processedComments);
            
            // Check if there are more pages based on total count and page size
            const totalCount = response.data.count || 0;
            const currentResults = response.data.results.length;
            const hasNextPage = totalCount > currentResults && !!response.data.next;
            
            setHasMore(hasNextPage);
          } else {
            setComments([]);
            setHasMore(false);
          }
        })
        .catch(error => {
          console.error('Error refreshing comments:', error);
          setError(error.message || 'Failed to refresh comments. Please try again.');
          showAlert('error', error.message || 'Failed to refresh comments');
        })
        .finally(() => {
          setRefreshing(false);
        });
    }
  }, [refreshing, postId, currentUser]);

  // Function to like/unlike a comment
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

    // Update comment likes (this would be replaced with an actual API call)
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

  // Function to prepare reply to a comment
  const handleReply = (username, commentId) => {
    setReplyingTo({ username, commentId });
    setReplyText(`@${username} `);
    
    // Focus the text input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Function to submit a reply
  const submitReply = async () => {
    if (!replyingTo || replyText.trim() === '') return;
    
    try {
      // Create an optimistic update
      const tempId = `temp-${Date.now()}`;
      const newReply = {
        id: tempId,
        user: currentUser,
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
        likes_count: 0,
        is_liked: false,
        is_own: true, // This is the current user's reply
        _isOptimistic: true
      };

      // Update UI immediately with optimistic data
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

      // Reset input
      setReplyText('');
      setReplyingTo(null);

      // Make API call
      const response = await createComment(
        postId, 
        replyText.trim(), 
        replyingTo.commentId
      );

      // Update the comment with the real data and ensure is_own is set
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === replyingTo.commentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply => {
                if (reply.id === tempId) {
                  return {
                    ...response,
                    is_own: currentUser ? Number(response.user?.id) === Number(currentUser.id) : false,
                    _isOptimistic: false
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        });
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      
      // Remove the optimistic update on error
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === replyingTo.commentId) {
            return {
              ...comment,
              replies: (comment.replies || []).filter(reply => !reply._isOptimistic)
            };
          }
          return comment;
        });
      });
      
      showAlert('error', error.message || 'Failed to post reply');
    }
  };

  // Function to submit a new comment
  const submitComment = async () => {
    if (comment.trim() === '') return;
    
    try {
      // Create an optimistic update
      const tempId = `temp-${Date.now()}`;
      const newComment = {
        id: tempId,
        user: currentUser,
        content: comment.trim(),
        timestamp: new Date().toISOString(),
        likes_count: 0,
        is_liked: false,
        is_own: true, // This is the current user's comment
        replies: [],
        _isOptimistic: true
      };

      // Update UI immediately with optimistic data
      setComments(prevComments => [newComment, ...prevComments]);
      
      // Reset input
      setComment('');

      // Make API call
      const response = await createComment(postId, comment.trim());

      // Update the comment with the real data and ensure is_own is set
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === tempId ? { 
            ...response, 
            is_own: currentUser ? Number(response.user?.id) === Number(currentUser.id) : false,
            _isOptimistic: false 
          } : c
        )
      );
      
      // Scroll to top to see the new comment
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      
      // Remove the optimistic update on error
      setComments(prevComments => prevComments.filter(c => c.id !== tempId));
      
      showAlert('error', error.message || 'Failed to post comment');
    }
  };
  
  // Function to set a comment for editing
  const handleEdit = (comment) => {
    // Cancel any previous editing operation first
    if (editingComment) {
      setEditingComment(null);
      setEditText('');
    }
    
    // Set the comment for editing and reuse the main comment input
    setEditingComment(comment);
    setComment(comment.content); // Use the main comment input
    
    // Focus the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
    
    console.log('Setting comment for editing:', comment.id, comment.content);
  };
  
  // Function to submit an edited comment
  const submitEdit = async () => {
    if (!editingComment || comment.trim() === '') {
      setEditingComment(null);
      return;
    }
    
    // If content hasn't changed, just cancel editing
    if (comment.trim() === editingComment.content) {
      setEditingComment(null);
      setComment('');
      return;
    }
    
    const originalContent = editingComment.content;
    const commentId = editingComment.id;
    
    console.log('Submitting edited comment:', commentId, comment.trim());
    
    try {
      // Update UI immediately with optimistic data
      setComments(prevComments => 
        prevComments.map(c => {
          if (c.id === commentId) {
            return { ...c, content: comment.trim(), _isEditing: true };
          }
          
          // Check if it's a reply that needs updating
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, content: comment.trim(), _isEditing: true }
                  : r
              )
            };
          }
          
          return c;
        })
      );
      
      // Reset editing state
      const tempEditingComment = { ...editingComment };
      setEditingComment(null);
      setComment('');
      
      // Make API call - store response for potential error recovery
      const response = await updateComment(commentId, comment.trim());
      console.log('Comment updated successfully:', response);
      
      // Remove the editing flag and update with server response data if available
      setComments(prevComments => 
        prevComments.map(c => {
          if (c.id === commentId) {
            return { 
              ...c, 
              _isEditing: false,
              content: response ? response.content : c.content
            };
          }
          
          // Check if it's a reply that needs updating
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { 
                      ...r, 
                      _isEditing: false,
                      content: response ? response.content : r.content
                    }
                  : r
              )
            };
          }
          
          return c;
        })
      );
      
      // Show success message
      showAlert('success', 'Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      
      // Set editing state back to allow user to try again
      setEditingComment(tempEditingComment);
      setComment(originalContent);
      
      // Revert to original content on error
      setComments(prevComments => 
        prevComments.map(c => {
          if (c.id === commentId) {
            return { ...c, content: originalContent, _isEditing: false };
          }
          
          // Check if it's a reply that needs reverting
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: c.replies.map(r => 
                r.id === commentId 
                  ? { ...r, content: originalContent, _isEditing: false }
                  : r
              )
            };
          }
          
          return c;
        })
      );
      
      showAlert('error', error.message || 'Failed to update comment');
    }
  };
  
  // Function to confirm and delete a comment
  const handleDelete = (commentId, isReply = false, parentId = null) => {
    console.log('Confirming delete for comment:', commentId, 'isReply:', isReply, 'parentId:', parentId);
    
    showConfirmation(
      'Are you sure you want to delete this comment? This action cannot be undone.',
      async () => {
        try {
          console.log('Deleting comment:', commentId);
          
          // Save a copy of the comments before deletion for potential recovery
          const previousComments = [...comments];
          
          // Optimistically remove the comment from UI
          if (isReply && parentId) {
            // If it's a reply, remove it from the parent comment's replies
            setComments(prevComments => 
              prevComments.map(c => {
                if (c.id === parentId) {
                  return {
                    ...c,
                    replies: (c.replies || []).filter(r => r.id !== commentId)
                  };
                }
                return c;
              })
            );
          } else {
            // If it's a top-level comment, remove it entirely
            setComments(prevComments => 
              prevComments.filter(c => c.id !== commentId)
            );
          }
          
          // Make API call
          await deleteComment(commentId);
          
          // Show success message
          showAlert('success', 'Comment deleted successfully');
        } catch (error) {
          console.error('Error deleting comment:', error);
          
          // Reload comments on error to ensure cache is updated
          loadComments();
          
          showAlert('error', error.message || 'Failed to delete comment');
        }
      }
    );
  };

  // Show a confirmation dialog
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };
  
  // Show an alert message
  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setAlertVisible(false);
    }, 3000);
  };
  
  // Reference to the text input for focusing
  const inputRef = useRef(null);

  // Render a reply
  const renderReply = ({ item, parentId }) => {
    // Check if animation exists before using it
    const animation = likeAnimations[item.id] || new Animated.Value(1);
    
    // Format timestamp to a human-readable format
    const timeAgo = item.timestamp 
      ? new Date(item.timestamp).toLocaleDateString()
      : 'Just now';
    
    // Determine if this is the current user's reply
    const isOwn = item.is_own || (currentUser && Number(item.user?.id) === Number(currentUser.id));
    
    return (
      <View style={styles.replyContainer}>
        <Image 
          source={{ 
            uri: item.user?.profile_image || item.user?.profileImage || 'https://via.placeholder.com/150'
          }} 
          style={styles.replyProfileImage} 
        />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
          
          {/* Show different UI for edit mode */}
          {editingComment?.id === item.id ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => {
                    setEditingComment(null);
                    setEditText('');
                  }}
                >
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton]} 
                  onPress={submitEdit}
                >
                  <Text style={styles.saveEditText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.commentText}>{item.content}</Text>
              <View style={styles.commentMeta}>
                <Text style={styles.timeAgo}>{timeAgo}</Text>
                
                <TouchableOpacity 
                  style={styles.likeButton} 
                  onPress={() => handleLikeComment(item.id, true, parentId)}
                >
                  <Animated.View style={{ transform: [{ scale: animation }] }}>
                    <Ionicons 
                      name={item.is_liked ? "heart" : "heart-outline"} 
                      size={14} 
                      color={item.is_liked ? "#FF6B6B" : ColorPalette.grey_text} 
                    />
                  </Animated.View>
                  <Text style={styles.likes}>{item.likes_count || 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => handleReply(item.user.username, parentId)}>
                  <Text style={styles.reply}>Reply</Text>
                </TouchableOpacity>
                
                {/* Show edit/delete for own comments */}
                {isOwn && (
                  <View style={styles.ownControls}>
                    <TouchableOpacity 
                      onPress={() => handleEdit(item)}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDelete(item.id, true, parentId)}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  // Render a comment
  const renderComment = ({ item }) => {
    // Check if animation exists before using it
    const animation = likeAnimations[item.id] || new Animated.Value(1);
    
    // Format timestamp to a human-readable format
    const timeAgo = item.timestamp 
      ? new Date(item.timestamp).toLocaleDateString()
      : 'Just now';
    
    // Determine if this is the current user's comment 
    const isOwn = item.is_own || (currentUser && Number(item.user?.id) === Number(currentUser.id));
    
    return (
      <View style={styles.commentContainer}>
        <Image 
          source={{ 
            uri: item.user?.profile_image || item.user?.profileImage || 'https://via.placeholder.com/150'
          }} 
          style={styles.profileImage} 
        />
        <View style={styles.commentContent}>
          <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
          <Text style={styles.commentText}>{item.content}</Text>
          <View style={styles.commentMeta}>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            
            <TouchableOpacity 
              style={styles.likeButton} 
              onPress={() => handleLikeComment(item.id)}
            >
              <Animated.View style={{ transform: [{ scale: animation }] }}>
                <Ionicons 
                  name={item.is_liked ? "heart" : "heart-outline"} 
                  size={14} 
                  color={item.is_liked ? "#FF6B6B" : ColorPalette.grey_text} 
                />
              </Animated.View>
              <Text style={styles.likes}>{item.likes_count || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleReply(item.user.username, item.id)}>
              <Text style={styles.reply}>Reply</Text>
            </TouchableOpacity>
            
            {/* Show edit/delete for own comments */}
            {isOwn && (
              <View style={styles.ownControls}>
                <TouchableOpacity 
                  onPress={() => handleEdit(item)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id, false)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
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

  // Render list footer component (loading indicator or end of list)
  const renderListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={ColorPalette.gradient_text} size="small" />
        </View>
      );
    }
    
    if (!hasMore && comments.length > 0) {
      return (
        <Text style={styles.endOfCommentsText}>No more comments</Text>
      );
    }
    
    return null;
  };
  
  // Render empty component when there are no comments
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={ColorPalette.gradient_text} size="large" />
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={ColorPalette.grey_text} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadComments()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={48} color={ColorPalette.grey_text} />
        <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
      </View>
    );
  };

  // Render comment input
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.inputContainer}>
        <Image 
          source={{ 
            uri: currentUser?.profile_image || 'https://via.placeholder.com/150'
          }} 
          style={styles.currentUserImage}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={
            editingComment 
              ? "Edit your comment..." 
              : (replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment...")
          }
          placeholderTextColor={ColorPalette.grey_text}
          value={replyingTo ? replyText : comment}
          onChangeText={replyingTo ? setReplyText : setComment}
          blurOnSubmit={false}
          multiline
        />
        
        {(replyingTo || editingComment) && (
          <TouchableOpacity 
            onPress={() => {
              if (editingComment) {
                setEditingComment(null);
                setComment('');
              } else {
                setReplyingTo(null);
                setReplyText('');
              }
            }} 
            style={styles.cancelButton}
          >
            <Ionicons name="close-circle" size={20} color={ColorPalette.grey_text} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => {
            if (editingComment) {
              submitEdit();
            } else if (replyingTo && replyText.trim() !== '') {
              submitReply();
            } else if (!replyingTo && comment.trim() !== '') {
              submitComment();
            }
          }}
          disabled={
            (editingComment && comment.trim() === '') || 
            (replyingTo && replyText.trim() === '') || 
            (!editingComment && !replyingTo && comment.trim() === '')
          }
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={
              (editingComment && comment.trim() !== '') || 
              (replyingTo && replyText.trim() !== '') || 
              (!editingComment && !replyingTo && comment.trim() !== '')
                ? ColorPalette.gradient_text 
                : ColorPalette.grey_text
            } 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <DynamicModal
      visible={visible}
      onClose={() => {
        // Reset state when closing the modal
        setEditingComment(null);
        setComment('');
        setReplyingTo(null);
        setReplyText('');
        onClose();
      }}
      title="Comments"
      height="80%"
      noScrollView={true}
    >
      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
      />
      
      {/* Confirmation Alert */}
      <ConfirmationAlert
        visible={confirmVisible}
        message={confirmMessage}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          if (confirmAction) confirmAction();
        }}
        cancelText="Cancel"
        confirmText="Delete"
        confirmColor="#FF4D4F"
      />
      
      <FlatList
        ref={flatListRef}
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComment}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderListFooter}
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Add padding for iOS instead of KeyboardAvoidingView
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
    minHeight: 40,
    maxHeight: 80,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    backgroundColor: ColorPalette.dark_gray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  cancelButton: {
    marginRight: 10,
  },
  emptyContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
  },
  loaderContainer: {
    padding: 16,
    alignItems: 'center',
  },
  endOfCommentsText: {
    textAlign: 'center',
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    padding: 16,
  },
  ownControls: {
    flexDirection: 'row',
    marginLeft: 8,
    zIndex: 2, // Ensure controls stay on top
  },
  editText: {
    color: ColorPalette.gradient_text,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    marginRight: 8,
    padding: 2, // Add padding to increase touch target
  },
  deleteText: {
    color: '#FF6B6B',
    fontFamily: 'CG-Regular',
    fontSize: 12,
    padding: 2, // Add padding to increase touch target
  },
});

export default CommentsModal;
