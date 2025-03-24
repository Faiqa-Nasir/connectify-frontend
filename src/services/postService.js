import api from './apiService';
import { BASE_URL, POST_ENDPOINTS } from '../constants/ApiConstants';
import NetInfo from '@react-native-community/netinfo';

/**
 * Fetch the user's post feed with pagination
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of posts per page
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated posts
 */
export const fetchPostFeed = async (page = 1, pageSize = 10, retryCount = 0) => {
  try {
    // Check internet connectivity first
    const netInfoState = await NetInfo.fetch();
    
    if (!netInfoState.isConnected) {
      throw new Error('No internet connection. Please check your network settings and try again.');
    }
    
    const response = await api.get(POST_ENDPOINTS.FEED, {
      params: {
        page,
        page_size: pageSize
      },
      timeout: 45000, // Increased from 15000 to 45000 (45 seconds)
    });
    
    return response.data;
  } catch (error) {
    // Handle different error scenarios
    console.error('Error fetching post feed:', error);
    
    // Check if it's a timeout or network error
    const isNetworkError = error.message === 'Network Error' || 
                          error.code === 'ECONNABORTED' || 
                          error.message.includes('timeout');
    
    // Retry logic for network errors (max 3 attempts)
    if (isNetworkError && retryCount < 3) {
      console.log(`Retrying fetch posts (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return fetchPostFeed(page, pageSize, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (isNetworkError) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to access this content.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    // Create a new error with the formatted message
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.isNetworkError = isNetworkError;
    throw enhancedError;
  }
};

/**
 * Validates media files in FormData to ensure they're ready for upload
 * @param {FormData} formData - The FormData object to validate
 * @returns {Object} - Validation result with status and message
 */
export const validateFormDataMedia = (formData) => {
  if (!formData) return { valid: false, message: 'No form data provided' };
  
  try {
    const formDataEntries = [...formData.entries()];
    const mediaEntries = formDataEntries.filter(entry => entry[0] === 'media');
    
    // No media to validate
    if (mediaEntries.length === 0) {
      return { valid: true, mediaCount: 0 };
    }
    
    // Check each media file
    const invalidMedia = mediaEntries.filter(entry => {
      const mediaFile = entry[1];
      
      // Check if it's a valid file object
      if (!(mediaFile instanceof Blob || mediaFile instanceof File)) {
        console.warn('Invalid media type:', typeof mediaFile);
        return true;
      }
      
      // Check if file size is zero or suspicious
      if (mediaFile.size <= 0) {
        console.warn('Media file has zero size');
        return true;
      }
      
      return false;
    });
    
    if (invalidMedia.length > 0) {
      return {
        valid: false,
        message: `${invalidMedia.length} media files are invalid or not ready for upload`,
        mediaCount: mediaEntries.length,
        invalidCount: invalidMedia.length
      };
    }
    
    return {
      valid: true,
      mediaCount: mediaEntries.length,
      message: `${mediaEntries.length} media files validated successfully`
    };
  } catch (error) {
    console.error('Error validating form data media:', error);
    return { valid: false, message: 'Error validating media' };
  }
};

/**
 * Create a new post with optional media, hashtags, and user tags
 * @param {FormData} formData - The post data including media files
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise} - Promise resolving to the created post
 */
export const createPost = async (formData, retryCount = 0, onProgress = null) => {
  try {
    // Check internet connectivity first
    const netInfoState = await NetInfo.fetch();
    
    if (!netInfoState.isConnected) {
      throw new Error('No internet connection. Please check your network settings and try again.');
    }
    
    console.log(`Creating new post (attempt ${retryCount + 1})...`);
    
    // Create a new FormData instance to properly handle file uploads
    const processedFormData = new FormData();
    
    // Extract and process each entry in the original formData
    const formDataEntries = [...formData.entries()];
    formDataEntries.forEach(([key, value]) => {
      if (key === 'media') {
        // For media files, we need to ensure they're properly formatted for upload
        console.log('Processing media value:', JSON.stringify(value));
        
        // React Native file objects need special handling
        if (value && typeof value === 'object') {
          let fileToUpload;
          
          // Handle React Native file object structure
          if (value._data || value.uri !== undefined) {
            // Extract file information from React Native file object
            const uri = value.uri || value._data?.uri || value.path || '';
            const name = value.name || value._data?.name || value.fileName || 'file.jpg';
            const type = value.type || value._data?.type || 'image/jpeg';
            
            // Validate that URI is not empty
            if (!uri) {
              console.warn('⚠️ Empty URI detected in media file:', name);
              // Skip this file since it has no valid URI
              return;
            }
            
            console.log(`Processing media file: ${name}, type: ${type}, uri: ${uri.substring(0, 30)}...`);
            
            // Create a proper file object from the extracted data
            fileToUpload = {
              uri: uri,
              name: name,
              type: type
            };
          } else {
            // Standard file object, check for required properties
            if (!value.uri && !value.path) {
              console.warn('⚠️ Media file missing URI or path:', value);
              return;
            }
            
            fileToUpload = value;
          }
          
          // Final validation before appending
          if (!fileToUpload.uri || fileToUpload.uri === '') {
            console.warn('⚠️ Invalid media file (empty URI) - skipping');
            return;
          }
          
          // Append the processed file to the new FormData
          console.log(`Appending media file: ${fileToUpload.name || 'unnamed'}`);
          processedFormData.append('media', fileToUpload);
        } else {
          console.warn('Invalid media value:', value);
        }
      } else {
        // For non-media fields, add them directly
        processedFormData.append(key, value);
      }
    });
    
    // Log the processed FormData for debugging
    console.log(`Processed FormData entries for upload:`);
    [...processedFormData.entries()].forEach(([key, value]) => {
      if (key === 'media') {
        console.log(`FormData media: ${value.name || 'unnamed'}, type: ${value.type || 'unknown'}, uri: ${value.uri ? 'present' : 'missing'}`);
      } else {
        console.log(`FormData entry: ${key} = ${value}`);
      }
    });
    
    // Check if media was expected but none was included after processing
    const originalHasMedia = formDataEntries.some(entry => entry[0] === 'media');
    const processedHasMedia = [...processedFormData.entries()].some(entry => entry[0] === 'media');
    
    if (originalHasMedia && !processedHasMedia) {
      console.warn('⚠️ Media was provided but all files were invalid');
      throw new Error('Unable to upload media. Please select a valid image or video file.');
    }
    
    // Calculate timeout based on if media is included
    const timeout = processedHasMedia ? 300000 : 60000; // 5 min for media, 1 min otherwise
    
    console.log('Sending request...');
    
    // Make the API request with the processed FormData
    const response = await api.post(POST_ENDPOINTS.CREATE, processedFormData, {
      headers: {
        'Accept': 'application/json',
        // Important: DO NOT set Content-Type header manually for multipart/form-data
      },
      timeout,
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
        
        if (onProgress && typeof onProgress === 'function') {
          onProgress(percentCompleted);
        }
      }
    });
    
    console.log('Post created successfully');
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Check if it's a timeout or network error
    const isNetworkError = error.message === 'Network Error' || 
                           error.code === 'ECONNABORTED' || 
                           error.message.includes('timeout') ||
                           error.message.includes('network');
    
    // Only retry for network errors, not validation errors
    if (isNetworkError && retryCount < 2) {
      console.log(`Retrying create post (attempt ${retryCount + 1})...`);
      
      // Delay before retry: 2s, 4s
      const delay = Math.pow(2, retryCount + 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request with incremented retry count
      return createPost(formData, retryCount + 1, onProgress);
    }
    
    // Format user-friendly error message
    let errorMessage = 'Failed to create post. Please try again.';
    if (isNetworkError) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response?.data) {
      errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : error.response.data.message || JSON.stringify(error.response.data);
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Delete a post
 * @param {string|number} postId - The ID of the post to delete
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving when post is deleted
 */
export const deletePost = async (postId, retryCount = 0) => {
  try {
    // Check internet connectivity first
    const netInfoState = await NetInfo.fetch();
    
    if (!netInfoState.isConnected) {
      throw new Error('No internet connection. Please check your network settings and try again.');
    }
    
    console.log(`Deleting post with ID: ${postId}`);
    const response = await api.delete(POST_ENDPOINTS.DELETE(postId), {
      timeout: 15000, // 15 seconds timeout
    });
    
    console.log('Post deleted successfully');
    return response;
  } catch (error) {
    console.error('Error deleting post:', error);
    
    // Check if it's a timeout or network error
    const isNetworkError = error.message === 'Network Error' || 
                          error.code === 'ECONNABORTED' || 
                          error.message.includes('timeout');
    
    // Only retry for network errors, not permission errors
    if (isNetworkError && retryCount < 2) {
      console.log(`Retrying delete post (attempt ${retryCount + 1})...`);
      
      // Delay before retry: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return deletePost(postId, retryCount + 1);
    }
    
    // Extract error message from the response if available
    let errorMessage;
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = 'You do not have permission to delete this post.';
      } else if (error.response.status === 404) {
        errorMessage = 'This post could not be found. It may have already been deleted.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = error.response.data?.error || 'Failed to delete post.';
      }
    } else if (isNetworkError) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Format the media URL to include the base URL if it's a relative path
 * @param {string} mediaPath - The path to the media file
 * @returns {string} - The full URL to the media file
 */
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  
  try {
    // Clean up any quotes that might be in the path
    const cleanPath = mediaPath.replace(/['"]/g, '');
    
    // If the path already starts with http, it's already a full URL
    if (cleanPath.startsWith('http')) {
      return cleanPath;
    }
    
    // Otherwise, prepend the base URL
    // Make sure the path starts with / for proper URL joining
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${BASE_URL}${normalizedPath}`;
  } catch (error) {
    console.error('Error formatting media URL:', error);
    return null;
  }
};

/**
 * Determine if a media item is a video based on its URL or media type
 * @param {Object} mediaItem - The media item object from the API
 * @returns {boolean} - Whether the media item is a video
 */
export const isVideoMedia = (mediaItem) => {
  if (!mediaItem) return false;
  
  // Check the media_type property first if available
  if (mediaItem.media_type && mediaItem.media_type.toLowerCase().includes('video')) {
    return true;
  }
  
  // Check the file extension
  const fileUrl = mediaItem.file || '';
  return fileUrl.includes('.mp4') || 
         fileUrl.includes('.mov') || 
         fileUrl.includes('.avi') || 
         fileUrl.includes('.webm') ||
         fileUrl.includes('.mkv');
};

/**
 * Calculate the time elapsed since the post was created
 * @param {string} dateString - ISO date string
 * @returns {string} - Human readable time (e.g., "2 hours ago")
 */
export const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
};
