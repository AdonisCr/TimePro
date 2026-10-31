import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  METHODS,
  formatClock,
  formatLongDuration,
  getTodayReport,
  type FocusMethod,
  type FocusReport,
} from '../../lib/focus';

interface EndOfDayReportProps {
  onClose: () => void;
}

const METHOD_COLORS: Record<FocusMethod, string> = {
  pomodoro: 'bg-primary',
  deep_work: 'bg-indigo-500',
  flowtime: 'bg-emerald-500',
  fifty_two_seventeen: 'bg-amber-500',
  timebox: 'bg-pink-500',
};

const EndOfDayReport = ({ onClose }: EndOfDayReportProps) => {
  const [report, setReport] = useState<FocusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTodayReport()
      .then((data) => {
        if (!cancelled) {
          setReport(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Impossible de charger le rapport du jour.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalByMethod = report
    ? METHODS.reduce((sum, method) => sum + (report.by_method[method.id] ?? 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-text-dark">📊 Rapport du jour</h2>
            {report && <p className="text-xs text-text-soft">{report.date}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le rapport"
            className="p-2 text-gray-400 hover:text-text-dark hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="py-10 text-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-soft text-sm">Chargement du rapport…</p>
            </div>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-sm text-red-500">{error}</p>
          )}

          {!loading && report && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                  <p className="text-2xl">🎯</p>
                  <p className="mt-1 text-xl font-bold text-text-dark">
                    {formatLongDuration(report.total_focus_seconds)}
                  </p>
                  <p className="text-xs text-text-soft">de focus</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <p className="text-2xl">🔥</p>
                  <p className="mt-1 text-xl font-bold text-text-dark">
                    {report.current_streak_days} jour{report.current_streak_days > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-text-soft">de streak</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-text-dark">
                  ✅ {report.tasks_done_today} tâche
                  {report.tasks_done_today > 1 ? 's' : ''} terminée
                  {report.tasks_done_today > 1 ? 's' : ''}
                </p>
                {report.tasks_done.length > 0 && (
                  <ul className="space-y-1">
                    {report.tasks_done.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-start gap-2 text-sm text-text-soft"
                      >
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{task.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-text-dark">
                  ⏳ {report.tasks_pending_today} tâche
                  {report.tasks_pending_today > 1 ? 's' : ''} restante
                  {report.tasks_pending_today > 1 ? 's' : ''} aujourd'hui
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-text-dark">Répartition par méthode</p>
                {totalByMethod > 0 ? (
                  <div className="space-y-2">
                    {METHODS.map((method) => {
                      const seconds = report.by_method[method.id] ?? 0;
                      if (seconds <= 0) return null;
                      const pct = Math.round((seconds / totalByMethod) * 100);
                      return (
                        <div key={method.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-soft">{method.label}</span>
                            <span className="text-text-dark font-medium">
                              {formatLongDuration(seconds)} · {pct}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${METHOD_COLORS[method.id]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-text-soft">Aucune session de focus aujourd'hui.</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-text-soft border-t border-gray-100 pt-4">
                <span>
                  {report.sessions_count} session{report.sessions_count > 1 ? 's' : ''}
                </span>
                <span>Plus longue : {formatClock(report.longest_session_seconds)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndOfDayReport;
