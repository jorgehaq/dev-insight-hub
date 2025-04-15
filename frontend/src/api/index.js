import axios from 'axios';

// Crear instancia base de axios con la configuración común
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirigir al login si hay un error de autenticación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Organizar endpoints por recursos
const endpoints = {
  auth: {
    login: (credentials) => api.post('/login', credentials),
    me: () => api.get('/auth/me'),
  },
  
  users: {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users', userData),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
  },
  
  repositories: {
    getAll: (params) => api.get('/repositories', { params }),
    getById: (id) => api.get(`/repositories/${id}`),
    create: (repoData) => api.post('/repositories', repoData),
    update: (id, repoData) => api.put(`/repositories/${id}`, repoData),
    delete: (id) => api.delete(`/repositories/${id}`),
    analyze: (id) => api.post(`/repositories/${id}/analyze`),
  },
  
  analyses: {
    getAll: (params) => api.get('/analyses', { params }),
    getById: (id) => api.get(`/analyses/${id}`),
    getByRepository: (repoId) => api.get('/analyses', { params: { repository_id: repoId } }),
    create: (analysisData) => api.post('/analyses', analysisData),
  },
  
  webhooks: {
    github: (payload) => api.post('/webhooks/github', payload),
  }
};

export { api, endpoints };