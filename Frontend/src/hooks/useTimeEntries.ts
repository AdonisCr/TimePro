import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { offlineStorage } from '../lib/offlineStorage';

interface TimeEntry {
  id: number;
  task_id: number | null;
  project_id: number | null;
  description: string | null;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  is_manual: boolean;
  task?: { id: number; title: string };
  project?: { id: number; name: string; color: string };
}

interface TimeStats {
  today: { total_seconds: number; entries_count: number };
  week: { total_seconds: number; entries_count: number };
  month: { total_seconds: number; entries_count: number };
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface UseTimeEntriesReturn {
  entries: TimeEntry[];
  stats: TimeStats | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  pagination: PaginationMeta | null;
  fetchEntries: (page?: number, perPage?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createEntry: (data: Partial<TimeEntry>) => Promise<TimeEntry>;
  updateEntry: (id: number, data: Partial<TimeEntry>) => Promise<TimeEntry>;
  deleteEntry: (id: number) => Promise<void>;
}

export const useTimeEntries = (): UseTimeEntriesReturn => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [stats, setStats] = useState<TimeStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchEntries = useCallback(async (page = 1, perPage = 50) => {
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        const response = await api.get(`/time-entries?page=${page}&per_page=${perPage}`);
        const entriesData = response.data.data ?? response.data;
        setEntries(entriesData);
        if (response.data.meta) {
          setPagination(response.data.meta);
        }
        offlineStorage.setCache('timeEntries', entriesData);
      } else {
        const cached = offlineStorage.getCache<TimeEntry[]>('timeEntries');
        if (cached) {
          setEntries(cached);
        } else {
          setError('Pas de connexion et pas de données en cache');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du suivi';
      setError(errorMessage);
      
      const cached = offlineStorage.getCache<TimeEntry[]>('timeEntries');
      if (cached) {
        setEntries(cached);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      if (navigator.onLine) {
        const response = await api.get('/time-entries/stats');
        setStats(response.data);
        offlineStorage.setCache('timeStats', response.data);
      } else {
        const cached = offlineStorage.getCache<TimeStats>('timeStats');
        if (cached) {
          setStats(cached);
        }
      }
    } catch (err: unknown) {
      console.error('Erreur stats:', err);
      const cached = offlineStorage.getCache<TimeStats>('timeStats');
      if (cached) {
        setStats(cached);
      }
    }
  }, []);

  const createEntry = async (data: Partial<TimeEntry>): Promise<TimeEntry> => {
    if (navigator.onLine) {
      const response = await api.post('/time-entries', data);
      setEntries(prev => [response.data, ...prev]);
      fetchStats();
      return response.data;
    } else {
      // Offline : identifiant local négatif + file d'attente idempotente.
      const localId = offlineStorage.nextLocalId();
      const newEntry: TimeEntry = {
        ...data,
        id: localId,
        duration: data.duration ?? null,
        is_manual: data.is_manual || false,
      } as TimeEntry;
      
      setEntries(prev => [newEntry, ...prev]);
      offlineStorage.setCache('timeEntries', [newEntry, ...entries]);
      
      offlineStorage.addPendingAction({
        type: 'create',
        endpoint: '/time-entries',
        localId,
        data,
      });
      
      return newEntry;
    }
  };

  const updateEntry = async (id: number, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    if (navigator.onLine && id > 0) {
      const response = await api.put(`/time-entries/${id}`, data);
      setEntries(prev => prev.map(e => e.id === id ? response.data : e));
      fetchStats();
      return response.data;
    } else {
      // Offline (ou entrée locale non encore synchronisée).
      const updated = entries.find(e => e.id === id);
      if (!updated) throw new Error('Entry not found');
      
      const merged = { ...updated, ...data };
      setEntries(prev => prev.map(e => e.id === id ? merged : e));
      offlineStorage.setCache('timeEntries', entries.map(e => e.id === id ? merged : e));
      
      offlineStorage.addPendingAction({
        type: 'update',
        endpoint: '/time-entries',
        resourceId: id,
        data: { ...data },
      });
      
      return merged;
    }
  };

  const deleteEntry = async (id: number): Promise<void> => {
    if (navigator.onLine && id > 0) {
      await api.delete(`/time-entries/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      fetchStats();
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
      offlineStorage.setCache('timeEntries', entries.filter(e => e.id !== id));
      
      offlineStorage.addPendingAction({
        type: 'delete',
        endpoint: '/time-entries',
        resourceId: id,
      });
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchEntries();
    fetchStats();

    // Les identifiants locaux sont remplacés après synchronisation : on
    // recharge les entrées et les statistiques pour éviter les fantômes.
    const unsubscribeSync = offlineStorage.subscribeToSync(() => {
      void fetchEntries();
      void fetchStats();
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, [fetchEntries, fetchStats]);

  return { entries, stats, loading, error, isOffline, pagination, fetchEntries, fetchStats, createEntry, updateEntry, deleteEntry };
};

export type { TimeEntry, TimeStats, PaginationMeta };
