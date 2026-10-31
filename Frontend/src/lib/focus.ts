import { api } from './axios';

export type FocusMethod =
  | 'pomodoro'
  | 'deep_work'
  | 'flowtime'
  | 'fifty_two_seventeen'
  | 'timebox';

export interface FocusSession {
  id: number;
  task_id: number | null;
  method: FocusMethod;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  completed: boolean;
  notes: string | null;
  task_title: string | null;
}

export interface FocusReport {
  date: string;
  sessions_count: number;
  total_focus_seconds: number;
  tasks_done_today: number;
  tasks_done: { id: number; title: string }[];
  tasks_pending_today: number;
  by_method: Record<FocusMethod, number>;
  longest_session_seconds: number;
  current_streak_days: number;
}

export interface MethodConfig {
  id: FocusMethod;
  label: string;
  description: string;
  focus_seconds: number;
  break_seconds: number;
  long_break_seconds?: number;
  long_break_after?: number;
}

export interface TodaySessionsResponse {
  sessions: FocusSession[];
  total_seconds: number;
  by_method: Partial<Record<FocusMethod, number>>;
}

export interface StartSessionResponse {
  id: number;
  task_id: number | null;
  method: FocusMethod;
  started_at: string;
}

export interface StopSessionResponse {
  id: number;
  duration_seconds: number;
  completed: boolean;
  ended_at: string;
}

export const METHODS: MethodConfig[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    description: '25 min focus, 5 min pause',
    focus_seconds: 1500,
    break_seconds: 300,
    long_break_seconds: 900,
    long_break_after: 4,
  },
  {
    id: 'deep_work',
    label: 'Deep Work',
    description: '90 min focus, 20 min pause',
    focus_seconds: 5400,
    break_seconds: 1200,
  },
  {
    id: 'flowtime',
    label: 'Flowtime',
    description: 'Travaille libre, pause proportionnelle',
    focus_seconds: 0,
    break_seconds: 0,
  },
  {
    id: 'fifty_two_seventeen',
    label: '52-17',
    description: '52 min focus, 17 min pause',
    focus_seconds: 3120,
    break_seconds: 1020,
  },
  {
    id: 'timebox',
    label: 'Timebox',
    description: 'Pas de timer, blocs planifiés',
    focus_seconds: 0,
    break_seconds: 0,
  },
];

export const getMethodConfig = (id: FocusMethod): MethodConfig =>
  METHODS.find((m) => m.id === id) ?? METHODS[0];

export const isFocusMethod = (value: unknown): value is FocusMethod =>
  typeof value === 'string' && METHODS.some((m) => m.id === value);

/** "2h 15min" / "45min" / "1h" */
export const formatLongDuration = (totalSeconds: number): string => {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
};

/** "HH:MM:SS" (ou "MM:SS" si < 1h) */
export const formatClock = (totalSeconds: number): string => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

export const startFocusSession = async (
  taskId: number | null,
  method: FocusMethod
): Promise<StartSessionResponse> => {
  const response = await api.post<StartSessionResponse>('/focus/sessions', {
    task_id: taskId,
    method,
  });
  return response.data;
};

export const stopFocusSession = async (
  id: number,
  notes?: string
): Promise<StopSessionResponse> => {
  const response = await api.patch<StopSessionResponse>(
    `/focus/sessions/${id}/stop`,
    notes ? { notes } : {}
  );
  return response.data;
};

export const getTodaySessions = async (): Promise<TodaySessionsResponse> => {
  const response = await api.get<TodaySessionsResponse>('/focus/sessions/today');
  return response.data;
};

export const getTodayReport = async (): Promise<FocusReport> => {
  const response = await api.get<FocusReport>('/focus/report/today');
  return response.data;
};
