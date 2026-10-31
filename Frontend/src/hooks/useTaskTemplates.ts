import { useState, useCallback } from 'react';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: string;
  estimated_duration: number;
  category: string;
  subtasks?: string[];
}

const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: 'meeting',
    name: 'Réunion',
    description: 'Template pour une réunion standard',
    icon: '📅',
    priority: 'medium',
    estimated_duration: 60,
    category: 'Réunions',
    subtasks: ['Préparer l\'agenda', 'Envoyer le compte-rendu', 'Définir les actions'],
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Revue de code',
    icon: '🔍',
    priority: 'high',
    estimated_duration: 45,
    category: 'Développement',
    subtasks: ['Vérifier la logique', 'Tester les cas limites', 'Approuver ou demander des modifications'],
  },
  {
    id: 'email',
    name: 'Répondre aux emails',
    description: 'Traitement de la boîte mail',
    icon: '📧',
    priority: 'low',
    estimated_duration: 30,
    category: 'Communication',
  },
  {
    id: 'planning',
    name: 'Planification hebdomadaire',
    description: 'Planifier la semaine à venir',
    icon: '📋',
    priority: 'high',
    estimated_duration: 30,
    category: 'Productivité',
    subtasks: ['Revoir les objectifs', 'Planifier les tâches', 'Bloquer les créneaux'],
  },
  {
    id: 'bug-fix',
    name: 'Correction de bug',
    description: 'Résoudre un bug',
    icon: '🐛',
    priority: 'high',
    estimated_duration: 120,
    category: 'Développement',
    subtasks: ['Reproduire le bug', 'Identifier la cause', 'Corriger', 'Tester'],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Rédiger ou mettre à jour la doc',
    icon: '📝',
    priority: 'medium',
    estimated_duration: 60,
    category: 'Développement',
  },
];

export const useTaskTemplates = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const addTemplate = useCallback((template: Omit<TaskTemplate, 'id'>) => {
    const newTemplate: TaskTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const removeTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  const getCategories = useCallback(() => {
    const categories = new Set(templates.map(t => t.category));
    return Array.from(categories);
  }, [templates]);

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return {
    templates,
    filteredTemplates,
    selectedCategory,
    setSelectedCategory,
    addTemplate,
    removeTemplate,
    getTemplatesByCategory,
    getCategories,
  };
};
