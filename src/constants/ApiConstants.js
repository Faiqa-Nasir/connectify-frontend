// export const BASE_URL = 'http://192.168.1.11:8000';
export const BASE_IP = '192.168.137.21';
export const BASE_URL = `http://${BASE_IP}:8000`;
export const BASE_URL_WS = `ws://${BASE_IP}:8001/ws/conversations/`;


export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login/',
  REFRESH_TOKEN: '/api/auth/token/refresh/',
};

export const ORGANIZATION_ENDPOINTS = {
  GET_ALL: '/api/organizations/',
  GET_DETAILS: (id) => `/api/organizations/${id}/`, // Used for fetching organization users
};

export const POST_ENDPOINTS = {
  FEED: '/api/posts/feed/',
  CREATE: '/api/posts/create/',
  DETAILS: (postId) => `/api/posts/${postId}/`,
  LIKE: (postId) => `/api/posts/${postId}/like/`,
  COMMENT: (postId) => `/api/posts/${postId}/comments/`,
  USER_POSTS: '/api/posts/user/',
  USER_POSTS_BY_ID: (userId) => `/api/posts/user/${userId}/`,
  DELETE: (postId) => `/api/posts/${postId}/delete/`,
  TRENDS: '/api/posts/trends/',
  TREND_POSTS: (hashtag) => `/api/posts/trend/${hashtag}/`,
  ANNOUNCEMENTS: '/api/posts/announcements/',
};

export const COMMENT_ENDPOINTS = {
  CREATE: (postId) => `/api/posts/${postId}/comments/create/`,
  GET_COMMENTS: (postId) => `/api/posts/${postId}/comments/`,
  GET_REPLIES: (commentId) => `/api/posts/comments/${commentId}/replies/`,
  UPDATE: (commentId) => `/api/posts/comments/${commentId}/update/`,
  DELETE: (commentId) => `/api/posts/comments/${commentId}/delete/`,
};

export const REACTION_ENDPOINTS = {
  GET_TYPES: '/api/posts/reaction-types/',
  REACT: (postId) => `/api/posts/${postId}/react/`,
  UNREACT: (postId) => `/api/posts/${postId}/unreact/`,
};

// User specific endpoints
export const USER_ENDPOINTS = {
  UPDATE_PROFILE: '/api/auth/profile/update/',
  PROFILE: '/api/auth/profile/',  // Add this endpoint for getting user profile
  // User specific endpoints can be added here as needed
};

// Messaging endpoints
export const MESSAGING_ENDPOINTS = {
  // Conversations (One-to-One)
  CONVERSATIONS: '/api/messaging/conversations/',
  CONVERSTATIONS_CREATE: '/api/messaging/conversations/create/',

  CONVERSATION_DETAIL: (id) => `/api/messaging/conversations/${id}/`,
  CONVERSATION_MESSAGES: (id) => `/api/messaging/conversations/${id}/messages/`,
  SEND_MESSAGE: (id) => `/api/messaging/conversations/${id}/send_message/`,
  DELETE_CONVERSATION: (id) => `/api/messaging/conversations/${id}/`,

  // Messages
  MESSAGE_DETAIL: (id) => `/api/messaging/messages/${id}/`,
  EDIT_MESSAGE: (id) => `/api/messaging/messages/${id}/edit/`,
  DELETE_MESSAGE: (id) => `/api/messaging/messages/${id}/`,
  REACT_TO_MESSAGE: (id) => `/api/messaging/messages/${id}/react/`,
  REMOVE_REACTION: (id) => `/api/messaging/messages/${id}/unreact/`,

  // User Blocking
  BLOCKS: '/api/messaging/blocks/',
  BLOCK_USER: '/api/messaging/blocks/',
  UNBLOCK_USER: (id) => `/api/messaging/blocks/${id}/`,
};