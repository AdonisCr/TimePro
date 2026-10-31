import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '../lib/axios';
import { PageTransition } from '../components/ui/Animations';
import CalendarIntegration from '../components/dashboard/CalendarIntegration';
import { tasksToCalendarEvents, type CalendarTask } from '../lib/calendar';
import { usePreferences } from '../hooks/usePreferences';

function toTaskList(payload: unknown): CalendarTask[] {
  if (Array.isArray(payload)) return payload as CalendarTask[];
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as CalendarTask[];
  }
  return [];
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? 'Impossible de charger tes tâches. Vérifie ta connexion puis réessaie.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Erreur inconnue lors du chargement des tâches.';
}

const CalendarPage = () => {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);
  const { preferences } = usePreferences();

  const workStartTime = preferences?.work_start_time ?? null;

  const events = useMemo(
    () => tasksToCalendarEvents(tasks, workStartTime),
    [tasks, workStartTime]
  );

  const loadTasks = useCallback(async () => {
    if (!loadedRef.current) setLoading(true);
    setError(null);

    try {
      const response = await api.get<unknown>('/tasks');
      setTasks(toTaskList(response.data));
      loadedRef.current = true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') loadTasks();
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [loadTasks]);

  const handleSync = () => {
    loadTasks();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-text-soft">Chargement du calendrier...</p>
            </div>
          ) : error && tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadTasks}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <CalendarIntegration events={events} onSync={handleSync} />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default CalendarPage;
