import { useState } from 'react';
import { Timer, Clock } from 'lucide-react';
import Tracking from './Tracking';
import WorkHistory from './WorkHistory';

interface TrackingPageProps {
  tasks: { id: number; title: string; project?: string; status: string; dueDate?: string; start_date?: string; estimated_duration?: number | null; projectColor?: string; description?: string; priority?: string }[];
}

const TrackingPage: React.FC<TrackingPageProps> = ({ tasks }) => {
  const [tab, setTab] = useState<'timer' | 'history'>('timer');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Suivi du temps</h1>
          <p className="text-text-soft mt-1">Timer et historique de vos entrées</p>
        </div>
      </div>

      <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden w-fit">
        <button
          onClick={() => setTab('timer')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
            tab === 'timer' ? 'bg-primary text-white shadow-sm' : 'text-text-soft hover:text-text-dark hover:bg-gray-50'
          }`}
        >
          <Timer className="w-4 h-4" />
          Timer
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-primary text-white shadow-sm' : 'text-text-soft hover:text-text-dark hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Historique
        </button>
      </div>

      {tab === 'timer' ? <Tracking tasks={tasks} /> : <WorkHistory />}
    </div>
  );
};

export default TrackingPage;
