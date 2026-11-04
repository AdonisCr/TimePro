import { METHODS, type FocusMethod } from './focus';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  due_date?: string | null;
  estimated_duration?: number | null;
  project?: {
    name: string;
    color: string;
  };
}

/**
 * Renvoie la date locale au format AAAA-MM-JJ.
 * Une échéance fixée à aujourd'hui ne doit pas être considérée comme en retard :
 * on compare donc des jours, pas des heures.
 */
const toLocalDateKey = (value: string | Date): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export interface ProductivityInsight {
  type: 'frog' | 'two_minute' | 'mit' | 'warning' | 'tip' | 'focus';
  icon: string;
  title: string;
  message: string;
  taskId?: number;
  action?: string;
}

/**
 * Eat That Frog: Identify the first high-priority task of the day
 */
export const getEatThatFrogTask = (tasks: Task[]): Task | null => {
  const today = toLocalDateKey(new Date());
  
  const highPriorityTasks = tasks.filter(t => 
    t.priority === 'high' && 
    t.status !== 'done' &&
    (!t.due_date || toLocalDateKey(t.due_date) <= today)
  );
  
  // Return the first one (or most overdue)
  return highPriorityTasks.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  })[0] || null;
};

/**
 * 2-Minute Rule: Detect tasks that can be done immediately
 */
export const getTwoMinuteTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(t => 
    t.status !== 'done' && 
    typeof t.estimated_duration === 'number' &&
    t.estimated_duration <= 2
  );
};

/**
 * MIT (Most Important Tasks): Get the 3 most important tasks
 */
export const getMITTasks = (tasks: Task[]): Task[] => {
  const activeTasks = tasks.filter(t => t.status !== 'done');
  
  // Sort by priority and due date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return activeTasks
    .sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 3);
};

/**
 * Ivy Lee Method: Get top 6 tasks for the day
 */
export const getIvyLeeTasks = (tasks: Task[]): Task[] => {
  const activeTasks = tasks.filter(t => t.status !== 'done');
  
  // Sort by priority and due date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return activeTasks
    .sort((a, b) => {
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 6);
};

/**
 * Generate productivity insights
 */
export const generateInsights = (
  tasks: Task[],
  byMethod?: Partial<Record<FocusMethod, number>>
): ProductivityInsight[] => {
  const insights: ProductivityInsight[] = [];
  
  // Eat That Frog
  const frogTask = getEatThatFrogTask(tasks);
  if (frogTask) {
    insights.push({
      type: 'frog',
      icon: '🐸',
      title: 'Ta grenouille du jour',
      message: `Commence par "${frogTask.title}" — c'est la tâche la plus importante.`,
      taskId: frogTask.id,
    });
  }
  
  // 2-Minute Rule
  const twoMinuteTasks = getTwoMinuteTasks(tasks);
  if (twoMinuteTasks.length > 0) {
    insights.push({
      type: 'two_minute',
      icon: '⚡',
      title: `${twoMinuteTasks.length} tâche${twoMinuteTasks.length > 1 ? 's' : ''} rapide${twoMinuteTasks.length > 1 ? 's' : ''}`,
      message: `Fais-les maintenant ! Elles prendront moins de 2 minutes.`,
    });
  }
  
  // MIT
  const mitTasks = getMITTasks(tasks);
  if (mitTasks.length > 0) {
    insights.push({
      type: 'mit',
      icon: '⭐',
      title: 'Tes 3 priorités du jour',
      message: `Concentre-toi sur : ${mitTasks.map(t => t.title).join(', ')}`,
    });
  }
  
  // Warnings
  const todayKey = toLocalDateKey(new Date());
  const overdueTasks = tasks.filter(t => 
    t.status !== 'done' && 
    t.due_date && 
    toLocalDateKey(t.due_date) < todayKey
  );
  
  if (overdueTasks.length > 0) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      title: `${overdueTasks.length} tâche${overdueTasks.length > 1 ? 's' : ''} en retard`,
      message: `Tu as ${overdueTasks.length} tâche${overdueTasks.length > 1 ? 's' : ''} dépassée${overdueTasks.length > 1 ? 's' : ''} la date limite.`,
    });
  }
  
  // Tips based on task count
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  if (pendingTasks.length > 10) {
    insights.push({
      type: 'tip',
      icon: '💡',
      title: 'Beaucoup de tâches !',
      message: `Tu as ${pendingTasks.length} tâches en cours. Statistiquement, tu n'en finiras qu'une partie. Veux-tu que je t'aide à prioriser ?`,
    });
  }
  
  // Méthode de focus dominante
  if (byMethod) {
    const usage = METHODS
      .map((method) => ({ method, seconds: byMethod[method.id] ?? 0 }))
      .filter((entry) => entry.seconds > 0);
    const totalSeconds = usage.reduce((sum, entry) => sum + entry.seconds, 0);

    if (totalSeconds >= 600 && usage.length > 0) {
      const dominant = usage.reduce((max, entry) =>
        entry.seconds > max.seconds ? entry : max
      );
      const share = Math.round((dominant.seconds / totalSeconds) * 100);

      if (share >= 70) {
        insights.push({
          type: 'focus',
          icon: '⏱️',
          title: 'Rythme de focus',
          message:
            dominant.method.id === 'pomodoro'
              ? `Tu passes ${share}% de ton temps en Pomodoro — essaie Deep Work pour les tâches créatives.`
              : `Tu passes ${share}% de ton temps en ${dominant.method.label} — varie les méthodes pour garder de la flexibilité.`,
        });
      }
    }
  }
  
  return insights;
};

/**
 * Get estimated time for a task in minutes
 */
export const getEstimatedMinutes = (task: Task): number => {
  if (typeof task.estimated_duration === 'number' && task.estimated_duration > 0) {
    return task.estimated_duration;
  }
  
  // Default estimation based on priority
  switch (task.priority) {
    case 'high': return 60;
    case 'medium': return 30;
    case 'low': return 15;
    default: return 30;
  }
};

/**
 * Format time display
 */
export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
};
