import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { offlineStorage } from '../lib/offlineStorage';

interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  parent_id: number | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  start_date: string | null;
  estimated_duration: number | null;
  due_date: string | null;
  is_completed: boolean;
  order: number;
  depends_on: number | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_end_date: string | null;
  recurrence_count: number | null;
  project?: { id: number; name: string; color: string };
  subtasks?: Task[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: { title: string }[] }) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  getSubtasks: (parentId: number) => Task[];
  toggleSubtaskComplete: (taskId: number, isCompleted: boolean) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        const response = await api.get('/tasks');
        const tasksData = response.data;
        setTasks(tasksData);
        offlineStorage.setCache('tasks', tasksData);
      } else {
        const cached = offlineStorage.getCache<Task[]>('tasks');
        if (cached) {
          setTasks(cached);
        } else {
          setError('Pas de connexion et pas de données en cache');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      setError(errorMessage);
      
      // Fallback to cache on error
      const cached = offlineStorage.getCache<Task[]>('tasks');
      if (cached) {
        setTasks(cached);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (data: Omit<Partial<Task>, 'subtasks'> & { subtasks?: { title: string }[] }): Promise<Task> => {
    const { subtasks, ...taskData } = data as Task & { subtasks?: { title: string }[] };
    
    if (navigator.onLine) {
      const response = await api.post('/tasks', {
        ...taskData,
        ...(subtasks && subtasks.length > 0 ? { subtasks } : {}),
      });
      const parentTask = response.data;

      await fetchTasks();
      return parentTask;
    } else {
      // Offline: create locally with a temporary negative id.
      const localId = offlineStorage.nextLocalId();
      const newTask: Task = {
        ...taskData,
        id: localId,
        parent_id: taskData.parent_id || null,
        is_completed: taskData.is_completed || false,
        order: taskData.order || 0,
        subtasks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: taskData.is_completed ? new Date().toISOString() : null,
      } as Task;
      
      setTasks(prev => [newTask, ...prev]);
      offlineStorage.setCache('tasks', [newTask, ...tasks]);
      
      offlineStorage.addPendingAction({
        type: 'create',
        endpoint: '/tasks',
        localId,
        data: { ...taskData, ...(subtasks && subtasks.length > 0 ? { subtasks } : {}) },
      });
      
      return newTask;
    }
  };

  const updateTask = async (id: number, data: Partial<Task>): Promise<Task> => {
    // Un id négatif n'existe pas encore côté serveur : on ne peut pas le modifier
    // par un appel direct, même si le navigateur se croit en ligne.
    if (navigator.onLine && id > 0) {
      const response = await api.put(`/tasks/${id}`, data);
      setTasks(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } else {
      // Offline (ou élément local) : mise à jour locale puis file d'attente.
      const updatedTask = tasks.find(t => t.id === id);
      if (!updatedTask) throw new Error('Task not found');
      
      const merged = { ...updatedTask, ...data, updated_at: new Date().toISOString() };
      const nowDone = merged.status === 'done' || merged.is_completed === true;
      merged.completed_at = nowDone ? (updatedTask.completed_at ?? new Date().toISOString()) : null;
      setTasks(prev => prev.map(t => t.id === id ? merged : t));
      offlineStorage.setCache('tasks', tasks.map(t => t.id === id ? merged : t));
      
      offlineStorage.addPendingAction({
        type: 'update',
        endpoint: '/tasks',
        resourceId: id,
        data: { ...data },
      });
      
      return merged;
    }
  };

  const deleteTask = async (id: number): Promise<void> => {
    if (navigator.onLine && id > 0) {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      // Offline (ou élément local) : suppression locale puis file d'attente.
      setTasks(prev => prev.filter(t => t.id !== id));
      offlineStorage.setCache('tasks', tasks.filter(t => t.id !== id));
      
      offlineStorage.addPendingAction({
        type: 'delete',
        endpoint: '/tasks',
        resourceId: id,
      });
    }
  };

  const getSubtasks = (parentId: number): Task[] => {
    return tasks.filter(t => t.parent_id === parentId);
  };

  const toggleSubtaskComplete = async (taskId: number, isCompleted: boolean): Promise<void> => {
    await updateTask(taskId, { is_completed: isCompleted });
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchTasks();
    
    // Après une synchronisation, les identifiants locaux sont remplacés par
    // ceux du serveur : on recharge la liste pour rester cohérent.
    const unsubscribeSync = offlineStorage.subscribeToSync(() => {
      void fetchTasks();
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, [fetchTasks]);

  return { tasks, loading, error, isOffline, fetchTasks, createTask, updateTask, deleteTask, getSubtasks, toggleSubtaskComplete };
};

export type { Task };