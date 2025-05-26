import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Posts API
export const postsAPI = {
  getAllPosts: (params = {}) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null && postData[key] !== undefined) {
        formData.append(key, postData[key]);
      }
    });
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  addReply: (postId, replyData) => api.post(`/posts/${postId}/replies`, replyData),
  getReplies: (postId) => api.get(`/posts/${postId}/replies`),
  addReaction: (postId, reactionData) => api.post(`/posts/${postId}/reactions`, reactionData),
  removeReaction: (postId) => api.delete(`/posts/${postId}/reactions`),
};

// Users API
export const usersAPI = {
  getUserProfile: (username) => api.get(`/users/${username}`),
  updateUserProfile: (username, userData) => api.put(`/users/${username}`, userData),
  getUserPosts: (username, params = {}) => api.get(`/users/${username}/posts`, { params }),
};

export default api; 