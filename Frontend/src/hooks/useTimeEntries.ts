import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

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
  const fetchEntries = useCallback(async (page = 1, perPage = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/time-entries?page=${page}&per_page=${perPage}`);
      if (response.data.data) {
        setEntries(response.data.data);
      } else {
        setEntries(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du suivi');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/time-entries/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Erreur stats:', err);
    }
  }, []);

  const createEntry = async (data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.post('/time-entries', data);
    setEntries(prev => [response.data, ...prev]);
    fetchStats();
    return response.data;
  };

  const updateEntry = async (id: number, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await api.put(`/time-entries/${id}`, data);
    setEntries(prev => prev.map(e => e.id === id ? response.data : e));
    fetchStats();
    return response.data;
  };

  const deleteEntry = async (id: number): Promise<void> => {
    await api.delete(`/time-entries/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
    fetchStats();
  };

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [fetchEntries, fetchStats]);

  return { entries, stats, loading, error, fetchEntries, fetchStats, createEntry, updateEntry, deleteEntry };
};

export type { TimeEntry, TimeStats, PaginationMeta };
