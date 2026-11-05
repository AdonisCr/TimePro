import { Brain, CalendarDays, Timer, BarChart3, Bell, WifiOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Brain,
    title: 'Saisie en vrac',
    description:
      'Écris tout ce que tu as en tête, une tâche par ligne. L’app en fait une liste claire, avec une durée estimée.',
    color: '#00B4DB',
  },
  {
    icon: CalendarDays,
    title: 'Planning du jour',
    description:
      'Tes tâches réparties en créneaux, avec les pauses. Tu vois quoi faire, et à quel moment.',
    color: '#8B5CF6',
  },
  {
    icon: Timer,
    title: 'Chronomètre',
    description:
      'Démarre, mets en pause, reprends. Le temps est compté même si tu fermes l’onglet.',
    color: '#F59E0B',
  },
  {
    icon: BarChart3,
    title: 'Bilan de la semaine',
    description:
      'Vois où part ton temps, projet par projet. Un rapport lisible, sans tableur à remplir.',
    color: '#10B981',
  },
  {
    icon: Bell,
    title: 'Rappels d’échéance',
    description:
      'Une notification par jour pour les tâches qui arrivent à échéance. Pas de rafale.',
    color: '#EF4444',
  },
  {
    icon: WifiOff,
    title: 'Hors ligne',
    description:
      'Le planning et le chronomètre fonctionnent sans réseau. Tout se synchronise dès que tu reviens en ligne.',
    color: '#EC4899',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0f1c]">
      <div className="site-container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-6">
            <Brain className="w-4 h-4 text-[#00B4DB]" />
            <span className="text-sm font-medium text-[#00B4DB] uppercase tracking-wider">
              Fonctionnalités
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Six choses, bien faites
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Voilà ce que tu peux utiliser aujourd’hui dans l’application. Rien de plus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)` }}
              />

              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-white/60 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-[#00B4DB] hover:text-white transition-colors font-medium"
          >
            Créer mon compte
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
