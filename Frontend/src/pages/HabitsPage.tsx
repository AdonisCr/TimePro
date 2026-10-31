import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import { Plus, Trash2, Flame, Trophy, Check } from 'lucide-react';

const HabitsPage = () => {
  const { habits, addHabit, removeHabit, toggleCompletion, getTodayProgress, getWeekProgress } = useHabits();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '✨', frequency: 'daily' as const, targetCount: 1, color: '#00B4DB' });

  const todayProgress = getTodayProgress();
  const weekProgress = getWeekProgress();

  const today = new Date().toISOString().split('T')[0];
  const weekDates = getWeekDates();

  const handleAdd = () => {
    if (newHabit.name.trim()) {
      addHabit(newHabit);
      setNewHabit({ name: '', icon: '✨', frequency: 'daily', targetCount: 1, color: '#00B4DB' });
      setIsAdding(false);
    }
  };

  const getWeekDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Mes habitudes</h1>
          <p className="text-text-soft">Construis des routines qui durent</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{todayProgress.completed}/{todayProgress.total}</p>
              <p className="text-sm text-text-soft">Aujourd'hui</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-white/50 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${todayProgress.percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{weekProgress.completed}/{weekProgress.total}</p>
              <p className="text-sm text-text-soft">Cette semaine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add habit form */}
      {isAdding && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-text-dark mb-3">Nouvelle habitude</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Nom de l'habitude"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className="flex-1 min-w-[200px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Icone"
              value={newHabit.icon}
              onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
              className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <input
              type="color"
              value={newHabit.color}
              onChange={(e) => setNewHabit({ ...newHabit, color: e.target.value })}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={!newHabit.name.trim()}
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

      {/* Habits list */}
      <div className="space-y-3">
        {habits.map(habit => {
          const isCompletedToday = habit.completions.includes(today);
          
          return (
            <div
              key={habit.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                isCompletedToday ? 'border-green-200 bg-green-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Toggle button */}
                  <button
                    onClick={() => toggleCompletion(habit.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompletedToday
                        ? 'bg-green-500 text-white scale-110'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {isCompletedToday ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-2xl">{habit.icon}</span>
                    )}
                  </button>
                  
                  <div>
                    <h3 className={`font-semibold ${isCompletedToday ? 'text-green-700' : 'text-text-dark'}`}>
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-3 h-3" />
                        {habit.currentStreak} jours
                      </span>
                      <span className="text-text-soft">
                        Record: {habit.bestStreak}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Week view */}
                  <div className="hidden sm:flex items-center gap-1">
                    {weekDates.map(date => {
                      const isCompleted = habit.completions.includes(date);
                      const isToday = date === today;
                      return (
                        <button
                          key={date}
                          onClick={() => toggleCompletion(habit.id, date)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isToday
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={`${getWeekDayName(date)} ${date}`}
                        >
                          {getWeekDayName(date).charAt(0)}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-semibold text-text-dark mb-2">Aucune habitude</h3>
          <p className="text-text-soft text-sm">Commence par ajouter une habitude à suivre</p>
        </div>
      )}
    </div>
  );
};

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export default HabitsPage;
