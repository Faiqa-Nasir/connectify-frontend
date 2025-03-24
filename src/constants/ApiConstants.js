export const BASE_URL = 'http://192.168.1.8:8000'; // Replace with your actual API base URL

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
};

export const COMMENT_ENDPOINTS = {
  CREATE: (postId) => `/api/posts/${postId}/comments/create/`,
  GET_COMMENTS: (postId) => `/api/posts/${postId}/comments/`,
  GET_REPLIES: (commentId) => `/api/posts/comments/${commentId}/replies/`,
  UPDATE: (commentId) => `/api/posts/comments/${commentId}/update/`,
  DELETE: (commentId) => `/api/posts/comments/${commentId}/delete/`,
};

// We can remove this or keep it for future endpoints
export const USER_ENDPOINTS = {
  // User specific endpoints can be added here as needed
};