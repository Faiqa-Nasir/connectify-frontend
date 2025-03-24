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
      likes: apiPost.reaction_count || apiPost.likes || 0,
      comments: apiPost.comment_count || apiPost.comments || 0,
      shares: apiPost.share_count || apiPost.shares || 0,
      timeAgo: apiPost.created_at ? getTimeAgo(apiPost.created_at) : (apiPost.timeAgo || 'recently'),
      hashtags: apiPost.hashtags ? apiPost.hashtags.map(tag => tag.name) : [],
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
    };
  }
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
