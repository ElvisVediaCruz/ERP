import axios from 'axios';
import { getAuth, clearAuth } from './authStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = getAuth()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(getAuth()?.token);
    if (error.response?.status === 401 && hadToken) {
      clearAuth();
      window.location.href = '/login';
    }

    const apiError = error.response?.data?.error;
    const normalized = {
      status: error.response?.status ?? null,
      code: apiError?.code ?? 'NETWORK_ERROR',
      message: apiError?.message ?? 'No se pudo conectar con el servidor',
      details: apiError?.details ?? null,
    };
    return Promise.reject(normalized);
  }
);

export default apiClient;
