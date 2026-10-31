import { useEffect, useState } from 'react';
import { Coffee, Play, Square } from 'lucide-react';
import { formatClock } from '../../../lib/focus';

interface FreeTimerProps {
  onStop: () => void;
  stopping: boolean;
}

const FreeTimer = ({ onStop, stopping }: FreeTimerProps) => {
  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [focusElapsed, setFocusElapsed] = useState(0);
  const [breakTotal, setBreakTotal] = useState(0);
  const [breakRemaining, setBreakRemaining] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (phase === 'focus') {
        setFocusElapsed((value) => value + 1);
      } else {
        setBreakRemaining((value) => (value > 0 ? value - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [phase]);

  useEffect(() => {
    if (phase === 'break' && breakRemaining === 0) {
      setPhase('focus');
    }
  }, [phase, breakRemaining]);

  const handleTakeBreak = () => {
    const duration = Math.max(Math.ceil(focusElapsed * 0.2), 5);
    setBreakTotal(duration);
    setBreakRemaining(duration);
    setPhase('break');
  };

  const breakProgress = breakTotal > 0 ? breakRemaining / breakTotal : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div
          className={`w-64 h-64 rounded-full border-4 flex flex-col items-center justify-center ${
            phase === 'break' ? 'border-green-500/60 bg-green-500/5' : 'border-primary/60 bg-primary/5'
          }`}
        >
          {phase === 'focus' ? (
            <>
              <span className="text-5xl font-mono font-bold text-white tracking-wider">
                {formatClock(focusElapsed)}
              </span>
              <span className="text-sm font-medium mt-2 text-primary">🌊 Focus libre</span>
            </>
          ) : (
            <>
              <span className="text-5xl font-mono font-bold text-white tracking-wider">
                {formatClock(breakRemaining)}
              </span>
              <span className="text-sm font-medium mt-2 text-green-400">☕ Pause</span>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm">
        {phase === 'focus'
          ? 'Travaille jusqu’à ce que tu veuilles une pause'
          : 'Pause proportionnelle : 20% du temps de focus écoulé'}
      </p>

      {phase === 'break' && (
        <div className="mx-auto max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.round(breakProgress * 100)}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {phase === 'focus' ? (
          <>
            <button
              onClick={handleTakeBreak}
              disabled={stopping || focusElapsed < 5}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Coffee className="w-5 h-5" />
              <span>Prendre une pause</span>
            </button>
            <button
              onClick={onStop}
              disabled={stopping}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
              <span>Terminer</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setPhase('focus')}
              disabled={stopping}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>Reprendre le focus</span>
            </button>
            <button
              onClick={onStop}
              disabled={stopping}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <Square className="w-5 h-5" />
              <span>Terminer la session</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FreeTimer;
