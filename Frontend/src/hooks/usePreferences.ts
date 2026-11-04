import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';
import type { FocusMethod } from '../lib/focus';

interface UserPreferences {
  id?: number;
  user_id?: number;
  timezone?: string;
  work_start_time?: string | null;
  work_end_time?: string | null;
  peak_productivity_hours?: 'morning' | 'afternoon' | 'evening' | 'night' | null;
  task_duration_preference?: 'short' | 'medium' | 'long' | 'very_long' | null;
  work_style?: 'pomodoro' | 'continuous' | null;
  focus_method?: FocusMethod | null;
  has_recurring_tasks?: boolean;
  goals?: string[] | null;
  daily_time_dedication?: string | null;
  planning_style?: 'strict' | 'flexible';
  receive_reminders?: boolean;
  unplanned_tasks_handling?: 'immediate' | 'defer' | 'ignore';
  works_in_team?: boolean;
  needs_to_share?: boolean;
  use_labels?: boolean;
  interface_preference?: 'visual' | 'list';
  dark_mode?: boolean;
  personal_development_goals?: string[] | null;
  personal_dev_time?: string | null;
  habits_to_develop?: string[] | null;
  productivity_challenges?: string[] | null;
  has_routines?: boolean;
  life_priorities?: string[] | null;
  success_definition?: string | null;
  main_time_challenge?: string | null;
  app_expectations?: string | null;
  has_hobbies_to_plan?: boolean;
  other_tools_used?: string[] | null;
  specific_constraints?: string | null;
  onboarding_completed?: boolean;
  public_planning?: boolean;
  public_stats?: boolean;
  public_projects?: boolean;
}

interface UsePreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  savePreferences: (data: Partial<UserPreferences>) => Promise<void>;
}

export const usePreferences = (): UsePreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/preferences');
      setPreferences(response.data);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || 'Erreur lors du chargement des preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = async (data: Partial<UserPreferences>) => {
    const response = await api.put('/preferences', data);
    setPreferences(response.data.preferences);
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences?.dark_mode !== undefined) {
      const root = document.documentElement;
      if (preferences.dark_mode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [preferences?.dark_mode]);

  return { preferences, loading, error, fetchPreferences, savePreferences };
};

export type { UserPreferences };