import { Plus, Users, Calendar, MoreHorizontal, Folder, Star } from 'lucide-react';

interface Task {
  id: string | number;
  name: string;
  // ajoute d’autres propriétés si nécessaire
}

interface ProjectsProps {
  tasks?: Task[]; // optionnel pour l'instant
}

// const Projects: React.FC<ProjectsProps> = ({ tasks }) => {
const Projects: React.FC<ProjectsProps> = () => {
  const projects = [
    {
      name: 'Dashboard Design',
      description: 'Modern admin dashboard with analytics',
      progress: 85,
      members: 4,
      deadline: '2024-03-20',
      status: 'active',
      color: 'bg-primary',
      priority: 'high'
    },
    {
      name: 'App UI/UX Design',
      description: 'Mobile application user interface',
      progress: 60,
      members: 3,
      deadline: '2024-03-25',
      status: 'active',
      color: 'bg-blue-500',
      priority: 'medium'
    },
    {
      name: 'Marketing Website',
      description: 'Company landing page redesign',
      progress: 45,
      members: 2,
      deadline: '2024-04-01',
      status: 'active',
      color: 'bg-green-500',
      priority: 'low'
    },
    {
      name: 'Mobile App Dev',
      description: 'React Native mobile application',
      progress: 30,
      members: 5,
      deadline: '2024-04-15',
      status: 'planning',
      color: 'bg-yellow-500',
      priority: 'high'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary bg-primary/10';
      case 'planning': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Projects</h1>
          <p className="text-text-soft mt-1">Manage and track your project progress</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Folder className="w-6 h-6 text-primary" />
            <span className="text-text-soft font-medium">Total Projects</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">12</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Star className="w-6 h-6 text-green-600" />
            <span className="text-text-soft font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">8</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-text-soft font-medium">Team Members</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">24</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-text-soft font-medium">Due This Week</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">3</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${project.color} rounded-full`}></div>
                <div>
                  <h3 className="font-semibold text-text-dark">{project.name}</h3>
                  <p className="text-sm text-text-soft">{project.description}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-text-soft" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-soft">Progress</span>
                <span className="font-medium text-text-dark">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${project.color} transition-all duration-500`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-text-soft" />
                  <span className="text-sm text-text-soft">{project.members}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-text-soft" />
                  <span className="text-sm text-text-soft">{project.deadline}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;