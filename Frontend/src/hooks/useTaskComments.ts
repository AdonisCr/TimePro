import { useState, useCallback } from 'react';
import api from '../lib/axios';

interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface UseTaskCommentsReturn {
  comments: TaskComment[];
  loading: boolean;
  fetchComments: (taskId: number) => Promise<void>;
  addComment: (taskId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

export const useTaskComments = (): UseTaskCommentsReturn => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async (taskId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Erreur comments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = async (taskId: number, content: string) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content });
      setComments(prev => [response.data, ...prev]);
    } catch (err) {
      console.error('Erreur add comment:', err);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Erreur delete comment:', err);
    }
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
  };
};