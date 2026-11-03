import axios from 'axios';
import { ACTIVE_TIMER_STORAGE_KEY } from './timer';
import { offlineStorage } from './offlineStorage';
import { clearAuthProfile } from './authProfile';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
            clearAuthProfile();
            offlineStorage.clearUserSession();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export { api };
export default api;