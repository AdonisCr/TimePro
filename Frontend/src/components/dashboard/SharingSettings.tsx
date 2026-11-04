import { useState } from 'react';
import { Check, Copy, ExternalLink, Globe, Loader2, Lock, Share2 } from 'lucide-react';
import { usePreferences, type UserPreferences } from '../../hooks/usePreferences';

type SharingKey = 'public_planning' | 'public_stats' | 'public_projects';

const SETTINGS: { key: SharingKey; label: string; description: string }[] = [
  {
    key: 'public_planning',
    label: 'Planning du jour',
    description: 'Les tâches et les blocs de temps de la journée sont visibles.',
  },
  {
    key: 'public_stats',
    label: 'Statistiques',
    description: 'Le nombre de tâches terminées et le temps total travaillé sont visibles.',
  },
  {
    key: 'public_projects',
    label: 'Projets',
    description: 'La liste des projets et leur avancement sont visibles.',
  },
];

const SharingSettings = () => {
  const { preferences, loading, error: loadError, savePreferences } = usePreferences();
  const [saving, setSaving] = useState<SharingKey | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const isEnabled = (key: SharingKey) => Boolean(preferences?.[key]);
  const planningEnabled = isEnabled('public_planning');
  const shareLink = preferences?.user_id
    ? `${window.location.origin}/shared/planning/${preferences.user_id}`
    : '';

  const toggle = async (key: SharingKey) => {
    setSaving(key);
    setError('');
    setSuccess('');

    try {
      await savePreferences({ [key]: !isEnabled(key) } as Partial<UserPreferences>);
      setSuccess('Réglage de partage enregistré.');
    } catch {
      setError('Impossible d\'enregistrer ce réglage. Vérifie ta connexion puis réessaie.');
    } finally {
      setSaving(null);
    }
  };

  const copyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Impossible de copier le lien. Tu peux le sélectionner à la main.');
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
        <h3 className="text-lg font-semibold text-text-dark">Partage public</h3>
        <p className="text-text-soft text-sm mt-1">
          Choisis ce qu'une personne possédant le lien peut voir. Le lien reste actif tant que
          le partage est activé.
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

      <div className="space-y-1">
        {SETTINGS.map(setting => (
          <div key={setting.key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-text-dark text-sm">{setting.label}</p>
              <p className="text-xs text-text-soft">{setting.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled(setting.key)}
              aria-label={setting.label}
              disabled={saving !== null}
              onClick={() => toggle(setting.key)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                isEnabled(setting.key) ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isEnabled(setting.key) ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {planningEnabled && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="font-medium text-text-dark text-sm">Ton lien de partage</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              onFocus={event => event.currentTarget.select()}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-text-soft"
            />
            <button
              type="button"
              onClick={copyLink}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                copied ? 'bg-green-100 text-green-700' : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
            <a
              href={shareLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir
            </a>
          </div>
          <p className="text-xs text-text-soft mt-2">
            Les visiteurs ne voient que les éléments activés ci-dessus. Aucun mot de passe ne
            protège ce lien : ne le partage pas publiquement.
          </p>
        </div>
      )}

      {!planningEnabled && (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <Globe className="w-5 h-5 text-text-soft mt-0.5" />
          <p className="text-sm text-text-soft">
            Le lien de partage n'est disponible que si « Planning du jour » est activé.
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
        <p className="text-sm text-blue-700">
          Tu peux désactiver le partage à tout moment : la page publique est alors bloquée
          immédiatement.
        </p>
      </div>
    </div>
  );
};

export default SharingSettings;
