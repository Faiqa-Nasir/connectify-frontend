import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ColorPalette from '../../constants/ColorPalette';
import { createPost } from '../../services/postService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaggedUserItem from './components/TaggedUserItem';
import HashtagsInput from './components/HashtagsInput';
import MediaPreview from './components/MediaPreview';
import LoadingOverlay from '../../components/LoadingOverlay';
import UserSearchModal from './components/UserSearchModal';
import ScreenLayout from '../../components/layout/ScreenLayout';
import { transformPost } from '../../utils/postTransformUtils';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { fetchUserData } from '../../utils/userUtils';

const CreatePostScreen = ({ navigation, route }) => {
  // Content state
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false); // New state for media loading
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isBackgroundUpload, setIsBackgroundUpload] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(''); // 'pending', 'success', 'error'
  
  // Reference to text input for focusing
  const contentInputRef = useRef(null);
  
  // Load current workspace from AsyncStorage
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const storedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
        if (storedWorkspace) {
          const workspace = JSON.parse(storedWorkspace);
          setCurrentWorkspace(workspace);
          console.log('Loaded workspace:', workspace);
        }
      } catch (error) {
        console.error('Error loading workspace:', error);
        Alert.alert('Error', 'Failed to load workspace information');
      }
    };
    
    loadWorkspace();
  }, []);
  
  // Request media library permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant media library access to upload photos or videos',
          [{ text: 'OK' }]
        );
      }
    };
    
    requestPermissions();
  }, []);
  
  // Handle selecting media from device library
  const handleSelectMedia = useCallback(async () => {
    setIsMediaLoading(true); // Set media loading to true when selection starts
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - mediaFiles.length, // Limit total to 5 files
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check file size limits (10MB per file)
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        
        const validAssets = result.assets.filter(asset => {
          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert('File too large', `${asset.fileName || 'A file'} exceeds the 10MB limit`);
            return false;
          }
          return true;
        });
        
        // Check if adding these would exceed the 5 file limit
        if (mediaFiles.length + validAssets.length > 5) {
          Alert.alert('Limit Exceeded', 'You can only add up to 5 media files');
          // Only add files up to the limit
          const remainingSlots = 5 - mediaFiles.length;
          if (remainingSlots > 0) {
            setMediaFiles(prev => [...prev, ...validAssets.slice(0, remainingSlots)]);
          }
          return;
        }
        
        // Add the media files to state
        setMediaFiles(prev => [...prev, ...validAssets]);
        console.log(`Added ${validAssets.length} media files`);
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    } finally {
      setIsMediaLoading(false); // Set media loading to false when done
    }
  }, [mediaFiles]);
  
  // Remove a media file
  const handleRemoveMedia = useCallback((index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Handle adding a tagged user
  const handleAddUser = useCallback((user) => {
    setTaggedUsers(prev => {
      // Check if user is already tagged
      if (prev.some(taggedUser => taggedUser.id === user.id)) {
        return prev;
      }
      return [...prev, user];
    });
    setShowUserSearchModal(false);
  }, []);
  
  // Handle removing a tagged user
  const handleRemoveUser = useCallback((userId) => {
    setTaggedUsers(prev => prev.filter(user => user.id !== userId));
  }, []);
  
  // Extract hashtags from content
  const extractHashtags = useCallback((text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    
    if (matches) {
      return matches.map(tag => tag.substring(1)); // Remove # symbol
    }
    return [];
  }, []);
  
  // Handle content change with hashtag extraction
  const handleContentChange = useCallback((text) => {
    setContent(text);
    setHashtags(extractHashtags(text));
  }, [extractHashtags]);
  
  // Validate the post before submission
  const validatePost = useCallback(() => {
    if (!content.trim()) {
      setErrorMessage('Please enter some content for your post');
      return false;
    }
    
    if (!currentWorkspace) {
      setErrorMessage('No workspace selected');
      return false;
    }
    
    return true;
  }, [content, currentWorkspace]);
  
  // Function to prepare post data
  const preparePostData = useCallback(async () => {
    // Create form data for multipart request with media
    const formData = new FormData();
    
    // Add post data
    formData.append('content', content);
    formData.append('organization_id', currentWorkspace.id);
    formData.append('ispublic', isPublic);
    
    // Handle tagged users properly
    if (taggedUsers.length > 0) {
      const taggedUserIds = taggedUsers.map(user => user.id);
      formData.append('tagged_user_ids', JSON.stringify(taggedUserIds));
    }
    
    // Add media files
    for (const [index, file] of mediaFiles.entries()) {
      const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
      const fileType = file.type || (file.uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
      const fileName = file.fileName || `file_${index}.${fileType.split('/')[1]}`;

      // Log each file being added
      console.log(`Adding media file ${index + 1}:`, {
        uri: fileUri,
        type: fileType,
        name: fileName
      });

      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Append the media file as a Blob
        formData.append('media', blob, fileName);
      } catch (error) {
        console.error('Error creating blob:', error);
        Alert.alert('Error', 'Failed to process media file. Please try again.');
        return null;
      }
    }
    
    // Log FormData keys for debugging
    const formDataKeys = [];
    // @ts-ignore
    for (let [key, value] of formData._parts) {
      formDataKeys.push(`${key}: ${typeof value === 'object' ? 'File object' : value}`);
    }
    console.log('FormData contents:', formDataKeys);
    
    return formData;
  }, [content, currentWorkspace, isPublic, taggedUsers, mediaFiles]);
  

  // Check network status
  const checkNetworkStatus = useCallback(async () => {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected && netInfo.isInternetReachable;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }, []);
  
  // Submit the post to the API
  const handleSubmitPost = useCallback(async () => {
    if (!validatePost()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    // Remove the local post creation since we don't want temp posts
    // const localPost = await createLocalPost();
    
    // Prepare post data
    const formData = await preparePostData();
    if (!formData) {
      setIsSubmitting(false);
      return;
    }
    
    // Check network status
    const isNetworkAvailable = await checkNetworkStatus();
    if (!isNetworkAvailable) {
      // Store the post data for later upload
      const uploadQueue = await AsyncStorage.getItem('postUploadQueue');
      const queue = uploadQueue ? JSON.parse(uploadQueue) : [];
      queue.push({
        formData: JSON.stringify(formData),
        timestamp: new Date().toISOString(),
        attempts: 0
      });
      await AsyncStorage.setItem('postUploadQueue', JSON.stringify(queue));
      
      // Make sure to close the loading dialog
      setIsSubmitting(false);
      
      // Inform user and navigate away
      Alert.alert(
        'Post Queued',
        'Your post will be uploaded when network connection is restored.',
        [{ text: 'OK', onPress: () => navigation.navigate('Profile', { refresh: true }) }]
      );
      return;
    }
    
    // For large files or slow connections, offer background upload
    const shouldUseBackgroundUpload = mediaFiles.length > 0;
    
    if (shouldUseBackgroundUpload) {
      // Close loading dialog since we're moving to background uploads
      setIsSubmitting(false);
      
      // Navigate to profile immediately and tell it to refresh from API
      navigation.navigate('Profile', { refresh: true });
      
      // Continue upload in background
      setIsBackgroundUpload(true);
      Alert.alert(
        'Uploading in Background',
        'Your post is being uploaded. You will be notified when it\'s complete.',
        [{ text: 'OK' }]
      );
      
      // Start background upload
      backgroundUpload(formData);
    } else {
      try {
        // For simple posts without media, upload normally
        await createPost(formData, 0, (progress) => {
          setUploadProgress(progress);
        });
        
        // Make sure to close loading dialog
        setIsSubmitting(false);
        
        // Navigate to profile on success with refresh flag
        navigation.navigate('Profile', { refresh: true });
      } catch (error) {
        console.error('Error creating post:', error);
        setErrorMessage(error.message || 'Failed to create post. Please try again.');
        
        // Make sure to close loading dialog on error
        setIsSubmitting(false);
        
        Alert.alert(
          'Error',
          error.message || 'Failed to create post. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [
    validatePost, 
    preparePostData, 
    mediaFiles.length, 
    navigation, 
    checkNetworkStatus, 
    backgroundUpload
  ]);
  
  // Background upload function
  const backgroundUpload = useCallback(async (formData) => {
    try {
      setUploadStatus('pending');
      
      // Perform the upload
      await createPost(formData, 0, (progress) => {
        setUploadProgress(progress);
      });
      
      // On success
      setUploadStatus('success');
      
      // Notify user of successful upload
      Alert.alert(
        'Post Uploaded',
        'Your post has been successfully uploaded.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Background upload error:', error);
      setUploadStatus('error');
      
      // Store in queue for retry
      try {
        const uploadQueue = await AsyncStorage.getItem('postUploadQueue');
        const queue = uploadQueue ? JSON.parse(uploadQueue) : [];
        
        queue.push({
          formData: JSON.stringify(formData),
          timestamp: new Date().toISOString(),
          attempts: 0
        });
        await AsyncStorage.setItem('postUploadQueue', JSON.stringify(queue));
        
        Alert.alert(
          'Upload Failed',
          'Your post will be uploaded when network conditions improve.',
          [{ text: 'OK' }]
        );
      } catch (storageError) {
        console.error('Error storing failed upload:', storageError);
      }
    } finally {
      setIsBackgroundUpload(false);
      setUploadProgress(0);
    }
  }, []);
  
  // Render tagged users list
  const renderTaggedUser = useCallback(({ item }) => (
    <TaggedUserItem 
      user={item} 
      onRemove={handleRemoveUser} 
    />
  ), [handleRemoveUser]);
  
  // Key extractor for lists
  const keyExtractor = useCallback((item, index) => 
    item.id ? `user-${item.id}` : `item-${index}`, 
  []);
  
  return (
    <ScreenLayout
      backgroundColor={ColorPalette.main_black}
      statusBarStyle="light-content"
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              if (content.trim() || mediaFiles.length > 0) {
                Alert.alert(
                  'Discard Post?',
                  'You have unsaved changes. Are you sure you want to discard this post?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          
          <TouchableOpacity
            style={[
              styles.postButton,
              (!content.trim() || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleSubmitPost}
            disabled={!content.trim() || isSubmitting}
          >
            <Text style={[
              styles.postText,  
              (!content.trim() || isSubmitting) && styles.disabledText
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContainer}>
          {/* Workspace info */}
          <View style={styles.workspaceContainer}>
            <Ionicons name="briefcase-outline" size={18} color={ColorPalette.green} />
            <Text style={styles.workspaceText}>
              Posting to: {currentWorkspace ? currentWorkspace.name : 'Loading workspace...'}
            </Text>
          </View>
          
          {/* Error message if any */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          
          {/* Post content input */}
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            multiline
            placeholder="What's on your mind?"
            placeholderTextColor={ColorPalette.grey_text}
            value={content}
            onChangeText={handleContentChange}
            autoFocus
          />
          
          {/* Media loading indicator */}
          {isMediaLoading && (
            <View style={styles.mediaLoadingContainer}>
              <ActivityIndicator size="small" color={ColorPalette.green} />
              <Text style={styles.mediaLoadingText}>Processing media...</Text>
            </View>
          )}
          
          {/* Media previews */}
          {mediaFiles.length > 0 && (
            <View style={styles.mediaPreviewContainer}>
              <MediaPreview 
                mediaFiles={mediaFiles} 
                onRemoveMedia={handleRemoveMedia} 
              />
            </View>
          )}
          
          {/* Tagged users section */}
          {taggedUsers.length > 0 && (
            <View style={styles.taggedUsersContainer}>
              <Text style={styles.sectionTitle}>Tagged Users:</Text>
              <FlatList
                data={taggedUsers}
                renderItem={renderTaggedUser}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.taggedUsersList}
              />
            </View>
          )}
          
          {/* Hashtags section */}
          {hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              <Text style={styles.sectionTitle}>Hashtags:</Text>
              <HashtagsInput hashtags={hashtags} />
            </View>
          )}
          
          {/* Upload progress indicator */}
          {isBackgroundUpload && (
            <View style={styles.uploadProgressContainer}>
              <Text style={styles.uploadProgressText}>
                Uploading: {Math.round(uploadProgress)}%
              </Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.uploadStatusText}>
                Your post is being uploaded in the background
              </Text>
            </View>
          )}
          
          {/* Extra space at bottom for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* Action buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSelectMedia}
            disabled={mediaFiles.length >= 5 || isSubmitting || isMediaLoading}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={
                mediaFiles.length >= 5 || isMediaLoading 
                  ? ColorPalette.grey_text 
                  : ColorPalette.white
              }
            />
            <Text style={[
              styles.actionText,
              (mediaFiles.length >= 5 || isMediaLoading) && styles.disabledText
            ]}>
              {isMediaLoading ? 'Loading...' : 'Media'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowUserSearchModal(true)}
            disabled={isSubmitting}
          >
            <Ionicons name="person-add-outline" size={24} color={ColorPalette.white} />
            <Text style={styles.actionText}>Tag People</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsPublic(!isPublic)}
            disabled={isSubmitting}
          >
            <Ionicons
              name={isPublic ? "globe-outline" : "lock-closed-outline"}
              size={24}
              color={ColorPalette.white}
            />
            <Text style={styles.actionText}>
              {isPublic ? "Public" : "Private"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* User search modal for tagging */}
        <UserSearchModal
          visible={showUserSearchModal}
          onClose={() => setShowUserSearchModal(false)}
          onSelectUser={handleAddUser}
          organizationId={currentWorkspace?.id}
        />
        
        {/* Loading overlay when submitting */}
        {isSubmitting && (        
          <LoadingOverlay message="Creating post..." />
        )}
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.border_color || '#2A2A2A',
  },
  headerTitle: {
    color: ColorPalette.white,
    fontSize: 18,
    fontFamily: 'CG-Medium',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  postButton: {
    backgroundColor: ColorPalette.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: ColorPalette.green + '80', // Adding opacity
  },
  disabledText: {
    opacity: 0.6,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  workspaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: ColorPalette.card_bg || '#1A1A1A',
    borderRadius: 8,
  },
  workspaceText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontFamily: 'CG-Regular',
    marginLeft: 8,
  },
  contentInput: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ColorPalette.border_color || '#2A2A2A',
    borderStyle: 'dashed',
  },
  mediaLoadingText: {
    marginLeft: 8,
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 14,
  },
  mediaPreviewContainer: {
    marginVertical: 16,
  },
  taggedUsersContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  taggedUsersList: {
    paddingVertical: 8,
  },
  hashtagsContainer: {
    marginTop: 16,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: ColorPalette.border_color || '#2A2A2A',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  uploadProgressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ColorPalette.border_color,
  },
  uploadProgressText: {
    color: ColorPalette.white,
    fontFamily: 'CG-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: ColorPalette.green,
  },
  uploadStatusText: {
    color: ColorPalette.grey_text,
    fontFamily: 'CG-Regular',
    fontSize: 12,
    marginTop: 8,
  },
});

export default CreatePostScreen;
