import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL: apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`,
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@NormaBrasil:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@NormaBrasil:token');
      localStorage.removeItem('@NormaBrasil:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
