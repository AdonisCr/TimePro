import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { offlineStorage } from '../lib/offlineStorage';
import { ACTIVE_TIMER_STORAGE_KEY } from '../lib/timer';
import { clearAuthProfile, isNetworkFailure, readAuthProfile, saveAuthProfile } from '../lib/authProfile';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  profile_photo_path: string | null;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await api.get('/user');
      offlineStorage.setUserScope(response.data.id);
      saveAuthProfile(response.data);
      setUser(response.data);
    } catch (error) {
      // Réseau coupé : on garde la session et le profil mémorisé.
      if (isNetworkFailure(error)) {
        const profile = readAuthProfile();
        if (profile) {
          offlineStorage.setUserScope(profile.id);
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            profile_photo_url: profile.profile_photo_url ?? null,
            profile_photo_path: null,
          });
          setLoading(false);
          return;
        }
      }

      localStorage.removeItem('token');
      localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
      clearAuthProfile();
      offlineStorage.clearUserSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (navigator.onLine) {
      try {
        await offlineStorage.syncPendingActions();
      } catch {
        // Les actions restent stockées sous la clé de cet utilisateur.
      }
    }

    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
      clearAuthProfile();
      offlineStorage.clearUserSession();
      setUser(null);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, logout, refreshUser: fetchUser };
};

export type { User };
