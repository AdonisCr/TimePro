import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks, projects, or team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-text-soft hover:text-text-dark transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="text-right">
            <p className="text-sm font-medium text-text-dark">{currentDate}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;