import { useState, useCallback } from 'react';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_TAGS: Tag[] = [
  { id: 'urgent', name: 'Urgent', color: '#EF4444' },
  { id: 'important', name: 'Important', color: '#F59E0B' },
  { id: 'waiting', name: 'En attente', color: '#6B7280' },
  { id: 'blocked', name: 'Bloqué', color: '#DC2626' },
  { id: 'quick', name: 'Rapide', color: '#10B981' },
  { id: 'review', name: 'À review', color: '#8B5CF6' },
];

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tag,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTags(prev => [...prev, newTag]);
  }, []);

  const removeTag = useCallback((id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    setSelectedTags(prev => prev.filter(t => t !== id));
  }, []);

  const toggleTag = useCallback((id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelectedTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const getTagById = useCallback((id: string) => {
    return tags.find(t => t.id === id);
  }, [tags]);

  return {
    tags,
    selectedTags,
    addTag,
    removeTag,
    toggleTag,
    clearSelectedTags,
    getTagById,
  };
};
