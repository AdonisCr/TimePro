import React from 'react';
import { TrendingUp, Users, BarChart3, PieChart } from 'lucide-react';

interface AnalyticsProps {
  tasks: any[];
}

const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  // Calculate project progress from real tasks
  const projectStats = tasks.reduce((acc: any, task) => {
    const projectName = task.project || 'other';
    if (!acc[projectName]) {
      acc[projectName] = { total: 0, completed: 0 };
    }
    acc[projectName].total++;
    if (task.status === 'completed') {
      acc[projectName].completed++;
    }
    return acc;
  }, {});

  const projectNames: { [key: string]: string } = {
    'dashboard-design': 'Dashboard Design',
    'app-ui-ux': 'App UI/UX Design',
    'marketing-website': 'Marketing Website',
    'mobile-app-dev': 'Mobile App Dev'
  };

  const projects = [
    { 
      name: 'Dashboard Design', 
      progress: projectStats['dashboard-design'] ? 
        Math.round((projectStats['dashboard-design'].completed / projectStats['dashboard-design'].total) * 100) : 0,
      color: 'bg-primary' 
    },
    { 
      name: 'App UI/UX Design', 
      progress: projectStats['app-ui-ux'] ? 
        Math.round((projectStats['app-ui-ux'].completed / projectStats['app-ui-ux'].total) * 100) : 0,
      color: 'bg-blue-500' 
    },
    { 
      name: 'Marketing Website', 
      progress: projectStats['marketing-website'] ? 
        Math.round((projectStats['marketing-website'].completed / projectStats['marketing-website'].total) * 100) : 0,
      color: 'bg-green-500' 
    },
    { 
      name: 'Mobile App Dev', 
      progress: projectStats['mobile-app-dev'] ? 
        Math.round((projectStats['mobile-app-dev'].completed / projectStats['mobile-app-dev'].total) * 100) : 0,
      color: 'bg-yellow-500' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Total Work Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-dark">Total Work</h3>
          </div>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        
        <div className="h-48 flex items-end space-x-2">
          {[45, 65, 38, 72, 56, 85, 42].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-500 hover:from-primary-hover hover:to-primary"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-xs text-text-soft mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-dark">Work Progress</h3>
          </div>
          
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-text-dark">{project.name}</span>
                  <span className="text-sm text-text-soft">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${project.color} transition-all duration-500`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Working Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-dark">Team Status</h3>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00B4DB"
                  strokeWidth="2"
                  strokeDasharray="70, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-text-dark">70%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-soft">Active Members</span>
              <span className="text-sm font-semibold text-text-dark">14/20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-soft">On Break</span>
              <span className="text-sm font-semibold text-text-dark">4/20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-soft">Offline</span>
              <span className="text-sm font-semibold text-text-dark">2/20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;