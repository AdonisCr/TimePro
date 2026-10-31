import { useState } from 'react';
import { Link, Copy, Check, Calendar, Lock, Globe, Users, Clock, TrendingUp } from 'lucide-react';

interface PlanningShareProps {
  planningUrl?: string;
  onGenerateLink?: () => Promise<string>;
}

const PlanningShare = ({ planningUrl, onGenerateLink }: PlanningShareProps) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    includeProjects: true,
    includeTimeBlocks: true,
    includeProgress: true,
    expiry: '7d' as '1d' | '7d' | '30d' | 'never',
  });

  const handleGenerateLink = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const url = onGenerateLink ? await onGenerateLink() : `https://timepro.app/shared/planning/${Math.random().toString(36).slice(2, 10)}`;
    setGenerating(false);
    void url; // In real app, this would be stored
  };

  const handleCopyLink = () => {
    if (planningUrl) {
      navigator.clipboard.writeText(planningUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expiryOptions = [
    { value: '1d', label: '1 jour' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: 'never', label: 'Jamais' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-text-dark">Partager mon planning</h2>
        <p className="text-text-soft text-sm">Génère un lien public pour partager ton planning</p>
      </div>

      {/* Share link */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-dark">Lien de partage</h3>
            <p className="text-sm text-text-soft">Personnes avec ce lien peuvent voir ton planning</p>
          </div>
        </div>

        {planningUrl ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={planningUrl}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-text-soft"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateLink}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            <Link className="w-4 h-4" />
            {generating ? 'Génération...' : 'Générer un lien de partage'}
          </button>
        )}
      </div>

      {/* Share settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Paramètres de partage</h3>
        
        <div className="space-y-4">
          {/* What to include */}
          <div>
            <label className="text-sm font-medium text-text-dark mb-2 block">Inclure</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={shareSettings.includeProjects}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, includeProjects: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-soft" />
                  <span className="text-sm text-text-dark">Projets</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={shareSettings.includeTimeBlocks}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, includeTimeBlocks: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-soft" />
                  <span className="text-sm text-text-dark">Blocs de temps</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={shareSettings.includeProgress}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, includeProgress: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded"
                />
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-text-soft" />
                  <span className="text-sm text-text-dark">Progression</span>
                </div>
              </label>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-sm font-medium text-text-dark mb-2 block">Durée du lien</label>
            <select
              value={shareSettings.expiry}
              onChange={(e) => setShareSettings(prev => ({ ...prev, expiry: e.target.value as typeof prev.expiry }))}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              {expiryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Security info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Sécurité</h4>
            <p className="text-sm text-blue-600">
              Le lien ne contient aucune donnée personnelle. Seules les informations que tu choisis seront visibles.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-text-dark mb-4">Aperçu</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-text-soft" />
            <span className="text-sm text-text-soft">Lien public</span>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-dark">Planning Time Pro</p>
                <p className="text-sm text-text-soft">Partagé publiquement</p>
              </div>
            </div>
            {shareSettings.includeProjects && (
              <div className="mb-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">3 projets</span>
              </div>
            )}
            {shareSettings.includeTimeBlocks && (
              <div className="flex items-center gap-2 text-sm text-text-soft">
                <Clock className="w-4 h-4" />
                <span>6 blocs de temps prévus</span>
              </div>
            )}
            {shareSettings.includeProgress && (
              <div className="flex items-center gap-2 text-sm text-text-soft mt-2">
                <TrendingUp className="w-4 h-4" />
                <span>75% complété aujourd'hui</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningShare;
