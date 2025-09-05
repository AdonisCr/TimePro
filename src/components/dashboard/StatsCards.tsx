import React from 'react';
import { CheckCircle, Clock, AlertCircle, Target } from 'lucide-react';

interface StatsCardsProps {
  tasks: any[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ tasks }) => {
  // Calculate real statistics from tasks
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks.toString(),
      icon: Target,
      color: 'from-primary to-primary-hover',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      title: 'In Progress',
      value: inProgressTasks.toString().padStart(2, '0'),
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pending',
      value: pendingTasks.toString().padStart(2, '0'),
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Completed',
      value: completedTasks.toString(),
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <div className={`w-2 h-8 bg-gradient-to-b ${stat.color} rounded-full`}></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-dark mb-1">{stat.value}</h3>
            <p className="text-text-soft font-medium">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;