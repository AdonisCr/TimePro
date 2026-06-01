import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Check, Loader2,
  Clock, User, Brain, Target, Users,
  Palette, Sparkles, MessageSquare, Smile,
  ArrowRight, Zap, Sun, Moon, Sunset, Sunrise
} from 'lucide-react';
import api from '../lib/axios';

interface Preferences {
  timezone?: string;
  work_start_time?: string;
  work_end_time?: string;
  peak_productivity_hours?: string;
  task_duration_preference?: string;
  work_style?: string;
  has_recurring_tasks?: boolean;
  goals?: string[];
  daily_time_dedication?: string;
  planning_style?: string;
  receive_reminders?: boolean;
  unplanned_tasks_handling?: string;
  works_in_team?: boolean;
  needs_to_share?: boolean;
  use_labels?: boolean;
  interface_preference?: string;
  dark_mode?: boolean;
  personal_development_goals?: string[];
  personal_dev_time?: string;
  habits_to_develop?: string[];
  productivity_challenges?: string[];
  has_routines?: boolean;
  life_priorities?: string[];
  success_definition?: string;
  main_time_challenge?: string;
  app_expectations?: string;
  has_hobbies_to_plan?: boolean;
  other_tools_used?: string[];
  specific_constraints?: string;
  onboarding_completed?: boolean;
}

const GOALS_OPTIONS = [
  { value: 'finish_project', label: 'Terminer un projet spécifique' },
  { value: 'improve_productivity', label: 'Améliorer ma productivité' },
  { value: 'work_life_balance', label: 'Équilibrer travail et vie personnelle' },
  { value: 'learn_skills', label: 'Apprendre de nouvelles compétences' },
  { value: 'other', label: 'Autre' },
];

const PRODUCTIVITY_CHALLENGES = [
  { value: 'prioritize', label: 'Prioriser mes tâches' },
  { value: 'concentrate', label: 'Rester concentré' },
  { value: 'procrastination', label: 'Éviter la procrastination' },
  { value: 'stress', label: 'Gérer mon stress' },
  { value: 'work_life_balance', label: 'Équilibrer travail et vie personnelle' },
  { value: 'other', label: 'Autre' },
];

const LIFE_PRIORITIES = [
  { value: 'career', label: 'Carrière / profession' },
  { value: 'family', label: 'Famille / amis' },
  { value: 'health', label: 'Santé / bien-être' },
  { value: 'learning', label: 'Apprentissage' },
  { value: 'hobbies', label: 'Loisirs / passion' },
];

const STEPS = [
  { icon: Sparkles, label: 'Bienvenue' },
  { icon: User, label: 'Vous' },
  { icon: Clock, label: 'Rythme' },
  { icon: Target, label: 'Objectifs' },
  { icon: Brain, label: 'Planning' },
  { icon: Users, label: 'Équipe' },
  { icon: Palette, label: 'Préférences' },
  { icon: Zap, label: 'Développement' },
  { icon: MessageSquare, label: 'Feedback' },
  { icon: Smile, label: 'Final' },
];

const radioCard = (
  value: string,
  label: string,
  name: string,
  checked: boolean,
  onChange: (val: string) => void
) => (
  <label
    key={value}
    className={`flex-1 flex items-center justify-center gap-2.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
      checked
        ? 'border-[#00B4DB] bg-[#00B4DB]/10 shadow-[0_0_20px_rgba(0,180,219,0.15)]'
        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="sr-only"
    />
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
      checked ? 'border-[#00B4DB]' : 'border-white/30'
    }`}>
      {checked && <div className="w-2 h-2 rounded-full bg-[#00B4DB]" />}
    </div>
    <span className={`text-sm font-medium transition-colors ${checked ? 'text-white' : 'text-white/60'}`}>
      {label}
    </span>
  </label>
);

