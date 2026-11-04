import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Inbox,
  Plus,
  User,
  LogOut,
  X,
  BarChart3,
  Users,
  Zap,
  Timer,
  Brain,
  Repeat,
  Target,
  Calendar,
  CalendarDays,
  Trophy,
  Share2,
  Download,
} from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
}

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onAddTask: () => void;
  onBrainDump?: () => void;
  user?: UserData | null;
  onLogout: () => void;
  onClose?: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  id: string;
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onAddTask, onBrainDump, user, onLogout, onClose }) => {
  const groups: MenuGroup[] = [
    {
      items: [
        { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dashboard' },
      ],
    },
    {
      label: 'Suivi',
      items: [
        { icon: Timer, label: 'Suivi du temps', id: 'tracking' },
        { icon: Repeat, label: 'Habitudes', id: 'habits' },
        { icon: Target, label: 'Planning', id: 'planning' },
        { icon: Calendar, label: 'Rapport', id: 'weekly-report' },
        { icon: Trophy, label: 'Objectifs', id: 'monthly-goals' },
        { icon: CalendarDays, label: 'Calendrier', id: 'calendar' },
      ],
    },
    {
      label: 'Projets',
      items: [
        { icon: FolderOpen, label: 'Projets', id: 'projects' },
        { icon: BarChart3, label: 'Gantt', id: 'gantt' },
        { icon: Users, label: 'Charge de travail', id: 'workload' },
      ],
    },
    {
      label: 'Équipe',
      items: [
        { icon: Users, label: 'Membres', id: 'team' },
        { icon: Zap, label: 'Automatisations', id: 'automations' },
      ],
    },
    {
      label: 'Espace',
      items: [
        { icon: Inbox, label: 'Boîte de réception', id: 'inbox' },
        { icon: Share2, label: 'Partager le planning', id: 'share-planning' },
        { icon: Download, label: 'Exporter', id: 'export' },
        { icon: Settings, label: 'Paramètres', id: 'settings' },
      ],
    },
  ];

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {onClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={onClose} className="p-2 text-text-soft hover:text-text-dark">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            {user?.profile_photo_url ? (
              <img src={user.profile_photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-dark truncate text-sm">{userName}</h3>
            <p className="text-xs text-text-soft truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-text-soft hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Brain Dump CTA */}
      {onBrainDump && (
        <div className="p-3">
          <button
            onClick={onBrainDump}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <Brain className="w-4 h-4" />
            <span>Vider mon esprit</span>
          </button>
        </div>
      )}

      <nav className="flex-1 p-3 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-4 last:mb-0">
            {group.label && (
              <p className="px-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.12em]">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-soft hover:bg-gray-50 hover:text-text-dark'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                    <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={onAddTask}
          className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle tâche</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
