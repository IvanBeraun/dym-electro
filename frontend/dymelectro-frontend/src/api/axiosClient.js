import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token vencido o invalido: forzar re-login limpiando la sesion.
      localStorage.removeItem('dym_token');
      localStorage.removeItem('dym_sesion');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const mensaje =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Ocurrio un error inesperado. Intenta nuevamente.';
    return Promise.reject({ ...error, mensaje });
  }
);

export default axiosClient;
