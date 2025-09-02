import api from './apiService';
import { BASE_URL, BASE_URL_AI, POST_ENDPOINTS } from '../constants/ApiConstants';
import { getStoredTokens } from './tokenService';
import axios from 'axios';
import { Alert } from 'react-native'; 
import * as FileSystem from 'expo-file-system';

let showPostBlockedPopup = null;
export const setPostBlockedPopupHandler = (handler) => {
  showPostBlockedPopup = handler;
};

// Predict text safety
const predictText = async (text) => {
  try {
    const response = await axios.post(`${BASE_URL_AI}/predict`, { text });
    return response.data.is_safe;
  } catch (error) {
    console.error('Text prediction error:', error);
    return true; // Fail-safe: treat as safe to avoid blocking all
  }
};

// Predict image safety
const predictImage = async (base64Image) => {
  try {
    const response = await axios.post(`${BASE_URL_AI}/predict_image`, {
      image: base64Image,
    });
    return response.data.is_safe;
  } catch (error) {
    console.error('Image prediction error:', error);
    return true;
  }
};

const fileToBase64 = async (media) => {
  if (media.base64) {
    return media.base64.startsWith('data:') ? media.base64 : `data:image/jpeg;base64,${media.base64}`;
  }
  console.log('(NOBRIDGE) LOG Converting URI to base64:', media.uri);
  try {
    const base64 = await FileSystem.readAsStringAsync(media.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('(NOBRIDGE) ERROR Failed to convert URI to base64:', error);
    return null;
  }
};

/**
 * Fetch the user's post feed with pagination
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of posts per page
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated posts
 */
export const fetchPostFeed = async (page = 1, pageSize = 10, retryCount = 0) => {
  try {
    console.log(`Fetching post feed (page ${page}, size ${pageSize})...`);
    console.log('api.get(POST_ENDPOINTS.FEED)');
    console.log('page:', page);
    console.log('pageSize:', pageSize);
    console.log('retryCount:', retryCount);
    
    const response = await api.get(POST_ENDPOINTS.FEED, {
      params: {
        page,
        page_size: pageSize,
      },
      timeout: 45000, // Increased from 15000 to 45000 (45 seconds)
    });

    return response.data;
  } catch (error) {
    // Handle different error scenarios
    console.error('Error fetching post feed:', error);

    // Check if it's a timeout or network error
    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    // Retry logic for network errors (max 3 attempts)
    if (isNetworkError && retryCount < 3) {
      console.log(`Retrying fetch posts (attempt ${retryCount + 1})...`);

      // Exponential backoff delay: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

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
        errorMessage = "You don't have permission to access this content.";
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
    const mediaEntries = formDataEntries.filter((entry) => entry[0] === 'media');

    // No media to validate
    if (mediaEntries.length === 0) {
      return { valid: true, mediaCount: 0 };
    }

    // Check each media file
    const invalidMedia = mediaEntries.filter((entry) => {
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
        invalidCount: invalidMedia.length,
      };
    }

    return {
      valid: true,
      mediaCount: mediaEntries.length,
      message: `${mediaEntries.length} media files validated successfully`,
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
export const createPost = async (formData, mediaFiles = [], retryCount = 0, onProgress = null, isAnnouncement = false) => {
  try {
    const text = formData.get('content') || '';
    console.log('(NOBRIDGE) LOG Content being validated:', text);
    const isTextSafe = await predictText(text);
    console.log('(NOBRIDGE) LOG predictText result:', isTextSafe);
    if (!isTextSafe) {
      console.log('(NOBRIDGE) LOG Text flagged as inappropriate');
      if (showPostBlockedPopup) {
        showPostBlockedPopup('Inappropriate or harmful text detected. Please modify your post.');
      } else {
        Alert.alert('Post Blocked', 'Inappropriate or harmful text detected.');
      }
      return null;
    }

    for (const media of mediaFiles) {
      console.log('(NOBRIDGE) LOG Checking media file:', JSON.stringify(media, null, 2));
      if (media.type === 'video/mp4') {
        console.log('(NOBRIDGE) LOG Skipping moderation for video:', media);
        continue; // Skip videos
      }
      if (!media.base64) {
        console.log('(NOBRIDGE) WARN Image missing base64, attempting to generate:', media);
        const base64Image = await fileToBase64(media);
        if (!base64Image) {
          console.log('(NOBRIDGE) WARN Failed to generate base64, skipping:', media);
          continue;
        }
        media.base64 = base64Image;
      }
      console.log('(NOBRIDGE) LOG Predicting image');
      const base64Image = media.base64.startsWith('data:') ? media.base64 : `data:image/jpeg;base64,${media.base64}`;
      const isImageSafe = await predictImage(base64Image);
      if (!isImageSafe) {
        console.log('(NOBRIDGE) LOG Image not safe');
        if (showPostBlockedPopup) {
          showPostBlockedPopup('Inappropriate image(s) detected. Please remove or replace them.');
        } else {
          Alert.alert('Post Blocked', 'Inappropriate image(s) detected.');
        }
        return null;
      }
    }

    const response = await fetch(`${BASE_URL}${POST_ENDPOINTS.CREATE}`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${await getStoredTokens().then((tokens) => tokens.access)}`,
      },
    });

    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  } catch (error) {
    console.error('(NOBRIDGE) ERROR Post creation failed:', error);
    if (retryCount < 2) {
      console.log(`(NOBRIDGE) LOG Retrying create post (attempt ${retryCount + 1})...`);
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount + 1) * 1000));
      return createPost(formData, mediaFiles, retryCount + 1, onProgress, isAnnouncement);
    }
    throw error;
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
    console.log(`Deleting post with ID: ${postId}`);
    const response = await api.delete(POST_ENDPOINTS.DELETE(postId), {
      timeout: 15000, // 15 seconds timeout
    });

    console.log('Post deleted successfully');
    return response;
  } catch (error) {
    console.error('Error deleting post:', error);

    // Check if it's a timeout or network error
    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    // Only retry for network errors, not permission errors
    if (isNetworkError && retryCount < 2) {
      console.log(`Retrying delete post (attempt ${retryCount + 1})...`);

      // Delay before retry: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

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
  return (
    fileUrl.includes('.mp4') ||
    fileUrl.includes('.mov') ||
    fileUrl.includes('.avi') ||
    fileUrl.includes('.webm') ||
    fileUrl.includes('.mkv')
  );
};

/**
 * Calculate the time elapsed since the post was created
 * @param {string} dateString - ISO date string
 * @returns {string} - Human readable time (e.g., "2 hs ago")
 */
export const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 y ago' : `${interval} ys ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 m ago' : `${interval} ms ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 h ago' : `${interval} hs ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 min ago' : `${interval} mins ago`;
  }

  return seconds < 10 ? 'just now' : `${Math.floor(seconds)} s ago`;
};

/**
 * Fetch trending hashtags and their associated posts
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the trending data
 */
export const fetchTrends = async (retryCount = 0) => {
  try {
    const response = await api.get(POST_ENDPOINTS.TRENDS, {
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching trends:', error);

    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    if (isNetworkError && retryCount < 2) {
      console.log(`Retrying fetch trends (attempt ${retryCount + 1})...`);
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchTrends(retryCount + 1);
    }

    let errorMessage = 'Failed to fetch trends.';
    if (error.response?.status === 401) {
      errorMessage = 'Please login to view trends.';
    } else if (isNetworkError) {
      errorMessage = 'Network connection issue. Please check your internet connection.';
    }

    throw new Error(errorMessage);
  }
};

/**
 * Fetch posts for a specific trend/hashtag
 * @param {string} hashtag - The hashtag to fetch posts for
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of posts per page
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated trend posts
 */
export const fetchTrendPosts = async (hashtag, page = 1, pageSize = 10, retryCount = 0) => {
  try {
    const response = await api.get(POST_ENDPOINTS.TREND_POSTS(hashtag), {
      params: {
        page,
        page_size: pageSize,
      },
      timeout: 15000,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching trend posts:', error);

    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    if (isNetworkError && retryCount < 2) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchTrendPosts(hashtag, page, pageSize, retryCount + 1);
    }

    if (error.response?.status === 404) {
      throw new Error('This trend could not be found.');
    }

    throw new Error(
      isNetworkError
        ? 'Network connection issue. Please check your internet connection.'
        : error.response?.data?.error || 'Failed to load trend posts.'
    );
  }
};

/**
 * Fetch announcements with pagination
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of announcements per page
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated announcements
 */
export const fetchAnnouncements = async (page = 1, pageSize = 10, retryCount = 0) => {
  try {
    const response = await api.get(POST_ENDPOINTS.ANNOUNCEMENTS, {
      params: {
        page,
        page_size: pageSize,
      },
      timeout: 45000,
    });

    return response.data;
  } catch (error) {
    // Use same error handling as fetchPostFeed
    console.error('Error fetching announcements:', error);

    // Check if it's a timeout or network error
    const isNetworkError =
      error.message === 'Network Error' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    // Retry logic for network errors (max 3 attempts)
    if (isNetworkError && retryCount < 3) {
      console.log(`Retrying fetch announcements (attempt ${retryCount + 1})...`);

      // Exponential backoff delay: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return fetchAnnouncements(page, pageSize, retryCount + 1);
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
        errorMessage = "You don't have permission to access this content.";
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
 * Update the comment count for a post
 * @param {string|number} postId - The ID of the post to update
 * @param {number} increment - The amount to increment/decrement (1 or -1)
 */
export const updatePostCommentCount = async (postId, increment) => {
  try {
    // First update local cache if it exists
    const cacheKey = `post_${postId}`;
    const cachedPostJson = await AsyncStorage.getItem(cacheKey);
    if (cachedPostJson) {
      const cachedPost = JSON.parse(cachedPostJson);
      cachedPost.comments_count = (cachedPost.comments_count || 0) + increment;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedPost));
    }

    // Make API call to update comment count
    await api.post(`${POST_ENDPOINTS.DETAILS(postId)}/update_comment_count/`, {
      increment: increment
    });
  } catch (error) {
    console.warn('Error updating post comment count:', error);
  }
};
