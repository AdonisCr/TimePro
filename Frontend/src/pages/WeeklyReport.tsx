import { useMemo } from 'react';
import { BarChart3, Clock, CheckCircle, Target, TrendingUp, TrendingDown } from 'lucide-react';
import {
  buildWeeklyReport,
  formatSecondsAsHours,
  type WeeklyTask,
  type WeeklyTimeEntry,
} from '../lib/weeklyReport';

interface WeeklyReportProps {
  tasks: WeeklyTask[];
  timeEntries: WeeklyTimeEntry[];
}

const WeeklyReport = ({ tasks, timeEntries }: WeeklyReportProps) => {
  const report = useMemo(() => buildWeeklyReport(tasks, timeEntries), [tasks, timeEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Rapport hebdomadaire</h1>
        <p className="text-text-soft">Résumé de tes 7 derniers jours</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{report.completedCount}</p>
              <p className="text-xs text-text-soft">Tâches complétées</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{formatSecondsAsHours(report.totalTimeSeconds)}</p>
              <p className="text-xs text-text-soft">Temps total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{report.completionRate}%</p>
              <p className="text-xs text-text-soft">Taux de complétion</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{formatSecondsAsHours(report.avgTimePerTaskSeconds)}</p>
              <p className="text-xs text-text-soft">Moy./tâche</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily breakdown chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Activité par jour</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {report.dailyBreakdown.map((day) => {
            const maxTasks = Math.max(...report.dailyBreakdown.map(d => d.tasks), 1);
            const height = (day.tasks / maxTasks) * 100;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-32">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.tasks} tâche(s) · ${formatSecondsAsHours(day.timeSeconds)}`}
                  />
                </div>
                <span className="text-xs text-text-soft">{day.day}</span>
                <span className="text-xs font-medium text-text-dark">{day.tasks}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Répartition par priorité</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red-600 w-16">Haute</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full"
                style={{ width: `${report.priorityDistribution.high > 0 ? (report.priorityDistribution.high / report.completedCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-dark w-8">{report.priorityDistribution.high}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-yellow-600 w-16">Moyenne</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4">
              <div
                className="bg-yellow-500 h-4 rounded-full"
                style={{ width: `${report.priorityDistribution.medium > 0 ? (report.priorityDistribution.medium / report.completedCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-dark w-8">{report.priorityDistribution.medium}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-green-600 w-16">Basse</span>
            <div className="flex-1 bg-gray-100 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${report.priorityDistribution.low > 0 ? (report.priorityDistribution.low / report.completedCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-dark w-8">{report.priorityDistribution.low}</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span> Insights
        </h3>
        <div className="space-y-2 text-sm text-text-soft">
          {report.completionRate >= 80 && (
            <p className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Excellent taux de complétion cette semaine !
            </p>
          )}
          {report.completionRate < 50 && (
            <p className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Tu as complété moins de la moitié de tes tâches. Veux-tu réorganiser ?
            </p>
          )}
          {report.totalTimeSeconds > 40 * 3600 && (
            <p>⚠️ Tu as travaillé plus de 40h cette semaine. N'oublie pas de te reposer.</p>
          )}
          {report.avgTimePerTaskSeconds > 2 * 3600 && (
            <p>💡 Tes tâches prennent en moyenne plus de 2h. Peut-être les diviser ?</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
