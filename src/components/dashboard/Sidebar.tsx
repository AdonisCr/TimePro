import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  FolderOpen, 
  Clock, 
  Settings, 
  Inbox, 
  Wrench,
  Plus,
  User
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onAddTask: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onAddTask }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Activity, label: 'Tracking', id: 'tracking' },
    { icon: FolderOpen, label: 'Projects', id: 'projects' },
    { icon: Clock, label: 'Work History', id: 'work-history' },
    { icon: Wrench, label: 'Tools', id: 'tools' },
    { icon: Inbox, label: 'Inbox', id: 'inbox' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-dark">Sarah Johnson</h3>
            <p className="text-sm text-text-soft">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-soft hover:bg-gray-50 hover:text-text-dark'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Add New Task Button */}
      <div className="p-4">
        <button 
          onClick={onAddTask}
          className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Task</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;