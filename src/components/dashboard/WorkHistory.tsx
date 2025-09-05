import React, { useState } from 'react';
import { Calendar, Clock, Filter, Download, Search } from 'lucide-react';

interface Task {
  id: string | number;
  name: string;
  // ajoute d’autres propriétés si nécessaire
}

interface WorkHistoryProps {
  tasks?: Task[]; // optionnel pour l'instant
}


// const WorkHistory: React.FC<WorkHistoryProps> = ({ tasks }) => {
const WorkHistory: React.FC<WorkHistoryProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const workSessions = [
    {
      date: '2024-03-13',
      project: 'Dashboard Design',
      task: 'User interface mockups',
      startTime: '09:00',
      endTime: '12:30',
      duration: '3h 30m',
      status: 'completed'
    },
    {
      date: '2024-03-13',
      project: 'App UI/UX Design',
      task: 'Mobile wireframes',
      startTime: '14:00',
      endTime: '17:15',
      duration: '3h 15m',
      status: 'completed'
    },
    {
      date: '2024-03-12',
      project: 'Marketing Website',
      task: 'Landing page design',
      startTime: '10:00',
      endTime: '13:00',
      duration: '3h 00m',
      status: 'completed'
    },
    {
      date: '2024-03-12',
      project: 'Mobile App Dev',
      task: 'Component development',
      startTime: '15:30',
      endTime: '18:45',
      duration: '3h 15m',
      status: 'completed'
    },
    {
      date: '2024-03-11',
      project: 'Dashboard Design',
      task: 'Data visualization',
      startTime: '09:30',
      endTime: '11:45',
      duration: '2h 15m',
      status: 'completed'
    }
  ];

  const weeklyStats = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 7.2 },
    { day: 'Wed', hours: 5.8 },
    { day: 'Thu', hours: 8.1 },
    { day: 'Fri', hours: 6.9 },
    { day: 'Sat', hours: 3.2 },
    { day: 'Sun', hours: 1.5 }
  ];

  const totalHours = weeklyStats.reduce((sum, day) => sum + day.hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Work History</h1>
          <p className="text-text-soft mt-1">Track and analyze your work patterns</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-text-dark px-4 py-2 rounded-xl font-medium transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-dark">Time Overview</h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md font-medium transition-colors capitalize ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'text-text-soft hover:text-text-dark'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mb-6">
          <div className="flex items-end space-x-2 h-32">
            {weeklyStats.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-500 hover:from-primary-hover hover:to-primary"
                  style={{ height: `${(day.hours / 8) * 100}%` }}
                ></div>
                <span className="text-xs text-text-soft mt-2">{day.day}</span>
                <span className="text-xs font-medium text-text-dark">{day.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-dark">{totalHours.toFixed(1)}h</div>
            <div className="text-text-soft">Total This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-dark">{(totalHours / 7).toFixed(1)}h</div>
            <div className="text-text-soft">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-dark">5</div>
            <div className="text-text-soft">Active Days</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
            <input
              type="text"
              placeholder="Search work sessions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Projects</option>
            <option>Dashboard Design</option>
            <option>App UI/UX Design</option>
            <option>Marketing Website</option>
          </select>
        </div>

        {/* Work Sessions List */}
        <div className="space-y-4">
          {workSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-bg-light rounded-xl transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <Calendar className="w-5 h-5 text-primary mb-1" />
                  <span className="text-xs text-text-soft">{session.date}</span>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <h4 className="font-medium text-text-dark">{session.project}</h4>
                  <p className="text-sm text-text-soft">{session.task}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-text-soft">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{session.startTime} - {session.endTime}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-dark">{session.duration}</div>
                  <div className="text-sm text-green-600 capitalize">{session.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkHistory;