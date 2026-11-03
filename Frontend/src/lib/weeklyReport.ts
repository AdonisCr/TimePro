/**
 * Calculs du rapport hebdomadaire.
 *
 * Règle importante : `duration` est exprimée en SECONDES dans toute l'API.
 * Toutes les durées manipulées ici sont donc en secondes ; la conversion en
 * heures/minutes se fait uniquement à l'affichage.
 */

export interface WeeklyTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
}

export interface WeeklyTimeEntry {
  id: number;
  task_id?: number | null;
  duration: number | null;
  start_time: string;
}

export interface DailyBreakdown {
  day: string;
  date: string;
  tasks: number;
  timeSeconds: number;
}

export interface WeeklyReportData {
  completedCount: number;
  totalCount: number;
  totalTimeSeconds: number;
  avgTimePerTaskSeconds: number;
  completionRate: number;
  priorityDistribution: { high: number; medium: number; low: number };
  dailyBreakdown: DailyBreakdown[];
}

const DAY_COUNT = 7;

const pad = (value: number): string => value.toString().padStart(2, '0');

/** Clé de jour au fuseau local : "2026-11-03". */
export const localDayKey = (value: string | Date): string | null => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "1h05", "0h00", "12h30" — conversion secondes → heures/minutes. */
export const formatSecondsAsHours = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h${pad(minutes)}`;
};

/**
 * Construit le rapport des 7 derniers jours.
 *
 * - une tâche est "créée cette semaine" d'après `created_at` (jamais d'après
 *   son identifiant ou son échéance) ;
 * - une tâche est "terminée cette semaine" d'après `completed_at` (avec
 *   `updated_at` en secours pour les anciennes tâches non migrées) ;
 * - les durées sont additionnées en secondes, jour par jour, au fuseau local.
 */
export const buildWeeklyReport = (
  tasks: WeeklyTask[],
  timeEntries: WeeklyTimeEntry[],
  now: Date = new Date()
): WeeklyReportData => {
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (DAY_COUNT - 1));

  const completionDate = (task: WeeklyTask): Date | null =>
    parseDate(task.completed_at ?? task.updated_at);

  const completedThisWeek = tasks.filter((task) => {
    if (task.status !== 'done') return false;
    const completed = completionDate(task);
    return completed !== null && completed >= weekStart;
  });

  const createdThisWeek = tasks.filter((task) => {
    const created = parseDate(task.created_at);
    return created !== null && created >= weekStart;
  });

  const weekEntries = timeEntries.filter((entry) => {
    const startedAt = parseDate(entry.start_time);
    return startedAt !== null && startedAt >= weekStart;
  });

  const totalTimeSeconds = weekEntries.reduce(
    (total, entry) => total + Math.max(0, entry.duration ?? 0),
    0
  );

  const avgTimePerTaskSeconds =
    completedThisWeek.length > 0 ? totalTimeSeconds / completedThisWeek.length : 0;

  const completionRate =
    createdThisWeek.length > 0
      ? Math.round((completedThisWeek.length / createdThisWeek.length) * 100)
      : 0;

  const priorityDistribution = {
    high: completedThisWeek.filter((task) => task.priority === 'high').length,
    medium: completedThisWeek.filter((task) => task.priority === 'medium').length,
    low: completedThisWeek.filter((task) => task.priority === 'low').length,
  };

  const dailyBreakdown: DailyBreakdown[] = Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (DAY_COUNT - 1 - index));
    const key = localDayKey(date);

    const tasksDone = completedThisWeek.filter((task) => {
      const completed = completionDate(task);
      return completed !== null && localDayKey(completed) === key;
    }).length;

    const timeSeconds = weekEntries
      .filter((entry) => localDayKey(entry.start_time) === key)
      .reduce((total, entry) => total + Math.max(0, entry.duration ?? 0), 0);

    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: key ?? '',
      tasks: tasksDone,
      timeSeconds,
    };
  });

  return {
    completedCount: completedThisWeek.length,
    totalCount: createdThisWeek.length,
    totalTimeSeconds,
    avgTimePerTaskSeconds,
    completionRate,
    priorityDistribution,
    dailyBreakdown,
  };
};
