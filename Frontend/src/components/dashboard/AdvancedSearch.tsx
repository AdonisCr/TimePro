import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  project?: {
    name: string;
  };
}

interface SearchFilters {
  query: string;
  priority: string[];
  status: string[];
  project: string[];
  dateFrom: string;
  dateTo: string;
}

interface AdvancedSearchProps {
  tasks: Task[];
  onFilterChange: (filteredTasks: Task[]) => void;
}

const AdvancedSearch = ({ tasks, onFilterChange }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    priority: [],
    status: [],
    project: [],
    dateFrom: '',
    dateTo: '',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Project filter
      if (filters.project.length > 0 && task.project && !filters.project.includes(task.project.name)) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && task.due_date && new Date(task.due_date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && task.due_date && new Date(task.due_date) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Update parent when filters change
  useMemo(() => {
    onFilterChange(filteredTasks);
  }, [filteredTasks, onFilterChange]);

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: newValue };
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      priority: [],
      status: [],
      project: [],
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.query || 
    filters.priority.length > 0 || 
    filters.status.length > 0 || 
    filters.project.length > 0 || 
    filters.dateFrom || 
    filters.dateTo;

  const uniqueProjects = [...new Set(tasks.map(t => t.project?.name).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
            isExpanded ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-soft hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
          {/* Priority */}
          <div>
            <label className="text-sm font-medium text-text-dark mb-2 block">Priorité</label>
            <div className="flex flex-wrap gap-2">
              {['high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleFilter('priority', priority)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filters.priority.includes(priority)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-soft hover:bg-gray-200'
                  }`}
                >
                  {priority === 'high' ? 'Haute' : priority === 'medium' ? 'Moyenne' : 'Basse'}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-text-dark mb-2 block">Statut</label>
            <div className="flex flex-wrap gap-2">
              {['todo', 'in_progress', 'done'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleFilter('status', status)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-soft hover:bg-gray-200'
                  }`}
                >
                  {status === 'todo' ? 'À faire' : status === 'in_progress' ? 'En cours' : 'Terminé'}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          {uniqueProjects.length > 0 && (
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Projet</label>
              <div className="flex flex-wrap gap-2">
                {uniqueProjects.map(project => (
                  <button
                    key={project}
                    onClick={() => toggleFilter('project', project!)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filters.project.includes(project!)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-soft hover:bg-gray-200'
                    }`}
                  >
                    {project}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date range */}
          <div>
            <label className="text-sm font-medium text-text-dark mb-2 block">Date d'échéance</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-text-soft">à</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-sm text-text-soft">
          {filteredTasks.length} résultat{filteredTasks.length > 1 ? 's' : ''} trouvé{filteredTasks.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default AdvancedSearch;
