import { useState } from 'react';
import { Target, Plus, Trash2, Check, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

const MonthlyGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Tâches complétées', target: 50, current: 32, unit: 'tâches', color: '#10B981' },
    { id: '2', title: 'Heures de focus', target: 40, current: 28, unit: 'heures', color: '#3B82F6' },
    { id: '3', title: 'Pomodoros', target: 100, current: 67, unit: 'sessions', color: '#EF4444' },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: 10, unit: 'tâches', color: '#00B4DB' });

  const handleAdd = () => {
    if (newGoal.title.trim()) {
      setGoals([...goals, { ...newGoal, id: Date.now().toString(), current: 0 }]);
      setNewGoal({ title: '', target: 10, unit: 'tâches', color: '#00B4DB' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleIncrement = (id: string) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, current: Math.min(g.current + 1, g.target) } : g
    ));
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + (g.current / g.target), 0) / goals.length * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Objectifs du mois</h1>
          <p className="text-text-soft">Suivi de tes objectifs mensuels</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Overall progress */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text-dark">Progression globale</h3>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <div className="w-full bg-white/50 rounded-full h-4">
          <div
            className="bg-primary h-4 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Add goal form */}
      {isAdding && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-text-dark mb-3">Nouvel objectif</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Nom de l'objectif"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="number"
              placeholder="Objectif"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <select
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="tâches">Tâches</option>
              <option value="heures">Heures</option>
              <option value="sessions">Sessions</option>
            </select>
            <input
              type="color"
              value={newGoal.color}
              onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={!newGoal.title.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-gray-200 text-text-dark rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map(goal => {
          const progress = Math.round((goal.current / goal.target) * 100);
          const isCompleted = goal.current >= goal.target;
          
          return (
            <div
              key={goal.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" style={{ color: goal.color }} />
                    ) : (
                      <Target className="w-5 h-5" style={{ color: goal.color }} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-text-dark'}`}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-text-soft">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => handleIncrement(goal.id)}
                      className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      +1
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: isCompleted ? '#10B981' : goal.color,
                  }}
                />
              </div>
              
              {isCompleted && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Objectif atteint !
                </p>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-semibold text-text-dark mb-2">Aucun objectif</h3>
          <p className="text-text-soft text-sm">Définis des objectifs pour suivre ta progression</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyGoals;
