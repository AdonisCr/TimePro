import { useEffect } from 'react';
import usePushNotifications from '../../hooks/usePushNotifications';
import useOffline from '../../hooks/useOffline';

const NotificationsManager = () => {
  const { isSupported, permission, sendNotification } = usePushNotifications();
  const { isOnline, pendingActionsCount } = useOffline();

  useEffect(() => {
    // Request permission on mount if not already decided
    if (isSupported && permission === 'default') {
      // Don't auto-request, wait for user action
    }
  }, [isSupported, permission]);

  // Show offline notification when coming back online with pending actions
  useEffect(() => {
    if (isOnline && pendingActionsCount > 0 && permission === 'granted') {
      sendNotification('Time Pro', {
        body: `${pendingActionsCount} actions en attente synchronisées`,
        tag: 'sync-complete',
      });
    }
  }, [isOnline, pendingActionsCount, permission, sendNotification]);

  return (
    <div className="relative">
      {/* Status indicator */}
      {!isOnline && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
      )}
      
      {/* Pending sync indicator */}
      {isOnline && pendingActionsCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
};

export default NotificationsManager;
