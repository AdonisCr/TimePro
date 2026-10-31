import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Minimize2, Play } from 'lucide-react';
import { api } from '../../../lib/axios';
import { usePreferences } from '../../../hooks/usePreferences';
import {
  formatLongDuration,
  getMethodConfig,
  getTodaySessions,
  isFocusMethod,
  startFocusSession,
  stopFocusSession,
  type FocusMethod,
  type TodaySessionsResponse,
} from '../../../lib/focus';
import MethodSelector from './MethodSelector';
import CycleTimer from './CycleTimer';
import FreeTimer from './FreeTimer';
import ClockTimer from './ClockTimer';
import EndOfDayReport from '../EndOfDayReport';

interface FocusTaskOption {
  id: number;
  title: string;
  priority?: string;
  status?: string;
  estimated_duration?: number | null;
  project?: { name: string; color: string } | null;
}

interface FocusLocationState {
  task?: FocusTaskOption;
  taskId?: number;
}

type Phase = 'setup' | 'active' | 'done';

const FocusMode = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [navTask] = useState<FocusTaskOption | undefined>(
    () => (location.state as FocusLocationState | null)?.task
  );
  const [initialTaskId] = useState<number | null>(() => {
    const state = location.state as FocusLocationState | null;
    return state?.taskId ?? state?.task?.id ?? null;
  });

  const [method, setMethod] = useState<FocusMethod>(() => {
    const stored = localStorage.getItem('focus_method');
    return isFocusMethod(stored) ? stored : 'pomodoro';
  });
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [phase, setPhase] = useState<Phase>('setup');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [localStartedAt, setLocalStartedAt] = useState<number | null>(null);
  const [lastDuration, setLastDuration] = useState(0);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [tasks, setTasks] = useState<FocusTaskOption[]>([]);
  const [today, setToday] = useState<TodaySessionsResponse | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const { preferences, savePreferences } = usePreferences();
  const userPickedMethodRef = useRef(false);

  const refreshToday = useCallback(() => {
    getTodaySessions()
      .then(setToday)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshToday();
  }, [refreshToday]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<FocusTaskOption[]>('/tasks')
      .then((response) => {
        if (cancelled) return;
        const todoTasks = response.data.filter((task) => task.status === 'todo');
        setTasks(todoTasks);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (userPickedMethodRef.current) return;
    const prefMethod = preferences?.focus_method;
    if (isFocusMethod(prefMethod)) {
      setMethod(prefMethod);
    }
  }, [preferences?.focus_method, userPickedMethodRef]);

  const methodConfig = getMethodConfig(method);
  const isCycleMethod = methodConfig.focus_seconds > 0 && methodConfig.break_seconds > 0;

  const taskOptions = useMemo(() => {
    if (
      taskId === null ||
      tasks.some((task) => task.id === taskId) ||
      navTask?.id !== taskId
    ) {
      return tasks;
    }
    return [navTask, ...tasks];
  }, [tasks, taskId, navTask]);

  const selectedTask =
    taskOptions.find((task) => task.id === taskId) ??
    (navTask?.id === taskId ? navTask : undefined);

  const handleMethodChange = (nextMethod: FocusMethod) => {
    if (phase !== 'setup') return;
    userPickedMethodRef.current = true;
    setMethod(nextMethod);
    localStorage.setItem('focus_method', nextMethod);
    savePreferences({ focus_method: nextMethod }).catch(() => {
      setWarning('Préférence non synchronisée (stockée localement).');
    });
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setWarning(null);
    setLocalStartedAt(Date.now());
    try {
      const session = await startFocusSession(taskId, method);
      setSessionId(session.id);
    } catch {
      setSessionId(null);
      setWarning('Session locale — la synchronisation a échoué.');
    }
    setPhase('active');
    setStarting(false);
  };

  const handleStop = async () => {
    if (stopping) return;
    setStopping(true);
    let duration: number | null = null;

    if (sessionId !== null) {
      try {
        const stopped = await stopFocusSession(sessionId);
        duration = stopped.duration_seconds;
      } catch {
        setWarning('Arrêt non synchronisé — durée estimée localement.');
      }
    }

    if (duration === null) {
      duration =
        localStartedAt !== null ? Math.round((Date.now() - localStartedAt) / 1000) : 0;
    }

    setLastDuration(duration);
    setPhase('done');
    setStopping(false);
    refreshToday();
  };

  const handleNewSession = () => {
    setPhase('setup');
    setSessionId(null);
    setLocalStartedAt(null);
    setLastDuration(0);
    setWarning(null);
    refreshToday();
  };

  const handleExit = () => {
    navigate(-1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  const todayMinutes = today ? Math.round(today.total_seconds / 60) : 0;
  const todaySessions = today?.sessions.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-lg mx-4 my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/15 text-primary border border-primary/30">
                {methodConfig.label}
              </span>
              {phase !== 'setup' && selectedTask?.priority && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                    selectedTask.priority
                  )}`}
                >
                  {getPriorityLabel(selectedTask.priority)}
                </span>
              )}
              {phase !== 'setup' && selectedTask?.project && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                  style={{ backgroundColor: selectedTask.project.color }}
                >
                  {selectedTask.project.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white truncate">
              {phase !== 'setup' && selectedTask ? selectedTask.title : 'Mode Focus'}
            </h1>
            {phase === 'active' && (
              <p className="text-gray-400 text-sm mt-1">{methodConfig.description}</p>
            )}
          </div>

          <button
            onClick={handleExit}
            aria-label="Quitter le mode focus"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Method selector */}
        <MethodSelector
          value={method}
          onChange={handleMethodChange}
          disabled={phase !== 'setup'}
        />

        {/* Setup */}
        {phase === 'setup' && (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Tâche (optionnelle)
              </span>
              <select
                value={taskId ?? ''}
                onChange={(event) =>
                  setTaskId(event.target.value === '' ? null : Number(event.target.value))
                }
                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/60"
              >
                <option value="" className="text-text-dark">
                  — Aucune tâche —
                </option>
                {taskOptions.map((task) => (
                  <option key={task.id} value={task.id} className="text-text-dark">
                    {task.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-center">
              <button
                onClick={handleStart}
                disabled={starting}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <Play className="w-5 h-5" />
                <span>{starting ? 'Démarrage…' : 'Commencer'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Active session */}
        {phase === 'active' &&
          (isCycleMethod ? (
            <CycleTimer
              key={method}
              config={methodConfig}
              estimatedDuration={selectedTask?.estimated_duration ?? null}
              onStop={handleStop}
              stopping={stopping}
            />
          ) : method === 'flowtime' ? (
            <FreeTimer onStop={handleStop} stopping={stopping} />
          ) : (
            <ClockTimer onStop={handleStop} stopping={stopping} />
          ))}

        {/* Session finished */}
        {phase === 'done' && (
          <div className="text-center space-y-5 py-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Session terminée ! 🎯</h2>
              <p className="text-gray-400 text-sm">
                {methodConfig.label}
                {selectedTask ? ` · ${selectedTask.title}` : ''}
              </p>
            </div>
            <p className="text-5xl font-mono font-bold text-primary">
              {formatLongDuration(lastDuration)}
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleNewSession}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Nouvelle session</span>
              </button>
            </div>
          </div>
        )}

        {warning && (
          <p className="text-center text-xs text-amber-400/90">{warning}</p>
        )}

        {/* Today recap */}
        <div className="text-center text-sm text-gray-400">
          Aujourd'hui : {todayMinutes} min de focus, {todaySessions} session
          {todaySessions > 1 ? 's' : ''}
        </div>

        {/* Report button */}
        <div className="flex justify-center">
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Rapport du jour</span>
          </button>
        </div>

        {/* Coach tip */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-300 text-sm text-center">
            💡 <span className="font-medium">Conseil :</span> Reste concentré. Si une autre tâche
            te vient à l'esprit, note-la et continue.
          </p>
        </div>

        {/* Exit */}
        <div className="text-center pb-4">
          <button
            onClick={handleExit}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Quitter le mode focus
          </button>
        </div>
      </div>

      {reportOpen && <EndOfDayReport onClose={() => setReportOpen(false)} />}
    </div>
  );
};

export default FocusMode;
