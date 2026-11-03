import { useEffect } from 'react';
import usePushNotifications from '../../hooks/usePushNotifications';
import useOffline from '../../hooks/useOffline';
import { offlineStorage } from '../../lib/offlineStorage';

const NotificationsManager = () => {
  const { isSupported, permission, sendNotification } = usePushNotifications();
  const { isOnline, pendingActionsCount } = useOffline();

  useEffect(() => {
    // Request permission on mount if not already decided
    if (isSupported && permission === 'default') {
      // Don't auto-request, wait for user action
    }
  }, [isSupported, permission]);

  // Prévenir à la fin réelle de la synchronisation (pas au retour du réseau).
  useEffect(() => {
    return offlineStorage.subscribeToSync((result) => {
      if (permission !== 'granted') return;

      if (result.synced > 0) {
        sendNotification('Time Pro', {
          body: `${result.synced} action${result.synced > 1 ? 's' : ''} synchronisée${result.synced > 1 ? 's' : ''}`,
          tag: 'sync-complete',
        });
      }

      if (result.failed > 0) {
        sendNotification('Synchronisation incomplète', {
          body: `${result.failed} action${result.failed > 1 ? 's' : ''} refusée${result.failed > 1 ? 's' : ''}. Ouvre l'application pour le détail.`,
          tag: 'sync-failed',
        });
      }
    });
  }, [permission, sendNotification]);

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
