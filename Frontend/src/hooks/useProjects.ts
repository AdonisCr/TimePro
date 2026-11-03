import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import { offlineStorage } from '../lib/offlineStorage';

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
  isOffline: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (navigator.onLine) {
        const response = await api.get('/projects');
        const projectsData = response.data.data ?? response.data;
        setProjects(projectsData);
        offlineStorage.setCache('projects', projectsData);
      } else {
        const cached = offlineStorage.getCache<Project[]>('projects');
        if (cached) {
          setProjects(cached);
        } else {
          setError('Pas de connexion et pas de données en cache');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des projets';
      setError(errorMessage);
      
      const cached = offlineStorage.getCache<Project[]>('projects');
      if (cached) {
        setProjects(cached);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (data: Partial<Project>): Promise<Project> => {
    if (navigator.onLine) {
      const response = await api.post('/projects', data);
      setProjects(prev => [response.data, ...prev]);
      return response.data;
    } else {
      // Offline : identifiant local négatif, jamais en collision avec MySQL.
      const localId = offlineStorage.nextLocalId();
      const newProject: Project = {
        ...data,
        id: localId,
        spent_seconds: 0,
        budget_usage_percent: 0,
        budget_status: 'none',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Project;
      
      setProjects(prev => [newProject, ...prev]);
      offlineStorage.setCache('projects', [newProject, ...projects]);
      
      offlineStorage.addPendingAction({
        type: 'create',
        endpoint: '/projects',
        localId,
        data,
      });
      
      return newProject;
    }
  };

  const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
    if (navigator.onLine && id > 0) {
      const response = await api.put(`/projects/${id}`, data);
      setProjects(prev => prev.map(p => p.id === id ? response.data : p));
      return response.data;
    } else {
      // Offline (ou projet local non encore synchronisé).
      const updated = projects.find(p => p.id === id);
      if (!updated) throw new Error('Project not found');
      
      const merged = { ...updated, ...data, updated_at: new Date().toISOString() };
      setProjects(prev => prev.map(p => p.id === id ? merged : p));
      offlineStorage.setCache('projects', projects.map(p => p.id === id ? merged : p));
      
      offlineStorage.addPendingAction({
        type: 'update',
        endpoint: '/projects',
        resourceId: id,
        data: { ...data },
      });
      
      return merged;
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    if (navigator.onLine && id > 0) {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
      offlineStorage.setCache('projects', projects.filter(p => p.id !== id));
      
      offlineStorage.addPendingAction({
        type: 'delete',
        endpoint: '/projects',
        resourceId: id,
      });
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchProjects();

    const unsubscribeSync = offlineStorage.subscribeToSync(() => {
      void fetchProjects();
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, [fetchProjects]);

  return { projects, loading, error, isOffline, fetchProjects, createProject, updateProject, deleteProject };
};

export type { Project };
