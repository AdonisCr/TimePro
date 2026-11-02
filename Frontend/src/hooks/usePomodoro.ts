import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  isBreak: boolean;
  currentSession: number;
  totalSessions: number;
  timeRemaining: number;
  totalTime: number;
}

export interface UsePomodoroOptions {
  workDuration?: number; // in seconds
  shortBreak?: number;
  longBreak?: number;
  sessionsBeforeLongBreak?: number;
  onComplete?: () => void;
  onSessionComplete?: (session: number) => void;
  onBreakComplete?: () => void;
}

const DEFAULT_OPTIONS: UsePomodoroOptions = {
  workDuration: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 20 * 60, // 20 minutes
  sessionsBeforeLongBreak: 4,
};

export const usePomodoro = (options: UsePomodoroOptions = {}) => {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  const [state, setState] = useState<PomodoroState>({
    isRunning: false,
    isPaused: false,
    isBreak: false,
    currentSession: 1,
    totalSessions: config.sessionsBeforeLongBreak!,
    timeRemaining: config.workDuration!,
    totalTime: config.workDuration!,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          clearTimer();
          
          if (!prev.isBreak) {
            // Work session complete
            const nextSession = prev.currentSession + 1;
            const isLongBreak = nextSession > config.sessionsBeforeLongBreak!;
            
            setTimeout(() => {
              options.onSessionComplete?.(prev.currentSession);
              if (isLongBreak) {
                options.onComplete?.();
              }
            }, 0);

            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              isBreak: true,
              currentSession: isLongBreak ? 1 : nextSession,
              timeRemaining: isLongBreak ? config.longBreak! : config.shortBreak!,
              totalTime: isLongBreak ? config.longBreak! : config.shortBreak!,
            };
          } else {
            // Break complete
            setTimeout(() => options.onBreakComplete?.(), 0);
            
            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              isBreak: false,
              timeRemaining: config.workDuration!,
              totalTime: config.workDuration!,
            };
          }
        }
        
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);
  }, [clearTimer, config, options]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    startTimer();
  }, [startTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isRunning: false, isPaused: true }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
    startTimer();
  }, [startTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setState({
      isRunning: false,
      isPaused: false,
      isBreak: false,
      currentSession: 1,
      totalSessions: config.sessionsBeforeLongBreak!,
      timeRemaining: config.workDuration!,
      totalTime: config.workDuration!,
    });
  }, [clearTimer, config]);

  const skip = useCallback(() => {
    clearTimer();
    setState(prev => {
      if (!prev.isBreak) {
        return {
          ...prev,
          isRunning: false,
          isPaused: false,
          isBreak: true,
          timeRemaining: config.shortBreak!,
          totalTime: config.shortBreak!,
        };
      } else {
        return {
          ...prev,
          isRunning: false,
          isPaused: false,
          isBreak: false,
          timeRemaining: config.workDuration!,
          totalTime: config.workDuration!,
        };
      }
    });
  }, [clearTimer, config]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = 1 - state.timeRemaining / state.totalTime;

  return {
    ...state,
    progress,
    start,
    pause,
    resume,
    stop,
    skip,
  };
};
