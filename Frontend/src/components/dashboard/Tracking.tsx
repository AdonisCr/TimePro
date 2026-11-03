import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Calendar, BarChart3, Timer, RotateCcw } from 'lucide-react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import {
  ACTIVE_TIMER_STORAGE_KEY,
  createIdleTimer,
  getElapsedSeconds,
  getFirstStart,
  getStatus,
  parseTimerState,
  pauseTimer,
  resumeTimer,
  serializeTimer,
  startTimer,
  type TimerState,
} from '../../lib/timer';

interface TrackingProps {
  tasks?: unknown[];
}

const readStoredTimer = (): TimerState => {
  try {
    return parseTimerState(localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY)) ?? createIdleTimer();
  } catch {
    return createIdleTimer();
  }
};

const Tracking: React.FC<TrackingProps> = () => {
  const { entries, stats, createEntry, loading } = useTimeEntries();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [timer, setTimer] = useState<TimerState>(readStoredTimer);
  const [seconds, setSeconds] = useState(() => getElapsedSeconds(timer, Date.now()));
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [selectedTask, setSelectedTask] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const status = getStatus(timer);

  // Le chronomètre survit à un rechargement de la page : le temps déjà
  // travaillé n'est pas perdu.
  useEffect(() => {
    try {
      if (status === 'idle') {
        localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
      } else {
        localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, serializeTimer(timer));
      }
    } catch {
      // Stockage indisponible (navigation privée) : le chrono reste en mémoire.
    }

    setSeconds(getElapsedSeconds(timer, Date.now()));
  }, [timer, status]);

  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      setSeconds(getElapsedSeconds(timer, Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, timer]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0h 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const resetTimer = () => {
    setTimer(createIdleTimer());
    setSeconds(0);
    setDescription('');
  };

  const handleStart = () => {
    setErrorMessage(null);
    setSeconds(0);
    setTimer(startTimer(Date.now()));
  };

  const handlePause = () => {
    setTimer((current) => pauseTimer(current, Date.now()));
  };

  const handleResume = () => {
    setErrorMessage(null);
    setTimer((current) => resumeTimer(current, Date.now()));
  };

  const handleStop = async () => {
    const firstStart = getFirstStart(timer);
    if (firstStart === null) return;

    const endTime = new Date();
    // Somme des segments actifs : les pauses ne sont pas comptées.
    const duration = getElapsedSeconds(timer, endTime.getTime());

    if (duration < 1) {
      resetTimer();
      return;
    }

    try {
      await createEntry({
        task_id: selectedTask || null,
        project_id: selectedProject || null,
        description: description || null,
        start_time: new Date(firstStart).toISOString(),
        end_time: endTime.toISOString(),
        duration,
        is_manual: false,
      });
    } catch (err) {
      console.error('Erreur création entry:', err);
      // On ne réinitialise pas : la session reste visible et peut être
      // réessayée, plutôt que d'être perdue silencieusement.
      setErrorMessage(
        "La session n'a pas pu être enregistrée. Vérifie la connexion puis réessaie."
      );
      return;
    }

    setErrorMessage(null);
    resetTimer();
  };

  const filteredTasks = selectedProject 
    ? tasks.filter(t => t.project_id === selectedProject)
    : tasks;

  const todayEntries = entries.filter(e => {
    const entryDate = new Date(e.start_time).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-2">Suivi du temps</h2>
          <p className="text-text-soft mb-8">Suivez vos sessions de travail efficacement</p>
          
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-text-dark mb-4">
              {formatTime(seconds)}
            </div>
            <p className="text-text-soft">
              {status === 'running'
                ? 'Session en cours'
                : status === 'paused'
                  ? 'En pause — le temps n’est plus compté'
                  : 'Prêt à démarrer'}
            </p>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all bg-primary hover:bg-primary-hover text-white"
              >
                <Play className="w-5 h-5" />
                <span>Démarrer</span>
              </button>
            )}

            {status === 'running' && (
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}

            {status === 'paused' && (
              <button
                onClick={handleResume}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all bg-primary hover:bg-primary-hover text-white"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reprendre</span>
              </button>
            )}

            <button 
              onClick={handleStop}
              disabled={status === 'idle'}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-5 h-5" />
              <span>Arrêter</span>
            </button>
          </div>

          {errorMessage && (
            <p className="max-w-md mx-auto mb-4 text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="max-w-md mx-auto space-y-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner une tâche (optionnel)</option>
              {filteredTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la session..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-text-soft font-medium">Temps total</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">
            {formatDuration(stats?.today?.total_seconds || 0)}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-text-soft font-medium">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">
            {stats?.today?.entries_count || 0}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-text-soft font-medium">Projets</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">
            {projects.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-text-soft font-medium">Semaine</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">
            {formatDuration(stats?.week?.total_seconds || 0)}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-text-dark mb-6">Sessions récentes</h3>
        {loading ? (
          <p className="text-text-soft">Chargement...</p>
        ) : todayEntries.length === 0 ? (
          <p className="text-text-soft text-center py-8">Aucune session aujourd'hui</p>
        ) : (
          <div className="space-y-4">
            {todayEntries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-bg-light rounded-xl transition-colors">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.project?.color || '#00B4DB' }}
                  ></div>
                  <div>
                    <h4 className="font-medium text-text-dark">
                      {entry.task?.title || entry.project?.name || 'Sans projet'}
                    </h4>
                    <p className="text-sm text-text-soft">
                      {entry.description || 'Session de travail'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-dark">
                    {formatDuration(entry.duration)}
                  </div>
                  <div className="text-sm text-text-soft">
                    {new Date(entry.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
