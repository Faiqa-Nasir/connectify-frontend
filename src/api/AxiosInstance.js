// import axios from 'axios';
// import { getAccessToken, getRefreshToken } from './tokenApis/TokenApis';
// import { BASE_URL } from '@env';  // Import BASE_URL from .env

// // Create axios instance with baseURL and timeout settings
// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   timeout: 20000,
// });

// // Axios interceptor to add token to the headers
// axiosInstance.interceptors.request.use(
//   async config => {
//     const token = await getAccessToken();
//     if (token) {
//       config.headers['token'] = token;  // Add token to the headers
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   },
// );

// // Test print the BASE_URL
// console.log('The base URL is:', BASE_URL);

// // Export axiosInstance for API requests
// export default axiosInstance;
