import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios, { isAxiosError } from 'axios';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
  Loader2,
  Lock,
  TrendingUp,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface PublicTask {
  id: number;
  title: string;
  priority: string;
  status: string;
  project: { name: string; color: string } | null;
}

interface PublicTimeEntry {
  id: number;
  start_time: string;
  end_time: string | null;
  duration: number;
}

interface PublicPlanning {
  user: { name: string; avatar: string | null };
  date: string;
  tasks: PublicTask[];
  time_entries: PublicTimeEntry[];
  stats: { total_tasks: number; completed_today: number };
}

interface PublicStats {
  user: { name: string; avatar: string | null };
  tasks: { total: number; completed: number; completion_rate: number };
  time: { total_hours: number; today_entries: number };
  projects: number;
  updated_at: string;
}

interface PublicProject {
  id: number;
  name: string;
  color: string;
  status: string;
  tasks_count: number;
  completed_tasks: number;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

const PRIORITY_CLASSES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
};

const SharedPlanningPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [date, setDate] = useState(todayIso);
  const [planning, setPlanning] = useState<PublicPlanning | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    const [planningResult, statsResult, projectsResult] = await Promise.allSettled([
      axios.get<{ success: boolean; data: PublicPlanning }>(`${API_URL}/public/planning/${userId}`, {
        params: { date },
      }),
      axios.get<{ success: boolean; data: PublicStats }>(`${API_URL}/public/stats/${userId}`),
      axios.get<{ success: boolean; data: PublicProject[] }>(`${API_URL}/public/projects/${userId}`),
    ]);

    if (planningResult.status === 'fulfilled') {
      setPlanning(planningResult.value.data.data);
      setBlocked(false);
    } else {
      const response = isAxiosError(planningResult.reason) ? planningResult.reason.response : undefined;

      if (response?.status === 403 || response?.status === 404) {
        setBlocked(true);
      } else {
        setError('Impossible de charger ce planning pour le moment. Réessaie dans un instant.');
      }
      setPlanning(null);
    }

    setStats(statsResult.status === 'fulfilled' ? statsResult.value.data.data : null);
    setProjects(projectsResult.status === 'fulfilled' ? projectsResult.value.data.data : []);
    setLoading(false);
  }, [date, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalDaySeconds = useMemo(
    () => planning?.time_entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) ?? 0,
    [planning]
  );

  const shiftDate = (days: number) => {
    const next = new Date(date + 'T00:00:00');
    next.setDate(next.getDate() + days);
    setDate(next.toISOString().slice(0, 10));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (blocked || !planning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
          <h1 className="text-xl font-bold text-text-dark mb-2">Planning non accessible</h1>
          <p className="text-text-soft text-sm mb-6">
            {error || 'Ce planning n\'est pas partagé publiquement, ou le lien a été désactivé.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
          >
            Découvrir Time Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-br from-primary to-[#0a6fa8] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            {planning.user.avatar ? (
              <img
                src={planning.user.avatar}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-white/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {planning.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-white/80">Planning partagé</p>
              <h1 className="text-2xl font-bold">{planning.user.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2 text-white/90">
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm capitalize">{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-2 rounded-lg hover:bg-white/15 transition-colors"
                aria-label="Jour précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={date}
                max={todayIso()}
                onChange={event => event.target.value && setDate(event.target.value)}
                className="px-2 py-1 rounded-lg text-sm text-text-dark bg-white/90"
                aria-label="Choisir une date"
              />
              <button
                type="button"
                onClick={() => shiftDate(1)}
                disabled={date >= todayIso()}
                className="p-2 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-40"
                aria-label="Jour suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-text-soft">Tâches terminées</p>
              <p className="text-xl font-bold text-text-dark">{stats.tasks.completed}</p>
              <p className="text-xs text-text-soft">sur {stats.tasks.total}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-text-soft">Taux de réussite</p>
              <p className="text-xl font-bold text-text-dark">{stats.tasks.completion_rate}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-text-soft">Temps total</p>
              <p className="text-xl font-bold text-text-dark">{stats.time.total_hours} h</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-text-soft">Projets</p>
              <p className="text-xl font-bold text-text-dark">{stats.projects}</p>
            </div>
          </div>
        )}

        {/* Tâches */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-dark">Tâches du jour</h2>
            <span className="text-sm text-text-soft">{planning.tasks.length} tâche(s)</span>
          </div>

          {planning.tasks.length === 0 ? (
            <p className="text-sm text-text-soft py-4">Aucune tâche prévue pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {planning.tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <CheckCircle2
                    className={`w-5 h-5 shrink-0 ${
                      task.status === 'done' ? 'text-green-500' : 'text-gray-300'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'text-text-soft line-through' : 'text-text-dark'}`}>
                      {task.title}
                    </p>
                    {task.project && (
                      <p className="text-xs text-text-soft flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.project.color }}
                        />
                        {task.project.name}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      PRIORITY_CLASSES[task.priority] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {PRIORITY_LABELS[task.priority] ?? task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Temps travaillé */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-dark flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-soft" />
              Temps travaillé
            </h2>
            <span className="text-sm font-medium text-text-dark">{formatDuration(totalDaySeconds)}</span>
          </div>

          {planning.time_entries.length === 0 ? (
            <p className="text-sm text-text-soft py-4">Aucun temps enregistré pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {planning.time_entries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm"
                >
                  <span className="text-text-soft">
                    {formatTime(entry.start_time)}
                    {entry.end_time ? ` – ${formatTime(entry.end_time)}` : ' – en cours'}
                  </span>
                  <span className="font-medium text-text-dark">{formatDuration(entry.duration || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projets */}
        {projects.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-text-dark flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-text-soft" />
              Projets
            </h2>
            <div className="space-y-2">
              {projects.map(project => {
                const progress = project.tasks_count > 0
                  ? Math.round((project.completed_tasks / project.tasks_count) * 100)
                  : 0;

                return (
                  <div key={project.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <p className="text-sm font-medium text-text-dark truncate">{project.name}</p>
                      </div>
                      <span className="text-xs text-text-soft shrink-0">
                        {project.completed_tasks}/{project.tasks_count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-text-soft py-4 flex items-center justify-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Planning partagé via Time Pro
        </footer>
      </div>
    </div>
  );
};

export default SharedPlanningPage;
