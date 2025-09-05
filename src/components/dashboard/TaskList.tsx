import React from 'react';
import { Clock, User, Flag, Calendar, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface TaskListProps {
  tasks: any[];
  title?: string;
  showAll?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, title = "Recent Tasks", showAll = false }) => {
  const displayTasks = showAll ? tasks : tasks.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Play className="w-4 h-4 text-primary" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-primary bg-primary/10';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-text-dark mb-6">{title}</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-medium text-text-dark mb-2">No tasks yet</h4>
          <p className="text-text-soft text-sm">
            Create your first task to get started with TimePro!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-dark">{title}</h3>
        <span className="text-sm text-text-soft">{tasks.length} tasks</span>
      </div>
      
      <div className="space-y-4">
        {displayTasks.map((task, index) => (
          <div key={task.id || index} className="flex items-center justify-between p-4 hover:bg-bg-light rounded-xl transition-colors border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-text-dark">{task.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-text-soft mb-2 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-text-soft">
                  {task.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                  {task.dueTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.dueTime}</span>
                    </div>
                  )}
                  {task.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignee.replace('-', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {!showAll && tasks.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-primary hover:text-primary-hover font-medium text-sm">
            View all {tasks.length} tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;