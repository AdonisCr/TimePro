import { useEffect, useState } from 'react';
import { Square } from 'lucide-react';

interface ClockTimerProps {
  onStop: () => void;
  stopping: boolean;
}

const ClockTimer = ({ onStop, stopping }: ClockTimerProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const time = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-64 h-64 rounded-full border-4 border-white/15 bg-white/5 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-white tracking-wider">{time}</span>
          <span className="text-sm font-medium mt-2 text-gray-400 capitalize">{date}</span>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm">
        Pas de compte à rebours — travaille sur ton bloc planifié.
      </p>

      <div className="flex justify-center">
        <button
          onClick={onStop}
          disabled={stopping}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
        >
          <Square className="w-5 h-5" />
          <span>Terminer la session</span>
        </button>
      </div>
    </div>
  );
};

export default ClockTimer;
