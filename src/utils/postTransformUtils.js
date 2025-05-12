import { getMediaUrl, getTimeAgo, isVideoMedia } from '../services/postService';

/**
 * Transforms API post data to a format expected by the Post component
 * This ensures consistency across different screens
 * 
 * @param {Object} apiPost - The post data from API
 * @returns {Object} Transformed post object ready for the Post component
 */
export const transformPost = (apiPost) => {
  if (!apiPost) return null;
  
  try {
    // Handle media items and convert to expected format
    const mediaUrls = apiPost.media ? apiPost.media.map(media => {
      let url;
      if (typeof media === 'string') {
        url = media;
      } else if (media.file) {
        url = getMediaUrl(media.file);
      } else {
        return null;
      }
      
      const isVideo = typeof media === 'string' 
        ? isVideoMedia({file: media}) 
        : isVideoMedia(media);
      
      return {
        url,
        type: isVideo ? 'video' : 'image',
        thumbnail: url
      };
    })
    .filter(item => item !== null)
    .map(item => item.url) : [];
    
    // Create a consistent post object structure
    return {
      id: apiPost.id?.toString() || '',
      user: {
        id: apiPost.user?.id?.toString() || '',
        username: apiPost.user?.username || '',
        displayName: apiPost.user ? 
          `${apiPost.user.first_name || ''} ${apiPost.user.last_name || ''}`.trim() || apiPost.user.username 
          : '',
        profileImage: apiPost.user?.profile_image || apiPost.user?.profileImage || '',
      },
      caption: apiPost.content || apiPost.caption || '',
      media: mediaUrls,
      mediaDetails: apiPost.media || [],
      likes: apiPost.reactions_summary ? Object.values(apiPost.reactions_summary).reduce((a, b) => a + b, 0) : 0,
      comments: apiPost.comment_count || 0,
      shares: apiPost.share_count || 0,
      timeAgo: apiPost.created_at ? getTimeAgo(apiPost.created_at) : 'recently',
      hashtags: apiPost.hashtags ? apiPost.hashtags.map(tag => tag.name) : [],
      reactions_summary: apiPost.reactions_summary || {},
      reaction_count: apiPost.reactions_summary ? 
        Object.values(apiPost.reactions_summary).reduce((a, b) => a + b, 0) : 0,
      user_reaction: determineUserReaction(apiPost.reactions_summary)
    };
  } catch (error) {
    console.error('Error transforming post:', error);
    return {
      id: apiPost.id?.toString() || 'error',
      user: {
        username: 'Error',
        displayName: 'Error Loading Post',
      },
      caption: 'This post could not be displayed properly',
      media: [],
      likes: 0,
      comments: 0,
      shares: 0,
      timeAgo: 'recently',
      hashtags: [],
      reaction_count: 0,
      reactions_summary: {},
      user_reaction: null
    };
  }
};

// Update the helper function to better determine user's reaction
const determineUserReaction = (reactionsSummary) => {
  if (!reactionsSummary || typeof reactionsSummary !== 'object') return null;
  
  // Get the first reaction type that has a count
  const reactionType = Object.entries(reactionsSummary)[0]?.[0];
  if (!reactionType) return null;

  const reactionMap = {
    'LIKE': { id: 1, name: 'LIKE', emoji: '👍', type: 'LIKE' },
    'LOVE': { id: 2, name: 'LOVE', emoji: '❤️', type: 'LOVE' },
    'HAHA': { id: 3, name: 'HAHA', emoji: '😂', type: 'HAHA' },
    'WOW': { id: 4, name: 'WOW', emoji: '😮', type: 'WOW' },
    'SAD': { id: 5, name: 'SAD', emoji: '😢', type: 'SAD' },
    'ANGRY': { id: 6, name: 'ANGRY', emoji: '😠', type: 'ANGRY' }
  };

  return reactionMap[reactionType] || null;
};

/**
 * Helper function to validate and extract post properties safely
 * 
 * @param {Object} post - The post object
 * @param {string} property - The property to extract
 * @param {*} defaultValue - Default value if property is missing
 * @returns {*} The property value or default
 */
export const getPostProperty = (post, property, defaultValue = null) => {
  if (!post) return defaultValue;
  
  const properties = property.split('.');
  let value = post;
  
  for (const prop of properties) {
    if (value === null || value === undefined) return defaultValue;
    value = value[prop];
  }
  
  return value !== undefined ? value : defaultValue;
};
