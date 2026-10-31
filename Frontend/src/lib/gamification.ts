export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
}

export interface UserStats {
  tasksCompleted: number;
  pomodorosCompleted: number;
  streakDays: number;
  totalFocusMinutes: number;
}

const ALL_BADGES: Badge[] = [
  // Task badges
  { id: 'first_task', name: 'Premier pas', description: 'Complète ta première tâche', icon: '🎯', color: '#10B981' },
  { id: 'tasks_10', name: 'Productif', description: 'Complète 10 tâches', icon: '⚡', color: '#3B82F6' },
  { id: 'tasks_50', name: 'Imparable', description: 'Complète 50 tâches', icon: '🚀', color: '#8B5CF6' },
  { id: 'tasks_100', name: 'Légende', description: 'Complète 100 tâches', icon: '👑', color: '#F59E0B' },
  
  // Pomodoro badges
  { id: 'pomodoro_1', name: 'Concentré', description: 'Termine un Pomodoro', icon: '🍅', color: '#EF4444' },
  { id: 'pomodoro_10', name: 'Focus Master', description: 'Termine 10 Pomodoros', icon: '🔥', color: '#F97316' },
  { id: 'pomodoro_100', name: 'Zen', description: 'Termine 100 Pomodoros', icon: '🧘', color: '#8B5CF6' },
  
  // Streak badges
  { id: 'streak_3', name: 'En forme', description: '3 jours consécutifs', icon: '💪', color: '#10B981' },
  { id: 'streak_7', name: 'Semaine parfaite', description: '7 jours consécutifs', icon: '🌟', color: '#F59E0B' },
  { id: 'streak_30', name: 'Discipliné', description: '30 jours consécutifs', icon: '🏆', color: '#EF4444' },
  
  // Special badges
  { id: 'frog_eater', name: 'Grenouille', description: 'Complète ta grenouille 5 fois', icon: '🐸', color: '#10B981' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Complète une tâche avant 8h', icon: '🌅', color: '#F59E0B' },
  { id: 'night_owl', name: 'Noctambule', description: 'Complète une tâche après 22h', icon: '🦉', color: '#6366F1' },
];

export const getUnlockedBadges = (stats: UserStats): Badge[] => {
  const unlocked: Badge[] = [];
  
  // Task badges
  if (stats.tasksCompleted >= 1) unlocked.push(ALL_BADGES.find(b => b.id === 'first_task')!);
  if (stats.tasksCompleted >= 10) unlocked.push(ALL_BADGES.find(b => b.id === 'tasks_10')!);
  if (stats.tasksCompleted >= 50) unlocked.push(ALL_BADGES.find(b => b.id === 'tasks_50')!);
  if (stats.tasksCompleted >= 100) unlocked.push(ALL_BADGES.find(b => b.id === 'tasks_100')!);
  
  // Pomodoro badges
  if (stats.pomodorosCompleted >= 1) unlocked.push(ALL_BADGES.find(b => b.id === 'pomodoro_1')!);
  if (stats.pomodorosCompleted >= 10) unlocked.push(ALL_BADGES.find(b => b.id === 'pomodoro_10')!);
  if (stats.pomodorosCompleted >= 100) unlocked.push(ALL_BADGES.find(b => b.id === 'pomodoro_100')!);
  
  // Streak badges
  if (stats.streakDays >= 3) unlocked.push(ALL_BADGES.find(b => b.id === 'streak_3')!);
  if (stats.streakDays >= 7) unlocked.push(ALL_BADGES.find(b => b.id === 'streak_7')!);
  if (stats.streakDays >= 30) unlocked.push(ALL_BADGES.find(b => b.id === 'streak_30')!);
  
  return unlocked.filter(Boolean);
};

export const getNextBadges = (stats: UserStats): { badge: Badge; progress: number; needed: number }[] => {
  const next: { badge: Badge; progress: number; needed: number }[] = [];
  
  // Task progress
  if (stats.tasksCompleted < 10) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'tasks_10')!, progress: stats.tasksCompleted, needed: 10 });
  } else if (stats.tasksCompleted < 50) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'tasks_50')!, progress: stats.tasksCompleted, needed: 50 });
  }
  
  // Pomodoro progress
  if (stats.pomodorosCompleted < 10) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'pomodoro_10')!, progress: stats.pomodorosCompleted, needed: 10 });
  } else if (stats.pomodorosCompleted < 100) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'pomodoro_100')!, progress: stats.pomodorosCompleted, needed: 100 });
  }
  
  // Streak progress
  if (stats.streakDays < 7) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'streak_7')!, progress: stats.streakDays, needed: 7 });
  } else if (stats.streakDays < 30) {
    next.push({ badge: ALL_BADGES.find(b => b.id === 'streak_30')!, progress: stats.streakDays, needed: 30 });
  }
  
  return next;
};

export const getAllBadges = (): Badge[] => ALL_BADGES;
