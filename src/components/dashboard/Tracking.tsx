import { useState } from 'react';
import { Play, Pause, Square, Clock, Calendar, BarChart3, Timer } from 'lucide-react';

interface Task {
  id: string | number;
  name: string;
  // ajoute d’autres propriétés si nécessaire
}

interface TrackingProps {
  tasks?: Task[]; // optionnel pour l'instant
}

// const Tracking: React.FC<TrackingProps> = ({ tasks }) => {
const Tracking: React.FC<TrackingProps> = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, ] = useState('00:00:00');

  const recentSessions = [
    { project: 'Dashboard Design', duration: '2h 45m', date: 'Today', status: 'completed' },
    { project: 'App UI/UX Design', duration: '1h 30m', date: 'Today', status: 'completed' },
    { project: 'Marketing Website', duration: '3h 15m', date: 'Yesterday', status: 'completed' },
    { project: 'Mobile App Dev', duration: '4h 20m', date: 'Yesterday', status: 'completed' }
  ];

  const todayStats = [
    { label: 'Total Time', value: '6h 45m', icon: Clock, color: 'text-primary' },
    { label: 'Sessions', value: '4', icon: Timer, color: 'text-green-600' },
    { label: 'Projects', value: '3', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Avg Session', value: '1h 41m', icon: Calendar, color: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-2">Time Tracker</h2>
          <p className="text-text-soft mb-8">Track your work sessions efficiently</p>
          
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-text-dark mb-4">
              {currentTime}
            </div>
            <p className="text-text-soft">Current Session</p>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {isTracking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isTracking ? 'Pause' : 'Start'}</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-text-dark transition-all">
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </div>

          <select className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Select Project</option>
            <option>Dashboard Design</option>
            <option>App UI/UX Design</option>
            <option>Marketing Website</option>
            <option>Mobile App Dev</option>
          </select>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-text-soft font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-text-dark">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-text-dark mb-6">Recent Sessions</h3>
        <div className="space-y-4">
          {recentSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-bg-light rounded-xl transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <div>
                  <h4 className="font-medium text-text-dark">{session.project}</h4>
                  <p className="text-sm text-text-soft">{session.date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-text-dark">{session.duration}</div>
                <div className="text-sm text-green-600 capitalize">{session.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tracking;