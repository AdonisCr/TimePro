import { useState, useCallback } from 'react';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  bestStreak: number;
  completions: string[]; // dates in YYYY-MM-DD format
  color: string;
}

export interface UseHabitsReturn {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions'>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (id: string, date?: string) => void;
  getTodayProgress: () => { completed: number; total: number; percentage: number };
  getWeekProgress: () => { completed: number; total: number };
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const getToday = () => new Date().toISOString().split('T')[0];

const getWeekDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const calculateStreak = (completions: string[]): { current: number; best: number } => {
  if (completions.length === 0) return { current: 0, best: 0 };
  
  const sorted = [...completions].sort().reverse();
  const today = getToday();
  
  // Calculate current streak
  let currentStreak = 0;
  const checkDate = new Date(today);
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1]);
    const currDate = new Date(sorted[i]);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);
  
  return { current: currentStreak, best: bestStreak };
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    icon: '🍅',
    frequency: 'daily',
    targetCount: 4,
    currentStreak: 0,
    bestStreak: 0,
    completions: [],
    color: '#EF4444',
  },
  {
    id: 'sport',
    name: 'Sport',
    icon: '🏃',
    frequency: 'daily',
    targetCount: 1,
    currentStreak: 0,
    bestStreak: 0,
    completions: [],
    color: '#3B82F6',
  },
  {
    id: 'meditation',
    name: 'Méditation',
    icon: '🧘',
    frequency: 'daily',
    targetCount: 1,
    currentStreak: 0,
    bestStreak: 0,
    completions: [],
    color: '#8B5CF6',
  },
];

export const useHabits = (): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);

  const addHabit = useCallback((newHabit) => {
    const habit: Habit = {
      ...newHabit,
      id: generateId(),
      currentStreak: 0,
      bestStreak: 0,
      completions: [],
    };
    setHabits(prev => [...prev, habit]);
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const toggleCompletion = useCallback((id: string, date?: string) => {
    const dateStr = date || getToday();
    
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      
      const isCompleted = habit.completions.includes(dateStr);
      const newCompletions = isCompleted
        ? habit.completions.filter(d => d !== dateStr)
        : [...habit.completions, dateStr];
      
      const streaks = calculateStreak(newCompletions);
      
      return {
        ...habit,
        completions: newCompletions,
        currentStreak: streaks.current,
        bestStreak: streaks.best,
      };
    }));
  }, []);

  const getTodayProgress = useCallback(() => {
    const today = getToday();
    const completed = habits.filter(h => h.completions.includes(today)).length;
    return {
      completed,
      total: habits.length,
      percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0,
    };
  }, [habits]);

  const getWeekProgress = useCallback(() => {
    const weekDates = getWeekDates();
    let completed = 0;
    let total = 0;
    
    habits.forEach(habit => {
      weekDates.forEach(date => {
        total++;
        if (habit.completions.includes(date)) {
          completed++;
        }
      });
    });
    
    return { completed, total };
  }, [habits]);

  return {
    habits,
    addHabit,
    removeHabit,
    toggleCompletion,
    getTodayProgress,
    getWeekProgress,
  };
};
