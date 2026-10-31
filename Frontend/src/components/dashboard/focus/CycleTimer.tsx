import { useEffect, useMemo, useState } from 'react';
import { usePomodoro } from '../../../hooks/usePomodoro';
import PomodoroTimer from './PomodoroTimer';
import { Pause, Play, SkipForward, Square } from 'lucide-react';
import type { MethodConfig } from '../../../lib/focus';

interface CycleTimerProps {
  config: MethodConfig;
  estimatedDuration?: number | null;
  onStop: () => void;
  stopping: boolean;
}

const CycleTimer = ({ config, estimatedDuration, onStop, stopping }: CycleTimerProps) => {
  const options = useMemo(
    () => ({
      workDuration: config.focus_seconds,
      shortBreak: config.break_seconds,
      longBreak: config.long_break_seconds ?? config.break_seconds,
      sessionsBeforeLongBreak: config.long_break_after ?? 4,
    }),
    [
      config.focus_seconds,
      config.break_seconds,
      config.long_break_seconds,
      config.long_break_after,
    ]
  );

  const pomodoro = usePomodoro(options);
  const {
    isRunning,
    isPaused,
    isBreak,
    currentSession,
    totalSessions,
    timeRemaining,
    totalTime,
    progress,
    start,
    pause,
    resume,
    skip,
  } = pomodoro;

  const [armed, setArmed] = useState(false);

  useEffect(() => {
    start();
    setArmed(true);
  }, [start]);

  useEffect(() => {
    if (armed && !isRunning && !isPaused) {
      start();
    }
  }, [armed, isRunning, isPaused, start]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <PomodoroTimer
          progress={progress}
          timeRemaining={timeRemaining}
          currentSession={currentSession}
          totalSessions={totalSessions}
          isBreak={isBreak}
        />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-300">
          Cycle {currentSession}/{totalSessions}
        </p>
        {isBreak && (
          <p className="text-sm text-green-400">🎯 Cycle terminé — profite de ta pause</p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSessions }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < currentSession - 1
                ? 'bg-primary'
                : i === currentSession - 1 && !isBreak
                ? 'bg-primary animate-pulse'
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {estimatedDuration ? (
        <div className="text-center text-gray-400 text-sm">
          <span>Estimé : {estimatedDuration}min</span>
          <span className="mx-2">•</span>
          <span>Écoulé : {Math.floor((totalTime - timeRemaining) / 60)}min</span>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-4">
        {!isBreak && !isRunning && !isPaused && (
          <button
            onClick={start}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Démarrer</span>
          </button>
        )}

        {!isBreak && isRunning && (
          <>
            <button
              onClick={pause}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
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
        )}

        {!isBreak && isPaused && (
          <>
            <button
              onClick={resume}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Reprendre</span>
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
        )}

        {isBreak && (
          <>
            <button
              onClick={skip}
              disabled={stopping}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" />
              <span>Passer la pause</span>
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

export default CycleTimer;
