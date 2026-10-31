import { useState } from 'react';
import { useTaskTemplates, type TaskTemplate } from '../../hooks/useTaskTemplates';
import { Plus, Trash2, Clock, Tag } from 'lucide-react';

interface TaskTemplatesProps {
  onSelectTemplate: (template: TaskTemplate) => void;
}

const TaskTemplates = ({ onSelectTemplate }: TaskTemplatesProps) => {
  const { filteredTemplates, selectedCategory, setSelectedCategory, addTemplate, removeTemplate, getCategories } = useTaskTemplates();
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    icon: '📋',
    priority: 'medium',
    estimated_duration: 30,
    category: 'Général',
  });

  const categories = getCategories();

  const handleAdd = () => {
    if (newTemplate.name.trim()) {
      addTemplate(newTemplate);
      setNewTemplate({ name: '', description: '', icon: '📋', priority: 'medium', estimated_duration: 30, category: 'Général' });
      setIsAdding(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text-dark">Templates de tâches</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            !selectedCategory ? 'bg-primary text-white' : 'bg-gray-100 text-text-soft hover:bg-gray-200'
          }`}
        >
          Tout
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-100 text-text-soft hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-medium text-text-dark mb-3">Nouveau template</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Icone"
                value={newTemplate.icon}
                onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="text"
                placeholder="Nom du template"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <input
              type="text"
              placeholder="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-3">
              <select
                value={newTemplate.priority}
                onChange={(e) => setNewTemplate({ ...newTemplate, priority: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="low">Basse priorité</option>
                <option value="medium">Moyenne priorité</option>
                <option value="high">Haute priorité</option>
              </select>
              <input
                type="number"
                placeholder="Durée (min)"
                value={newTemplate.estimated_duration}
                onChange={(e) => setNewTemplate({ ...newTemplate, estimated_duration: parseInt(e.target.value) || 0 })}
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <input
              type="text"
              placeholder="Catégorie"
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={!newTemplate.name.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              Créer
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-200 text-text-dark rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Templates grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer group"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h4 className="font-medium text-text-dark">{template.name}</h4>
                  <p className="text-xs text-text-soft">{template.description}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTemplate(template.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(template.priority)}`}>
                {template.priority === 'high' ? 'Haute' : template.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
              <span className="flex items-center gap-1 text-xs text-text-soft">
                <Clock className="w-3 h-3" />
                {template.estimated_duration}min
              </span>
              <span className="flex items-center gap-1 text-xs text-text-soft">
                <Tag className="w-3 h-3" />
                {template.category}
              </span>
            </div>

            {template.subtasks && template.subtasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-text-soft mb-1">Sous-tâches :</p>
                <ul className="text-xs text-text-soft space-y-0.5">
                  {template.subtasks.slice(0, 3).map((subtask, index) => (
                    <li key={index}>• {subtask}</li>
                  ))}
                  {template.subtasks.length > 3 && (
                    <li className="text-primary">+{template.subtasks.length - 3} autres</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskTemplates;
