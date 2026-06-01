import { Plus, Users, Calendar, MoreHorizontal, Folder, Star, Clock, AlertTriangle } from 'lucide-react';

interface ProjectData {
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
}

interface Task {
  id: string | number;
  name: string;
}

interface ProjectsProps {
  tasks?: Task[];
  projects?: ProjectData[];
  onAddProject?: () => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}min`;
  return mins > 0 ? `${h}h ${mins}min` : `${h}h`;
};

const getBudgetColor = (pct: number, status: string) => {
  if (status === 'exceeded') return 'bg-red-500';
  if (status === 'warning') return 'bg-amber-500';
  return 'bg-primary';
};

const Projects: React.FC<ProjectsProps> = ({ tasks = [], projects = [], onAddProject }) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'archived': return 'Archivé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Projets</h1>
          <p className="text-text-soft mt-1">Gérez et suivez vos projets</p>
        </div>
        <button 
          onClick={onAddProject}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Créer un projet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Folder className="w-6 h-6 text-primary" />
            <span className="text-text-soft font-medium">Total Projets</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">{totalProjects}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Star className="w-6 h-6 text-green-600" />
            <span className="text-text-soft font-medium">Actifs</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">{activeProjects}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-text-soft font-medium">Tâches</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">{tasks.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-text-soft font-medium">Terminées</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">
            {tasks.filter(t => t.status === 'completed').length}
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Aucun projet</h3>
          <p className="text-text-soft mb-6">Créez votre premier projet pour commencer</p>
          <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Créer un projet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }}></div>
                  <div>
                    <h3 className="font-semibold text-text-dark">{project.name}</h3>
                    <p className="text-sm text-text-soft">{project.description || 'Aucune description'}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-text-soft" />
                </button>
              </div>

              {project.time_budget !== null && project.time_budget > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-text-soft mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(project.spent_seconds)} / {formatDuration(project.time_budget)}
                    </span>
                    <span className={`font-medium ${
                      project.budget_status === 'exceeded' ? 'text-red-600' :
                      project.budget_status === 'warning' ? 'text-amber-600' : 'text-text-soft'
                    }`}>
                      {project.budget_usage_percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getBudgetColor(project.budget_usage_percent, project.budget_status)}`}
                      style={{ width: `${Math.min(project.budget_usage_percent, 100)}%` }}
                    />
                  </div>
                  {project.budget_status === 'exceeded' && (
                    <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Budget dépassé
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-text-soft" />
                    <span className="text-sm text-text-soft">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : 'Pas de deadline'}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;