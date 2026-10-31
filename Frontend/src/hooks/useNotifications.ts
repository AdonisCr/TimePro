import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'reminder' | 'insight' | 'achievement' | 'warning';
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UseNotificationsOptions {
  enableReminders?: boolean;
  enableInsights?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { enableReminders = true, enableInsights = true } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Generate contextual notifications
  const generateNotifications = useCallback(() => {
    if (!enableReminders && !enableInsights) return;

    const now = new Date();
    const hour = now.getHours();

    // Morning reminder
    if (hour >= 8 && hour < 9 && enableReminders) {
      const pendingTasks = tasks.filter(t => t.status !== 'done');
      if (pendingTasks.length > 0) {
        addNotification({
          type: 'reminder',
          title: 'Bonjour ! 👋',
          message: `Tu as ${pendingTasks.length} tâches en attente. Prêt à commencer ?`,
          icon: '🌅',
        });
      }
    }

    // Lunch reminder
    if (hour === 12 && enableReminders) {
      addNotification({
        type: 'reminder',
        title: 'Pause déjeuner 🍽️',
        message: 'N\'oublie pas de prendre une pause. Tu le mérites !',
        icon: '☕',
      });
    }

    // End of day summary
    if (hour === 17 && enableReminders) {
      const completedToday = tasks.filter(t => t.status === 'done').length;
      addNotification({
        type: 'insight',
        title: 'Bilan de la journée',
        message: `Tu as complété ${completedToday} tâches aujourd'hui. Bravo !`,
        icon: '📊',
      });
    }

    // Overdue tasks warning
    const overdueTasks = tasks.filter(t => 
      t.status !== 'done' && 
      t.due_date && 
      new Date(t.due_date) < new Date()
    );
    
    if (overdueTasks.length > 0 && enableInsights) {
      addNotification({
        type: 'warning',
        title: 'Tâches en retard ⚠️',
        message: `Tu as ${overdueTasks.length} tâche${overdueTasks.length > 1 ? 's' : ''} dépassée${overdueTasks.length > 1 ? 's' : ''} la date limite.`,
        icon: '⚠️',
      });
    }
  }, [addNotification, enableReminders, enableInsights]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    generateNotifications,
  };
};
