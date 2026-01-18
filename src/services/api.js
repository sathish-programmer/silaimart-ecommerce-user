import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const apiCall = async (url, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.data = body; // Axios uses 'data' for request body
  }

  try {
    const response = await api(config);
    return { // Mimic fetch API response structure
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data)),
    };
  } catch (error) {
    // Re-throw if it's not an HTTP error (e.g., network issue)
    if (!error.response) throw error;

    // Mimic fetch API error response structure
    return {
      ok: false,
      status: error.response.status,
      json: () => Promise.resolve(error.response.data),
      text: () => Promise.resolve(JSON.stringify(error.response.data)),
    };
  }
};



// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
};

export const categoriesAPI = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
};

export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
};

export const botAPI = {
  getStart: () => api.get('/bot/start'),
  getQuestion: (id) => api.get(`/bot/question/${id}`),
  getRecommendations: (filters) => api.post('/bot/recommendations', filters),
};

export const blogsAPI = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlog: (slug) => api.get(`/blogs/${slug}`),
};

export default api;