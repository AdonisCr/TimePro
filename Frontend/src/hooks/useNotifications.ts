import { useCallback, useEffect, useState } from 'react';
import api from '../lib/axios';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: number) => Promise<void>;
}

const POLL_INTERVAL_MS = 60_000;

const toList = (payload: unknown): AppNotification[] => {
  if (Array.isArray(payload)) return payload as AppNotification[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as AppNotification[];
  }
  return [];
};

/**
 * Charge les notifications réelles de l'utilisateur et les rafraîchit
 * régulièrement (toutes les 60 s quand l'onglet est visible).
 */
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [listResponse, countResponse] = await Promise.all([
        api.get('/notifications', { params: { per_page: 20 } }),
        api.get('/notifications/unread-count'),
      ]);

      setNotifications(toList(listResponse.data));
      setUnreadCount(Number(countResponse.data?.unread_count ?? 0));
    } catch {
      // Silencieux : une notification manquée ne doit pas gêner l'application.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  const markAsRead = useCallback(async (id: number) => {
    const target = notifications.find(notification => notification.id === id);

    setNotifications(prev => prev.map(notification => {
      if (notification.id !== id || notification.is_read) return notification;
      return { ...notification, is_read: true };
    }));

    if (target && !target.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      void refresh();
    }
  }, [notifications, refresh]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
    setUnreadCount(0);

    try {
      await api.patch('/notifications/read-all');
    } catch {
      void refresh();
    }
  }, [refresh]);

  const remove = useCallback(async (id: number) => {
    const target = notifications.find(notification => notification.id === id);

    setNotifications(prev => prev.filter(notification => notification.id !== id));

    if (target && !target.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      void refresh();
    }
  }, [notifications, refresh]);

  return { notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead, remove };
};