const checkCard = (
  value: string,
  label: string,
  checked: boolean,
  onChange: () => void
) => (
  <label
    key={value}
    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
      checked
        ? 'border-[#00B4DB] bg-[#00B4DB]/10 shadow-[0_0_20px_rgba(0,180,219,0.1)]'
        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
    }`}
  >
    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-[#00B4DB] border-[#00B4DB]' : 'border-white/30'
    }`}>
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </div>
    <span className={`text-sm transition-colors ${checked ? 'text-white' : 'text-white/70'}`}>
      {label}
    </span>
  </label>
);

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.get('/preferences').then(res => {
      if (res.data?.onboarding_completed) {
        navigate('/dashboard', { replace: true });
      }
    }).catch(() => {}).finally(() => setChecking(false));
  }, [navigate]);

  const [preferences, setPreferences] = useState<Preferences>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris',
    planning_style: 'flexible',
    receive_reminders: true,
    use_labels: true,
    interface_preference: 'list',
    dark_mode: false,
    has_recurring_tasks: false,
    works_in_team: false,
    needs_to_share: false,
    has_routines: false,
    has_hobbies_to_plan: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayPreference = (key: keyof Preferences, value: string) => {
    const current = (preferences[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updatePreference(key, updated);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put('/preferences', { ...preferences, onboarding_completed: true });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8 animate-[fadeSlideIn_0.4s_ease]">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B4DB] to-[#0088a8] flex items-center justify-center shadow-[0_0_40px_rgba(0,180,219,0.3)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Bienvenue sur <span className="text-[#00B4DB]">Time Pro</span>
              </h2>
              <p className="text-white/50 text-lg max-w-md mx-auto leading-relaxed">
                Avant de commencer, aidons-nous à personnaliser votre expérience.
                Cela ne prend que <span className="text-white font-semibold">5 minutes</span>.
              </p>
            </div>
            <div className="max-w-sm mx-auto space-y-3">
              {[
                'Adapter l\'interface à vos besoins',
                'Proposer des plannings sur mesure',
                'Suggestions de productivité intelligentes',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur">
                  <div className="w-6 h-6 rounded-full bg-[#00B4DB]/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#00B4DB]" />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4f46e5] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Qui êtes-vous ?</h3>
              <p className="text-white/50 text-sm mt-1">Quelques informations pour commencer</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Votre nom</label>
                <input
                  type="text"
                  value={preferences.name || ''}
                  onChange={e => updatePreference('name', e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10 focus:shadow-[0_0_20px_rgba(0,180,219,0.1)]"
                  placeholder="ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Fuseau horaire</label>
                <select
                  value={preferences.timezone}
                  onChange={e => updatePreference('timezone', e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10 appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat' }}
                >
                  <option className="bg-[#16213e]" value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option className="bg-[#16213e]" value="Europe/London">Europe/London (GMT+0)</option>
                  <option className="bg-[#16213e]" value="America/New_York">America/New_York (GMT-5)</option>
                  <option className="bg-[#16213e]" value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                  <option className="bg-[#16213e]" value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  <option className="bg-[#16213e]" value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Votre rythme de travail</h3>
              <p className="text-white/50 text-sm mt-1">Pour adapter l'outil à vos habitudes</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Début de journée</label>
                <input
                  type="time"
                  value={preferences.work_start_time || ''}
                  onChange={e => updatePreference('work_start_time', e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Fin de journée</label>
                <input
                  type="time"
                  value={preferences.work_end_time || ''}
                  onChange={e => updatePreference('work_end_time', e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Heures de productivité max</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'morning', label: 'Matin', icon: Sunrise },
                  { value: 'afternoon', label: 'Après-midi', icon: Sun },
                  { value: 'evening', label: 'Soirée', icon: Sunset },
                  { value: 'night', label: 'Nuit', icon: Moon },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                  <label key={opt.value} className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    preferences.peak_productivity_hours === opt.value
                      ? 'border-[#00B4DB] bg-[#00B4DB]/10 shadow-[0_0_20px_rgba(0,180,219,0.15)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}>
                    <input
                      type="radio"
                      name="peak_productivity_hours"
                      value={opt.value}
                      checked={preferences.peak_productivity_hours === opt.value}
                      onChange={e => updatePreference('peak_productivity_hours', e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`w-6 h-6 ${preferences.peak_productivity_hours === opt.value ? 'text-[#00B4DB]' : 'text-white/50'}`} />
                    <span className={`text-xs font-medium ${preferences.peak_productivity_hours === opt.value ? 'text-white' : 'text-white/60'}`}>
                      {opt.label}
                    </span>
                  </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Style de travail</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'pomodoro', label: 'Blocs de temps', sub: '25 min focus + pause' },
                  { value: 'continuous', label: 'Continu', sub: 'Travail en session longue' },
                ].map(opt => (
                  <label key={opt.value} className={`flex flex-col items-center gap-1 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    preferences.work_style === opt.value
                      ? 'border-[#00B4DB] bg-[#00B4DB]/10 shadow-[0_0_20px_rgba(0,180,219,0.15)]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}>
                    <input
                      type="radio"
                      name="work_style"
                      value={opt.value}
                      checked={preferences.work_style === opt.value}
                      onChange={e => updatePreference('work_style', e.target.value)}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${preferences.work_style === opt.value ? 'text-white' : 'text-white/80'}`}>{opt.label}</span>
                    <span className={`text-xs ${preferences.work_style === opt.value ? 'text-[#00B4DB]/70' : 'text-white/40'}`}>{opt.sub}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Objectifs</h3>
              <p className="text-white/50 text-sm mt-1">Que voulez-vous accomplir ?</p>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">Tâches récurrentes ?</label>
              <div className="flex gap-3">
                {[{ value: true, label: 'Oui' }, { value: false, label: 'Non' }].map(opt =>
                  radioCard(String(opt.value), opt.label, 'has_recurring_tasks', preferences.has_recurring_tasks === opt.value, val => updatePreference('has_recurring_tasks', val === 'true'))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Objectifs principaux</label>
              <div className="grid grid-cols-1 gap-2">
                {GOALS_OPTIONS.map(opt =>
                  checkCard(opt.value, opt.label, (preferences.goals || []).includes(opt.value), () => toggleArrayPreference('goals', opt.value))
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Gestion du planning</h3>
              <p className="text-white/50 text-sm mt-1">Comment organisez-vous vos journées ?</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Style de planning</label>
              <div className="flex gap-3">
                {[{ value: 'strict', label: 'Strict' }, { value: 'flexible', label: 'Flexible' }].map(opt =>
                  radioCard(opt.value, opt.label, 'planning_style', preferences.planning_style === opt.value, val => updatePreference('planning_style', val))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Rappels</label>
              <div className="flex gap-3">
                {[{ value: true, label: 'Oui, souvent' }, { value: false, label: 'Non' }].map(opt =>
                  radioCard(String(opt.value), opt.label, 'receive_reminders', preferences.receive_reminders === opt.value, val => updatePreference('receive_reminders', val === 'true'))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Tâches imprévues</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'immediate', label: 'Ajout immédiat' },
                  { value: 'defer', label: 'Report' },
                  { value: 'ignore', label: 'Ignore' },
                ].map(opt =>
                  radioCard(opt.value, opt.label, 'unplanned_tasks_handling', preferences.unplanned_tasks_handling === opt.value, val => updatePreference('unplanned_tasks_handling', val))
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#DB2777] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(236,72,153,0.25)]">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Collaboration</h3>
              <p className="text-white/50 text-sm mt-1">Travaillez-vous en équipe ?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Travail en équipe</label>
                <div className="flex gap-3">
                  {[{ value: true, label: 'Oui' }, { value: false, label: 'Non' }].map(opt =>
                    radioCard(String(opt.value), opt.label, 'works_in_team', preferences.works_in_team === opt.value, val => updatePreference('works_in_team', val === 'true'))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Partager des tâches</label>
                <div className="flex gap-3">
                  {[{ value: true, label: 'Oui' }, { value: false, label: 'Non' }].map(opt =>
                    radioCard(String(opt.value), opt.label, 'needs_to_share', preferences.needs_to_share === opt.value, val => updatePreference('needs_to_share', val === 'true'))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B4DB] to-[#0088a8] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,180,219,0.25)]">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Personnalisation</h3>
              <p className="text-white/50 text-sm mt-1">Adaptez l'interface à vos goûts</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Mode sombre</label>
                <div className="flex gap-3">
                  {[{ value: true, label: 'Sombre' }, { value: false, label: 'Clair' }].map(opt =>
                    radioCard(String(opt.value), opt.label, 'dark_mode', preferences.dark_mode === opt.value, val => updatePreference('dark_mode', val === 'true'))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Interface préférée</label>
                <div className="flex gap-3">
                  {[{ value: 'visual', label: 'Kanban' }, { value: 'list', label: 'Liste' }].map(opt =>
                    radioCard(opt.value, opt.label, 'interface_preference', preferences.interface_preference === opt.value, val => updatePreference('interface_preference', val))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Utiliser des étiquettes</label>
                <div className="flex gap-3">
                  {[{ value: true, label: 'Oui' }, { value: false, label: 'Non' }].map(opt =>
                    radioCard(String(opt.value), opt.label, 'use_labels', preferences.use_labels === opt.value, val => updatePreference('use_labels', val === 'true'))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(249,115,22,0.25)]">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Développement personnel</h3>
              <p className="text-white/50 text-sm mt-1">Grandir chaque jour</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Objectifs de développement</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'concentration', label: 'Améliorer ma concentration' },
                  { value: 'stress', label: 'Réduire le stress' },
                  { value: 'balance', label: 'Équilibrer travail et vie perso' },
                  { value: 'skills', label: 'Apprendre de nouvelles compétences' },
                  { value: 'habits', label: 'Développer de meilleures habitudes' },
                ].map(opt =>
                  checkCard(opt.value, opt.label, (preferences.personal_development_goals || []).includes(opt.value), () => toggleArrayPreference('personal_development_goals', opt.value))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Défis principaux</label>
              <div className="grid grid-cols-1 gap-2">
                {PRODUCTIVITY_CHALLENGES.map(opt =>
                  checkCard(opt.value, opt.label, (preferences.productivity_challenges || []).includes(opt.value), () => toggleArrayPreference('productivity_challenges', opt.value))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Priorités de vie</label>
              <div className="flex flex-wrap gap-2">
                {LIFE_PRIORITIES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArrayPreference('life_priorities', opt.value)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      (preferences.life_priorities || []).includes(opt.value)
                        ? 'border-[#00B4DB] bg-[#00B4DB]/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(20,184,166,0.25)]">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Votre avis</h3>
              <p className="text-white/50 text-sm mt-1">Aidez-nous à nous améliorer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Principal défi en gestion du temps</label>
              <select
                value={preferences.main_time_challenge || ''}
                onChange={e => updatePreference('main_time_challenge', e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat' }}
              >
                <option className="bg-[#16213e]" value="">Sélectionner</option>
                <option className="bg-[#16213e]" value="prioritize">Prioriser mes tâches</option>
                <option className="bg-[#16213e]" value="concentrate">Rester concentré</option>
                <option className="bg-[#16213e]" value="procrastination">Éviter la procrastination</option>
                <option className="bg-[#16213e]" value="balance">Équilibre travail/vie</option>
                <option className="bg-[#16213e]" value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Qu'attendez-vous de Time Pro ?</label>
              <textarea
                value={preferences.app_expectations || ''}
                onChange={e => updatePreference('app_expectations', e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10 resize-none"
                rows={3}
                placeholder="J'attends de cette app..."
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6 animate-[fadeSlideIn_0.4s_ease]">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B4DB] to-[#0088a8] flex items-center justify-center shadow-[0_0_40px_rgba(0,180,219,0.3)]">
                <Smile className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mt-4">Prêt à commencer !</h3>
              <p className="text-white/50 text-sm mt-1">Encore quelques questions optionnelles</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Hobbies à intégrer au planning ?</label>
              <div className="flex gap-3">
                {[{ value: true, label: 'Oui' }, { value: false, label: 'Non' }].map(opt =>
                  radioCard(String(opt.value), opt.label, 'has_hobbies_to_plan', preferences.has_hobbies_to_plan === opt.value, val => updatePreference('has_hobbies_to_plan', val === 'true'))
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Contraintes spécifiques</label>
              <textarea
                value={preferences.specific_constraints || ''}
                onChange={e => updatePreference('specific_constraints', e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none transition-all focus:border-[#00B4DB] focus:bg-white/10 resize-none"
                rows={2}
                placeholder="Garde d'enfants, horaires fixes, télétravail..."
              />
            </div>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const totalSteps = 10;
  const progress = ((step + 1) / totalSteps) * 100;

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0f1923] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1923] flex">
      {/* Sidebar - steps overview */}
      <div className="hidden lg:flex lg:w-72 flex-col bg-[#16213e]/80 backdrop-blur border-r border-white/5 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00B4DB] to-[#0088a8]">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Time Pro</span>
        </div>
        <div className="space-y-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i;
            const isDone = step > i;
            return (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00B4DB]/15 text-[#00B4DB] border border-[#00B4DB]/20'
                    : isDone
                    ? 'text-white/60 hover:bg-white/5 cursor-pointer'
                    : 'text-white/30'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-[#00B4DB] text-white' :
                  isDone ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex lg:hidden items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00B4DB] to-[#0088a8]">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">Time Pro</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-white/40">
              <span className="font-medium text-white/60">Étape {step + 1}</span>
              <span>/</span>
              <span>{totalSteps}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00B4DB] to-[#0088a8] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-white/40 font-medium w-8 text-right">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
              {step > 0 ? (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#00B4DB] to-[#0088a8] text-white text-sm font-bold rounded-xl shadow-[0_8px_24px_rgba(0,180,219,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,180,219,0.35)] active:translate-y-0"
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-[0_8px_24px_rgba(16,185,129,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(16,185,129,0.35)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {loading ? 'Enregistrement...' : 'Terminer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;
