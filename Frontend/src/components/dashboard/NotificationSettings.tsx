import { useState } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { usePreferences } from '../../hooks/usePreferences';

const NotificationSettings = () => {
  const { preferences, loading, error: loadError, savePreferences } = usePreferences();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const remindersEnabled = preferences?.receive_reminders !== false;

  const toggleReminders = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await savePreferences({ receive_reminders: !remindersEnabled });
      setSuccess('Préférence enregistrée.');
    } catch {
      setError('Impossible d\'enregistrer ce réglage. Vérifie ta connexion puis réessaie.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !preferences) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-dark">Notifications</h3>
        <p className="text-text-soft text-sm mt-1">
          Les notifications dans l'application sont toujours actives. Tu peux choisir de
          recevoir ou non les rappels d'échéance.
        </p>
      </div>

      {(loadError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {loadError || error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <p className="font-medium text-text-dark text-sm">Rappels de tâches</p>
          <p className="text-xs text-text-soft">
            Une notification par jour pour les tâches qui arrivent à échéance dans les
            24 heures.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={remindersEnabled}
          aria-label="Rappels de tâches"
          disabled={saving}
          onClick={toggleReminders}
          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
            remindersEnabled ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              remindersEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <Bell className="w-5 h-5 text-text-soft mt-0.5" />
        <p className="text-sm text-text-soft">
          Les notifications push (sur ton téléphone ou ton ordinateur) s'activent depuis la
          cloche en haut à droite, lorsque l'application est installée en production.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <BellRing className="w-5 h-5 text-text-soft mt-0.5" />
        <p className="text-sm text-text-soft">
          Les notifications d'invitation à une équipe et d'arrivée d'un nouveau membre sont
          créées automatiquement.
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;
