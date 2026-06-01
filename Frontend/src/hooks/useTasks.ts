import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

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
  project?: { id: number; name: string; color: string };
  subtasks?: Task[];
  created_at: string;
  updated_at: string;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  getSubtasks: (parentId: number) => Task[];
  toggleSubtaskComplete: (taskId: number, isCompleted: boolean) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (data: Partial<Task>): Promise<Task> => {
    const { subtasks, ...taskData } = data as Task & { subtasks?: { title: string }[] };
    
    const response = await api.post('/tasks', taskData);
    const parentTask = response.data;
    
    if (subtasks && subtasks.length > 0) {
      for (const subtask of subtasks) {
        const subtaskData = {
          ...taskData,
          title: subtask.title,
          parent_id: parentTask.id,
          status: 'todo',
        };
        await api.post('/tasks', subtaskData);
      }
    }
    
    await fetchTasks();
    return parentTask;
  };

  const updateTask = async (id: number, data: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    setTasks(prev => prev.map(t => t.id === id ? response.data : t));
    return response.data;
  };

  const deleteTask = async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getSubtasks = (parentId: number): Task[] => {
    return tasks.filter(t => t.parent_id === parentId);
  };

  const toggleSubtaskComplete = async (taskId: number, isCompleted: boolean): Promise<void> => {
    const response = await api.put(`/tasks/${taskId}`, { is_completed: isCompleted });
    setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, getSubtasks, toggleSubtaskComplete };
};

export type { Task };