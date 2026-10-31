import React, { useState } from 'react';
import { Search, Bell, Menu, Check, Trash2, X, Wifi, WifiOff, BellRing } from 'lucide-react';
import useOffline from '../../hooks/useOffline';
import usePushNotifications from '../../hooks/usePushNotifications';

interface Notification {
  id: string;
  type: 'reminder' | 'insight' | 'achievement' | 'warning';
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
}

interface HeaderProps {
  onLogout?: () => void;
  onMenuClick?: () => void;
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotification?: (id: string) => void;
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
  const { isOnline, pendingActionsCount } = useOffline();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder': return 'bg-blue-50';
      case 'insight': return 'bg-purple-50';
      case 'achievement': return 'bg-green-50';
      case 'warning': return 'bg-red-50';
      default: return 'bg-gray-50';
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
            {!isOnline && pendingActionsCount > 0 && (
              <span className="bg-amber-200 text-amber-800 px-1 rounded">{pendingActionsCount}</span>
            )}
          </div>

          {/* Push Notifications Toggle */}
          {isSupported && (
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
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${getNotificationColor(notif.type)} ${!notif.read ? 'bg-white' : 'opacity-60'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{notif.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-text-dark text-sm">{notif.title}</h4>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-text-soft text-xs mt-0.5">{notif.message}</p>
                              <p className="text-xs text-text-soft mt-2">{formatTimeAgo(notif.timestamp)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notif.read && onMarkAsRead && (
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