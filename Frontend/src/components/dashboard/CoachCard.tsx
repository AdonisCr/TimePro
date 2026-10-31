import { useNavigate } from 'react-router-dom';
import type { ProductivityInsight } from '../../lib/productivity';

interface CoachCardProps {
  insights: ProductivityInsight[];
}

const CoachCard = ({ insights }: CoachCardProps) => {
  const navigate = useNavigate();

  if (insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">✨</span>
          </div>
          <div>
            <h3 className="font-semibold text-text-dark mb-1">Tu es sur la bonne voie !</h3>
            <p className="text-text-soft text-sm">
              Pas de tâche urgente en ce moment. Profite pour avancer sur tes projets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h3 className="font-semibold text-text-dark">Ton coach te dit</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
              insight.type === 'warning'
                ? 'bg-red-50 border border-red-100'
                : insight.type === 'frog'
                ? 'bg-orange-50 border border-orange-100'
                : insight.type === 'focus'
                ? 'bg-blue-50 border border-blue-100'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <span className="text-xl flex-shrink-0">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-dark text-sm">{insight.title}</h4>
              <p className="text-text-soft text-sm">{insight.message}</p>
            </div>
            {insight.taskId && (
              <button
                onClick={() => navigate('/focus', { state: { taskId: insight.taskId } })}
                className="text-xs text-primary hover:text-primary-hover font-medium whitespace-nowrap"
              >
                Commencer →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachCard;
