import { useEffect, useState, useCallback } from 'react';
import { offlineStorage, type OfflineFailure } from '../lib/offlineStorage';

interface UseOfflineReturn {
  isOnline: boolean;
  pendingActionsCount: number;
  failedActionsCount: number;
  failures: OfflineFailure[];
  isSyncing: boolean;
  syncPendingActions: () => Promise<void>;
  clearFailures: () => void;
}

export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState(offlineStorage.getIsOnline());
  const [pendingActionsCount, setPendingActionsCount] = useState(offlineStorage.getPendingActionsCount());
  const [failedActionsCount, setFailedActionsCount] = useState(offlineStorage.getFailedActionsCount());
  const [failures, setFailures] = useState<OfflineFailure[]>(offlineStorage.getFailures());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineStorage.subscribe(() => {
      setIsOnline(offlineStorage.getIsOnline());
      setPendingActionsCount(offlineStorage.getPendingActionsCount());
      setFailedActionsCount(offlineStorage.getFailedActionsCount());
      setFailures(offlineStorage.getFailures());
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

  const clearFailures = useCallback(() => {
    offlineStorage.clearFailures();
  }, []);

  return {
    isOnline,
    pendingActionsCount,
    failedActionsCount,
    failures,
    isSyncing,
    syncPendingActions,
    clearFailures,
  };
};

export default useOffline;
