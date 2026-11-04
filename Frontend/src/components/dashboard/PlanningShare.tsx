import { useState } from 'react';
import { Link as LinkIcon, Copy, Check, Calendar, Lock, Globe, Users, Clock, TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import { usePreferences, type UserPreferences } from '../../hooks/usePreferences';

type SharingKey = 'public_planning' | 'public_stats' | 'public_projects';

const OPTIONS: { key: SharingKey; icon: typeof Calendar; label: string; description: string }[] = [
  {
    key: 'public_projects',
    icon: Calendar,
    label: 'Projets',
    description: 'Liste des projets et leur avancement.',
  },
  {
    key: 'public_stats',
    icon: TrendingUp,
    label: 'Statistiques',
    description: 'Tâches terminées et temps total travaillé.',
  },
];

const PlanningShare = () => {
  const { preferences, loading, error: loadError, savePreferences } = usePreferences();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState<SharingKey | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isEnabled = (key: SharingKey) => Boolean(preferences?.[key]);
  const planningEnabled = isEnabled('public_planning');
  const shareUrl = preferences?.user_id
    ? `${window.location.origin}/shared/planning/${preferences.user_id}`
    : '';

  const toggle = async (key: SharingKey) => {
    setSaving(key);
    setError('');
    setSuccess('');

    try {
      await savePreferences({ [key]: !isEnabled(key) } as Partial<UserPreferences>);
      setSuccess(
        isEnabled(key)
          ? 'Partage désactivé : la page publique est bloquée.'
          : 'Partage activé : le lien est prêt à être partagé.'
      );
    } catch {
      setError('Impossible d\'enregistrer ce réglage. Vérifie ta connexion puis réessaie.');
    } finally {
      setSaving(null);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Impossible de copier le lien. Tu peux le sélectionner à la main.');
    }
  };

  if (loading && !preferences) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-dark">Partager mon planning</h2>
        <p className="text-text-soft text-sm mt-1">
          Génère un lien public pour partager ton planning du jour et, si tu le souhaites,
          tes statistiques et tes projets.
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

      {/* Activation et lien */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-dark">Lien de partage</h3>
              <p className="text-sm text-text-soft">
                {planningEnabled
                  ? 'Toute personne avec ce lien peut voir ton planning du jour.'
                  : 'Le partage est désactivé. Active-le pour obtenir un lien.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={planningEnabled}
            aria-label="Activer le partage du planning"
            disabled={saving !== null}
            onClick={() => toggle('public_planning')}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
              planningEnabled ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                planningEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {planningEnabled && shareUrl ? (
          <>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                onFocus={event => event.currentTarget.select()}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-text-soft"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir
              </a>
            </div>
            <p className="text-xs text-text-soft mt-2">
              Le lien reste actif tant que le partage est activé. Il n'est protégé par aucun
              mot de passe.
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg text-sm text-text-soft">
            <Lock className="w-4 h-4" />
            Aucun lien n'est généré tant que le partage est désactivé.
          </div>
        )}
      </div>

      {/* Contenu partagé */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Contenu visible</h3>

        <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-50">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-text-soft mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-dark">Planning du jour</p>
              <p className="text-xs text-text-soft">
                Tâches en cours et blocs de temps de la journée. Toujours inclus avec le lien.
              </p>
            </div>
          </div>
          <span className="text-xs text-text-soft bg-gray-100 px-2 py-1 rounded-full shrink-0">
            Inclus
          </span>
        </div>

        {OPTIONS.map(option => (
          <div key={option.key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-start gap-3">
              <option.icon className="w-4 h-4 text-text-soft mt-0.5" />
              <div>
                <p className="text-sm font-medium text-text-dark">{option.label}</p>
                <p className="text-xs text-text-soft">{option.description}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled(option.key)}
              aria-label={option.label}
              disabled={saving !== null || !planningEnabled}
              onClick={() => toggle(option.key)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                isEnabled(option.key) ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isEnabled(option.key) ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Aperçu */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Ce que verront les visiteurs</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-text-soft" />
            <span className="text-sm text-text-soft">Page publique Time Pro</span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-dark">Planning du jour</p>
                <p className="text-sm text-text-soft">Tâches et temps travaillé</p>
              </div>
            </div>
            {isEnabled('public_projects') && (
              <div className="flex items-center gap-2 text-sm text-text-soft">
                <Calendar className="w-4 h-4" />
                <span>Projets et avancement</span>
              </div>
            )}
            {isEnabled('public_stats') && (
              <div className="flex items-center gap-2 text-sm text-text-soft">
                <TrendingUp className="w-4 h-4" />
                <span>Statistiques globales</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Sécurité</h4>
            <p className="text-sm text-blue-700">
              Le lien contient uniquement ton identifiant, jamais tes identifiants de
              connexion. Désactiver le partage bloque immédiatement l'accès.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningShare;
