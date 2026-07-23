import axios from 'axios';

const api = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !url.includes('/auth/me') && !url.includes('/auth/login')) {
      const loginPath = `${import.meta.env.BASE_URL || '/'}login`;
      window.location.href = loginPath;
    }

    return Promise.reject(error);
  },
);

export default api;
