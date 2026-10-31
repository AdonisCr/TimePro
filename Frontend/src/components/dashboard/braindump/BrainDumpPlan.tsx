import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../../lib/productivity';
import type { Plan } from '../../../lib/braindump';

interface BrainDumpPlanProps {
  plan: Plan;
}

const formatPlanDate = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  const parsed = new Date(year, month - 1, day);
  const label = parsed.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const BrainDumpPlan = ({ plan }: BrainDumpPlanProps) => {
  const navigate = useNavigate();
  const totalMinutes = plan.blocks.reduce((sum, block) => sum + block.minutes, 0);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-dark">
          Ton planning du jour
        </h1>
        <p className="text-lg text-text-soft">
          {formatPlanDate(plan.date)} • {plan.blocks.length} bloc
          {plan.blocks.length > 1 ? 's' : ''} • {formatTime(totalMinutes)} de travail
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-semibold text-text-dark flex items-center gap-2">
          <span className="text-xl">📅</span> Planning suggéré
        </h2>

        {plan.blocks.length === 0 ? (
          <p className="text-sm text-text-soft">
            Aucun bloc planifié pour aujourd'hui. Ajoute des tâches pour voir ton planning se
            remplir.
          </p>
        ) : (
          <ul className="space-y-3">
            {plan.blocks.map((block, index) => (
              <li
                key={`${block.task_id}-${index}`}
                className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-sm font-mono text-text-soft min-w-[110px]">
                  {block.start} → {block.end}
                </span>
                <span className="flex-1 font-medium text-text-dark">{block.title}</span>
                <span className="text-xs text-text-soft">{formatTime(block.minutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
        <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span> Conseils du coach
        </h3>
        <ul className="space-y-2 text-sm text-text-soft">
          <li>• Commence par le premier bloc — c'est ta "grenouille" (Eat That Frog)</li>
          <li>• Utilise la technique Pomodoro : 25min de travail, 5min de pause</li>
          <li>• Les pauses de 15 min sont déjà intégrées entre les blocs</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/focus')}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          C'est parti ! 🚀
        </button>
        <button
          onClick={() => navigate('/planning')}
          className="px-6 py-3 border-2 border-gray-200 text-text-dark font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Voir mon planning complet
        </button>
      </div>
    </div>
  );
};

export default BrainDumpPlan;
