import { useState } from 'react';
import { Calendar, Download, ExternalLink, RefreshCw, Check } from 'lucide-react';
import { PRIORITY_COLORS, type CalendarEvent } from '../../lib/calendar';

interface CalendarIntegrationProps {
  events: CalendarEvent[];
  onSync?: () => void;
}

const PRIORITY_LEGEND: { priority: keyof typeof PRIORITY_COLORS; label: string }[] = [
  { priority: 'high', label: 'Haute' },
  { priority: 'medium', label: 'Moyenne' },
  { priority: 'low', label: 'Basse' },
];

function formatEventDate(event: CalendarEvent): string {
  const date = event.start.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (event.allDay) return `${date} · Journée`;

  const start = event.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const end = event.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${start} – ${end}`;
}

const CalendarIntegration = ({ events, onSync }: CalendarIntegrationProps) => {
  const [isConnected, setIsConnected] = useState({
    google: false,
    outlook: false,
  });
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async (provider: 'google' | 'outlook') => {
    // In real app, this would open OAuth flow
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsConnected(prev => ({ ...prev, [provider]: true }));
    setSyncing(false);
  };

  const handleDisconnect = (provider: 'google' | 'outlook') => {
    setIsConnected(prev => ({ ...prev, [provider]: false }));
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
    onSync?.();
  };

  const generateICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Time Pro//FR',
      'CALSCALE:GREGORIAN',
      ...events.map(event => [
        'BEGIN:VEVENT',
        `DTSTART${event.allDay ? ';VALUE=DATE' : ''}:${formatDateForICS(event.start, event.allDay)}`,
        `DTEND${event.allDay ? ';VALUE=DATE' : ''}:${formatDateForICS(event.end, event.allDay)}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : '',
        `UID:${event.id}@timepro.app`,
        'END:VEVENT',
      ].filter(Boolean).join('\r\n')),
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timepro-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateForICS = (date: Date, allDay: boolean): string => {
    if (allDay) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const now = Date.now();
  const upcomingEvents = events.filter(event => event.end.getTime() >= now);
  const displayedEvents = (upcomingEvents.length > 0 ? upcomingEvents : events).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-dark">Intégration calendrier</h2>
          <p className="text-text-soft text-sm">Synchronise tes tâches avec ton calendrier</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || (!isConnected.google && !isConnected.outlook)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Synchroniser
        </button>
      </div>

      {/* Calendar providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Calendar */}
        <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
          isConnected.google ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-dark">Google Calendar</h3>
                <p className="text-sm text-text-soft">Synchronise avec Google</p>
              </div>
            </div>
            {isConnected.google && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                Connecté
              </span>
            )}
          </div>
          
          <div className="mt-4">
            {isConnected.google ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Tâches synchronisées</p>
                <p className="text-sm text-green-600">✓ Événements importés</p>
                <button
                  onClick={() => handleDisconnect('google')}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('google')}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-text-dark hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Connecter Google Calendar
              </button>
            )}
          </div>
        </div>

        {/* Outlook Calendar */}
        <div className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
          isConnected.outlook ? 'border-green-200 bg-green-50' : 'border-gray-100 hover:border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-2xl">📆</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-dark">Outlook Calendar</h3>
                <p className="text-sm text-text-soft">Synchronise avec Microsoft</p>
              </div>
            </div>
            {isConnected.outlook && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                Connecté
              </span>
            )}
          </div>
          
          <div className="mt-4">
            {isConnected.outlook ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Tâches synchronisées</p>
                <p className="text-sm text-green-600">✓ Événements importés</p>
                <button
                  onClick={() => handleDisconnect('outlook')}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect('outlook')}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium text-text-dark hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Connecter Outlook Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export options */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Exporter le calendrier</h3>
        <p className="text-sm text-text-soft mb-4">
          Exporte ton planning au format ICS pour l'importer dans n'importe quel calendrier.
        </p>
        <button
          onClick={generateICS}
          disabled={events.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-dark rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger .ICS
        </button>
      </div>

      {/* Upcoming events */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-1">Prochains événements</h3>
        <p className="text-xs text-text-soft mb-4">
          Générés à partir de tes tâches ayant une date d'échéance
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-text-soft">
          {PRIORITY_LEGEND.map(({ priority, label }) => (
            <span key={priority} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PRIORITY_COLORS[priority] }}
              />
              Priorité {label.toLowerCase()}
            </span>
          ))}
        </div>

        {displayedEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="mt-3 text-sm text-text-soft">
              Aucune tâche avec échéance. Ajoute une date butoir à tes tâches pour les voir ici.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedEvents.map(event => (
              <div key={event.id} className="flex items-stretch gap-3 p-3 bg-gray-50 rounded-lg">
                <span
                  className="w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: event.color }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-text-dark ${
                      event.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {event.title}
                  </p>
                  <p className={`text-sm text-text-soft ${event.completed ? 'opacity-60' : ''}`}>
                    {formatEventDate(event)}
                  </p>
                </div>
                {event.completed && (
                  <span className="flex items-center gap-1 self-center text-xs text-green-600">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarIntegration;
