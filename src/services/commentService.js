import api from './apiService';
import { COMMENT_ENDPOINTS } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Create a comment on a post or reply to another comment
 * @param {string|number} postId - The ID of the post to comment on
 * @param {string} content - The content of the comment
 * @param {string|number|null} parentCommentId - The ID of the parent comment if this is a reply, null otherwise
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the created comment
 */
export const createComment = async (postId, content, parentCommentId = null, retryCount = 0) => {
  try {
    const payload = {
      content,
      parent_comment_id: parentCommentId
    };
    
    console.log(`Creating comment on post ${postId}${parentCommentId ? ` as reply to comment ${parentCommentId}` : ''}`);
    
    const response = await api.post(COMMENT_ENDPOINTS.CREATE(postId), payload, {
      timeout: 15000, // 15 seconds timeout
    });
    
    console.log('Comment created successfully');
    
    // Cache the comment locally for immediate display
    try {
      // Get existing cached comments for this post
      const cacheKey = `comments_${postId}`;
      const cachedCommentsJson = await AsyncStorage.getItem(cacheKey);
      const cachedComments = cachedCommentsJson ? JSON.parse(cachedCommentsJson) : [];
      
      // Add the new comment to the cached comments
      cachedComments.unshift(response.data);
      
      // Store back in cache with a limit of 50 comments
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedComments.slice(0, 50)));
    } catch (cacheError) {
      console.warn('Failed to cache comment:', cacheError);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    
    // Retry logic for network errors (max 2 attempts)
    if (error.message === 'Network Error' && retryCount < 2) {
      console.log(`Retrying create comment (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return createComment(postId, content, parentCommentId, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (error.message === 'Network Error') {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to comment on this post.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.data?.message || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Fetch comments for a post with pagination
 * @param {string|number} postId - The ID of the post to fetch comments for
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of comments per page
 * @param {boolean} useCache - Whether to try using cache first
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated comments
 */
export const fetchComments = async (postId, page = 1, pageSize = 10, useCache = true, retryCount = 0) => {
  try {
    // Try to get cached comments for first page if useCache is true
    if (useCache && page === 1) {
      try {
        const cacheKey = `comments_${postId}`;
        const cachedCommentsJson = await AsyncStorage.getItem(cacheKey);
        
        if (cachedCommentsJson) {
          const cachedComments = JSON.parse(cachedCommentsJson);
          console.log(`Using ${cachedComments.length} cached comments for post ${postId}`);
          
          // Return cached comments in the same format as the API
          return {
            data: {
              count: cachedComments.length,
              next: cachedComments.length > pageSize ? `/api/posts/${postId}/comments/?page=2` : null,
              previous: null,
              results: cachedComments.slice(0, pageSize)
            }
          };
        }
      } catch (cacheError) {
        console.warn('Error reading cached comments:', cacheError);
      }
    }
    
    console.log(`Fetching comments for post ${postId}, page ${page}`);
    
    const response = await api.get(COMMENT_ENDPOINTS.GET_COMMENTS(postId), {
      params: {
        page,
        page_size: pageSize
      },
      timeout: 15000, // 15 seconds timeout
    });
    
    // Cache the first page of comments
    if (page === 1) {
      try {
        const cacheKey = `comments_${postId}`;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data.results || []));
        console.log(`Cached ${response.data.results?.length || 0} comments for post ${postId}`);
      } catch (cacheError) {
        console.warn('Error caching comments:', cacheError);
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    // Retry logic for network errors (max 2 attempts)
    if (error.message === 'Network Error' && retryCount < 2) {
      console.log(`Retrying fetch comments (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request, but don't use cache on retry
      return fetchComments(postId, page, pageSize, false, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (error.message === 'Network Error') {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to view these comments.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.data?.message || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Fetch replies to a specific comment with pagination
 * @param {string|number} commentId - The ID of the comment to fetch replies for
 * @param {number} page - Page number to fetch
 * @param {number} pageSize - Number of replies per page
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the paginated replies
 */
export const fetchReplies = async (commentId, page = 1, pageSize = 10, retryCount = 0) => {
  try {
    console.log(`Fetching replies for comment ${commentId}, page ${page}`);
    
    const response = await api.get(COMMENT_ENDPOINTS.GET_REPLIES(commentId), {
      params: {
        page,
        page_size: pageSize
      },
      timeout: 15000, // 15 seconds timeout
    });
    
    return response;
  } catch (error) {
    console.error('Error fetching replies:', error);
    
    // Retry logic for network errors (max 2 attempts)
    if (error.message === 'Network Error' && retryCount < 2) {
      console.log(`Retrying fetch replies (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return fetchReplies(commentId, page, pageSize, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (error.message === 'Network Error') {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to view these replies.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.data?.message || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update a comment
 * @param {string|number} commentId - The ID of the comment to update
 * @param {string} content - The updated content of the comment
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving to the updated comment
 */
export const updateComment = async (commentId, content, retryCount = 0) => {
  try {
    console.log(`Updating comment ${commentId} with content: ${content}`);
    
    // Add explicit JSON content type header
    const response = await api.put(COMMENT_ENDPOINTS.UPDATE(commentId), {
      content
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000, // 15 seconds timeout
    });
    
    console.log('Comment updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Retry logic for network errors (max 2 attempts)
    if (error.message === 'Network Error' && retryCount < 2) {
      console.log(`Retrying update comment (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return updateComment(commentId, content, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (error.message === 'Network Error') {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to update this comment.';
      } else if (error.response.status === 404) {
        errorMessage = 'This comment could not be found. It may have been deleted.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.data?.message || JSON.stringify(error.response.data) || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Delete a comment
 * @param {string|number} commentId - The ID of the comment to delete
 * @param {number} retryCount - Number of retry attempts (internal use)
 * @returns {Promise} - Promise resolving when comment is deleted
 */
export const deleteComment = async (commentId, retryCount = 0) => {
  try {
    console.log(`Deleting comment ${commentId}`);
    
    // Add explicit Accept header
    const response = await api.delete(COMMENT_ENDPOINTS.DELETE(commentId), {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 15000, // 15 seconds timeout
    });
    
    console.log('Comment deleted successfully with status:', response.status);
    
    // Store deleted comment ID in AsyncStorage to handle offline synchronization
    try {
      const deletedCommentsJson = await AsyncStorage.getItem('deletedComments');
      const deletedComments = deletedCommentsJson ? JSON.parse(deletedCommentsJson) : [];
      
      deletedComments.push({
        id: commentId,
        deletedAt: new Date().toISOString()
      });
      
      // Keep only the last 100 deleted comments
      const trimmedDeletedComments = deletedComments.slice(-100);
      
      await AsyncStorage.setItem('deletedComments', JSON.stringify(trimmedDeletedComments));
    } catch (storageError) {
      console.error('Error updating deleted comments in storage:', storageError);
    }
    
    return response;
  } catch (error) {
    console.error('Error deleting comment:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    
    // Retry logic for network errors (max 2 attempts)
    if (error.message === 'Network Error' && retryCount < 2) {
      console.log(`Retrying delete comment (attempt ${retryCount + 1})...`);
      
      // Exponential backoff delay: 1s, 2s
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return deleteComment(commentId, retryCount + 1);
    }
    
    // Format error message for the UI
    let errorMessage;
    if (error.message === 'Network Error') {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You don\'t have permission to delete this comment.';
      } else if (error.response.status === 404) {
        errorMessage = 'This comment could not be found. It may have already been deleted.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified. Please try again later.';
      } else {
        errorMessage = `Error: ${error.response.data?.message || JSON.stringify(error.response.data) || 'Unknown error'}`;
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
};
