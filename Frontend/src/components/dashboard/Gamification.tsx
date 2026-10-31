import { getUnlockedBadges, getNextBadges, type UserStats } from '../../lib/gamification';
import { Trophy, Target, Flame, Clock } from 'lucide-react';

interface GamificationProps {
  stats: UserStats;
}

const Gamification = ({ stats }: GamificationProps) => {
  const unlockedBadges = getUnlockedBadges(stats);
  const nextBadges = getNextBadges(stats);

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{stats.tasksCompleted}</p>
              <p className="text-xs text-text-soft">Tâches complétées</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{stats.pomodorosCompleted}</p>
              <p className="text-xs text-text-soft">Pomodoros</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{stats.streakDays}</p>
              <p className="text-xs text-text-soft">Jours consécutifs</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-dark">{Math.floor(stats.totalFocusMinutes / 60)}h</p>
              <p className="text-xs text-text-soft">Temps total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next badges to unlock */}
      {nextBadges.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Prochains badges
          </h3>
          <div className="space-y-4">
            {nextBadges.map(({ badge, progress, needed }) => (
              <div key={badge.id} className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl opacity-50"
                  style={{ backgroundColor: `${badge.color}20` }}
                >
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-dark">{badge.name}</h4>
                    <span className="text-sm text-text-soft">{progress}/{needed}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((progress / needed) * 100, 100)}%`,
                        backgroundColor: badge.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-text-soft mt-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked badges */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">
          Badges débloqués ({unlockedBadges.length})
        </h3>
        
        {unlockedBadges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-text-soft">Complète des tâches pour débloquer des badges !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {unlockedBadges.map(badge => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-2"
                  style={{ backgroundColor: `${badge.color}20` }}
                >
                  {badge.icon}
                </div>
                <h4 className="font-medium text-text-dark text-sm text-center">{badge.name}</h4>
                <p className="text-xs text-text-soft text-center">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;
