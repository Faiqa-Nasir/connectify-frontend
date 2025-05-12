import api from './apiService';
import { REACTION_ENDPOINTS } from '../constants/ApiConstants';

// Default reaction types as fallback
const DEFAULT_REACTIONS = [
  { id: 1, name: 'LIKE', emoji: '👍' },
  { id: 2, name: 'LOVE', emoji: '❤️' },
  { id: 3, name: 'HAHA', emoji: '😂' },
  { id: 4, name: 'WOW', emoji: '😮' },
  { id: 5, name: 'SAD', emoji: '😢' },
  { id: 6, name: 'ANGRY', emoji: '😠' }
];

// Cache reaction types to avoid redundant requests
let cachedReactionTypes = null;
let lastFetchTime = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Validates and formats reaction data
 * @param {Array} reactions - Raw reaction data from API
 * @returns {Array} - Formatted reaction data
 */
const formatReactions = (reactions) => {
  if (!Array.isArray(reactions)) return DEFAULT_REACTIONS;

  return reactions.map(reaction => ({
    id: reaction.id,
    name: reaction.name?.toUpperCase() || 'LIKE',
    emoji: reaction.emoji || '👍'
  }));
};

/**
 * Fetch all available reaction types
 * Uses caching to avoid redundant requests
 */
export const getReactionTypes = async () => {
  try {
    // Return cached data if it's still valid
    if (cachedReactionTypes && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      return cachedReactionTypes;
    }

    const response = await api.get(REACTION_ENDPOINTS.GET_TYPES);
    const formattedReactions = formatReactions(response.data);
    
    // Cache the formatted response
    cachedReactionTypes = formattedReactions;
    lastFetchTime = Date.now();
    
    return formattedReactions;
  } catch (error) {
    console.error('Error fetching reaction types:', error);
    // Return default reactions if API fails
    return DEFAULT_REACTIONS;
  }
};

/**
 * React to a post
 * @param {string|number} postId - ID of the post
 * @param {number} reactionTypeId - ID of the reaction type
 * @returns {Promise<Object>} - { id, name, emoji } of the reaction
 */
export const reactToPost = async (postId, reactionTypeId) => {
  const reactionMap = {
    1: { name: 'LIKE', emoji: '👍' },
    2: { name: 'LOVE', emoji: '❤️' },
    3: { name: 'HAHA', emoji: '😂' },
    4: { name: 'WOW', emoji: '😮' },
    5: { name: 'SAD', emoji: '😢' },
    6: { name: 'ANGRY', emoji: '😠' }
  };

  // Get the reaction details for optimistic update
  const reactionType = reactionMap[reactionTypeId];
  
  // Return optimistic response immediately
  const optimisticResponse = {
    reaction_type: reactionType.name,
    emoji: reactionType.emoji,
    isOptimistic: true
  };

  try {
    // Make the actual API call in the background
    const response = await api.post(REACTION_ENDPOINTS.REACT(postId), {
      reaction_type_id: reactionTypeId
    });

    return {
      ...response.data,
      reaction_type: reactionType.name,
      emoji: reactionType.emoji
    };
  } catch (error) {
    // Mark the error for optimistic update rollback
    error.isOptimisticError = true;
    error.optimisticData = optimisticResponse;
    throw error;
  }
};

/**
 * Remove reaction from a post
 * @param {string|number} postId - ID of the post
 */
export const removeReaction = async (postId) => {
  try {
    const response = await api.delete(REACTION_ENDPOINTS.UNREACT(postId));
    return response.data;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove reaction');
  }
};
