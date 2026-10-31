import React from 'react';
import { Target, FolderOpen, Timer, TrendingUp, Play } from 'lucide-react';

interface TaskItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  project?: string;
}

interface ProjectItem {
  id: number;
  name: string;
  status?: string;
  color?: string;
}

interface TimeEntryItem {
  id: number;
  start_time: string;
  duration?: number;
  task_id?: number;
}

interface StatsCardsProps {
  tasks: TaskItem[];
  projects?: ProjectItem[];
  timeEntries?: TimeEntryItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ tasks = [], projects = [], timeEntries = [] }) => {
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const pendingTasks = tasks.filter(task => task.status === 'todo').length;
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: ProjectItem) => p.status === 'active').length;
  
  const todayHours = timeEntries.filter((entry: TimeEntryItem) => {
    const entryDate = new Date(entry.start_time);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }).reduce((acc: number, entry: TimeEntryItem) => acc + (entry.duration || 0), 0) / 3600;

  const weekHours = timeEntries.reduce((acc: number, entry: TimeEntryItem) => acc + (entry.duration || 0), 0) / 3600;

  const stats = [
    {
      title: 'Tâches',
      value: totalTasks,
      subtitle: `${completedTasks} terminées`,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: '+12%',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'En Cours',
      value: inProgressTasks,
      subtitle: `${pendingTasks} en attente`,
      icon: Play,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      trend: '+5%',
      iconBg: 'bg-amber-500'
    },
    {
      title: 'Projets',
      value: activeProjects,
      subtitle: `${totalProjects} total`,
      icon: FolderOpen,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      trend: '+2%',
      iconBg: 'bg-violet-500'
    },
    {
      title: 'Heures',
      value: todayHours.toFixed(1),
      subtitle: `${weekHours.toFixed(1)}h sem.`,
      icon: Timer,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+1.2h',
      iconBg: 'bg-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
<div 
        key={index} 
        className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-50 hover:shadow-2xl hover:border-gray-100 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden min-w-[280px]"
      >
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
          
          <div className="flex items-start justify-between relative">
            <div className={`p-4 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">{stat.trend}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-5xl font-extrabold text-text-dark leading-none tracking-tight">
              {stat.value}
              <span className="text-xl font-semibold text-text-soft ml-1">{(stat.title === 'Heures' ? 'h' : '')}</span>
            </h3>
            <p className="text-lg font-bold text-text-dark mt-2">{stat.title}</p>
            <p className="text-sm text-text-soft mt-1">{stat.subtitle}</p>
          </div>
          
          <div className={`mt-6 h-3 rounded-full bg-gradient-to-r ${stat.color} shadow-sm`}></div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;