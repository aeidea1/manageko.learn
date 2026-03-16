import axios from 'axios';

// Используем localhost, так как бэкенд запущен именно на нём
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Автоматически добавляем токен (если он есть) к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});