import { useEffect, useCallback } from 'react';
import { offlineStorage } from '../lib/offlineStorage';

interface UseOfflineReturn {
  isOnline: boolean;
  pendingActionsCount: number;
  isSyncing: boolean;
  syncPendingActions: () => Promise<void>;
}

export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState(offlineStorage.getIsOnline());
  const [pendingActionsCount, setPendingActionsCount] = useState(offlineStorage.getPendingActionsCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineStorage.subscribe(() => {
      setIsOnline(offlineStorage.getIsOnline());
      setPendingActionsCount(offlineStorage.getPendingActionsCount());
    });

    return unsubscribe;
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await offlineStorage.syncPendingActions();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActionsCount > 0) {
      void syncPendingActions();
    }
  }, [isOnline, pendingActionsCount, syncPendingActions]);

  return {
    isOnline,
    pendingActionsCount,
    isSyncing,
    syncPendingActions,
  };
};

export default useOffline;
