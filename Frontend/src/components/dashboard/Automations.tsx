import { useState, useEffect } from 'react';
import { Plus, Zap, ToggleLeft, ToggleRight, Trash2, Loader2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

interface AutomationRule {
  id: number;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  action_type: string;
  action_config: Record<string, unknown> | null;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  task_status_changed: 'Statut de tâche changé',
  budget_exceeded: 'Budget dépassé',
  task_overdue: 'Tâche en retard',
  time_entry_added: 'Entrée de temps ajoutée',
  task_created: 'Tâche créée',
};

const ACTION_LABELS: Record<string, string> = {
  send_notification: 'Envoyer une notification',
  update_task_status: 'Mettre à jour le statut',
};

const TRIGGER_ICONS: Record<string, typeof AlertTriangle> = {
  task_status_changed: ArrowRight,
  budget_exceeded: AlertTriangle,
  task_overdue: Clock,
  time_entry_added: Clock,
  task_created: Plus,
};

const Automations: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'task_status_changed',
    trigger_config: '{}',
    action_type: 'send_notification',
    action_config: '{}',
  });

  const fetchRules = () => {
    api.get('/automation-rules')
      .then(res => setRules(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleToggle = (rule: AutomationRule) => {
    api.patch(`/automation-rules/${rule.id}/toggle`)
      .then(res => {
        setRules(prev => prev.map(r => r.id === rule.id ? res.data : r));
      })
      .catch(() => {});
  };

  const handleDelete = (rule: AutomationRule) => {
    api.delete(`/automation-rules/${rule.id}`)
      .then(() => setRules(prev => prev.filter(r => r.id !== rule.id)))
      .catch(() => {});
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description || null,
      trigger_type: formData.trigger_type,
      trigger_config: JSON.parse(formData.trigger_config || '{}'),
      action_type: formData.action_type,
      action_config: JSON.parse(formData.action_config || '{}'),
    };
    api.post('/automation-rules', payload)
      .then(res => {
        setRules(prev => [res.data, ...prev]);
        setShowModal(false);
        setFormData({ name: '', description: '', trigger_type: 'task_status_changed', trigger_config: '{}', action_type: 'send_notification', action_config: '{}' });
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Automatisations</h1>
          <p className="text-text-soft mt-1">Règles d'automatisation pour vos projets et tâches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle règle</span>
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Aucune règle d'automatisation</h3>
          <p className="text-text-soft mb-6">Créez votre première règle pour automatiser vos workflows</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Créer une règle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => {
            const TriggerIcon = TRIGGER_ICONS[rule.trigger_type] || Zap;
            return (
              <div key={rule.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-colors ${rule.is_active ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${rule.is_active ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <TriggerIcon className={`w-5 h-5 ${rule.is_active ? 'text-primary' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${rule.is_active ? 'text-text-dark' : 'text-gray-400'}`}>{rule.name}</h3>
                      {rule.description && (
                        <p className="text-sm text-text-soft mt-0.5">{rule.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-text-soft" />
                        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          {ACTION_LABELS[rule.action_type] || rule.action_type}
                        </span>
                      </div>
                      {rule.last_triggered_at && (
                        <p className="text-xs text-text-soft mt-2">
                          Dernière exécution : {new Date(rule.last_triggered_at).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(rule)}
                      className={`p-2 rounded-lg transition-colors ${rule.is_active ? 'text-primary hover:bg-primary/10' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={rule.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {rule.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-dark">Nouvelle règle</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-text-soft text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alerte dépassement budget"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Quand doit-elle se déclencher ?"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Déclencheur</label>
                <select
                  value={formData.trigger_type}
                  onChange={e => setFormData({ ...formData, trigger_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Action</label>
                <select
                  value={formData.action_type}
                  onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {Object.entries(ACTION_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-text-soft font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
                >
                  Créer la règle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automations;
