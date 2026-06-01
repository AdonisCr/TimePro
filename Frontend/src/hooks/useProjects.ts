import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  status: 'active' | 'completed' | 'archived';
  deadline: string | null;
  time_budget: number | null;
  time_budget_warning: number | null;
  spent_seconds: number;
  budget_usage_percent: number;
  budget_status: 'none' | 'ok' | 'warning' | 'exceeded';
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data ?? response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data);
    setProjects(prev => [response.data, ...prev]);
    return response.data;
  };

  const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    setProjects(prev => prev.map(p => p.id === id ? response.data : p));
    return response.data;
  };

  const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject };
};

export type { Project };
