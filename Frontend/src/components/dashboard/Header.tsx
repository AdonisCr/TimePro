import React, { useState } from 'react';
import { Search, Bell, Menu, Check, Trash2, X, Wifi, WifiOff, BellRing, AlertTriangle } from 'lucide-react';
import useOffline from '../../hooks/useOffline';
import usePushNotifications, { isPushConfigured } from '../../hooks/usePushNotifications';
import type { AppNotification } from '../../hooks/useNotifications';

interface HeaderProps {
  onLogout?: () => void;
  onMenuClick?: () => void;
  notifications?: AppNotification[];
  unreadCount?: number;
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onClearNotification?: (id: number) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  notifications = [], 
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { isOnline, pendingActionsCount, failedActionsCount, failures, clearFailures } = useOffline();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_due': return 'bg-amber-50';
      case 'team_invitation': return 'bg-blue-50';
      case 'team_member_joined': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_due': return '⏰';
      case 'team_invitation': return '📨';
      case 'team_member_joined': return '👥';
      case 'task_done': return '✅';
      default: return '🔔';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-text-soft hover:text-text-dark"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher tâches, projets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Offline Status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            {pendingActionsCount > 0 && (
              <span className="bg-amber-200 text-amber-800 px-1 rounded">{pendingActionsCount}</span>
            )}
          </div>

          {/* Échecs définitifs de synchronisation */}
          {failedActionsCount > 0 && (
            <button
              type="button"
              onClick={() => {
                const details = failures.map((failure) => `• ${failure.message}`).join('\n');
                if (window.confirm(`Ces actions n'ont pas pu être synchronisées :\n\n${details}\n\nEffacer ces messages ?`)) {
                  clearFailures();
                }
              }}
              title="Actions hors ligne non synchronisées"
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
            >
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden sm:inline">Échec sync</span>
              <span className="bg-red-200 text-red-800 px-1 rounded">{failedActionsCount}</span>
            </button>
          )}

          {/* Push Notifications Toggle : uniquement si les clés VAPID sont configurées
              et en production (le service worker n'est pas actif en développement). */}
          {isSupported && isPushConfigured && import.meta.env.PROD && (
            <button
              onClick={() => isSubscribed ? unsubscribe() : subscribe()}
              className={`p-2 rounded-lg transition-colors ${
                isSubscribed 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text-soft hover:text-text-dark hover:bg-gray-100'
              }`}
              title={isSubscribed ? 'Notifications activées' : 'Activer les notifications'}
            >
              {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </button>
          )}
          
          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-text-soft hover:text-text-dark transition-colors"
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-text-dark">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && onMarkAllAsRead && (
                        <button 
                          onClick={onMarkAllAsRead}
                          className="text-xs text-primary hover:text-primary-hover"
                        >
                          Tout marquer lu
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-text-soft text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${getNotificationColor(notif.type)} ${!notif.is_read ? 'bg-white' : 'opacity-60'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-text-dark text-sm">{notif.title}</h4>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-text-soft text-xs mt-0.5">{notif.message}</p>
                              <p className="text-xs text-text-soft mt-2">{formatTimeAgo(notif.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notif.is_read && onMarkAsRead && (
                                <button 
                                  onClick={() => onMarkAsRead(notif.id)}
                                  className="p-1 text-gray-400 hover:text-green-500 rounded"
                                  title="Marquer comme lu"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              {onClearNotification && (
                                <button 
                                  onClick={() => onClearNotification(notif.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-dark">{currentDate}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;