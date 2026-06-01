import { Calendar, BarChart3, Bell, Smartphone, Globe, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Calendar,
    title: 'Planning Intelligent',
    description: 'Calendrier adaptatif qui s\'ajuste automatiquement selon vos priorités et votre charge de travail.',
    color: '#00B4DB'
  },
  {
    icon: BarChart3,
    title: 'Analytics Détaillés',
    description: 'Visualisez vos habitudes de travail et identifiez les opportunités d\'optimisation.',
    color: '#8B5CF6'
  },
  {
    icon: Bell,
    title: 'Notifications Intelligentes',
    description: 'Rappels contextuels qui s\'adaptent à votre rythme et vos moments de concentration.',
    color: '#F59E0B'
  },
  {
    icon: Smartphone,
    title: 'Multi-Plateforme',
    description: 'Synchronisation parfaite entre tous vos appareils.',
    color: '#10B981'
  },
  {
    icon: Globe,
    title: 'Intégrations',
    description: 'Connectez Time Pro avec plus de 50 applications.',
    color: '#EF4444'
  },
  {
    icon: Zap,
    title: 'Automatisation',
    description: 'Automatisez vos tâches répétitives et concentrez-vous sur l\'essentiel.',
    color: '#EC4899'
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0f1c]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-6">
            <Zap className="w-4 h-4 text-[#00B4DB]" />
            <span className="text-sm font-medium text-[#00B4DB] uppercase tracking-wider">Fonctionnalités</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tout ce dont vous avez besoin
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Time Pro combine intelligence artificielle et design intuitif pour vous offrir 
            l'expérience de gestion du temps la plus avancée.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }, index) => (
            <div
              key={index}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover gradient effect */}
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
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {title}
                </h3>
                
                <p className="text-white/60 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-[#00B4DB] hover:text-white transition-colors font-medium"
          >
            Découvrir toutes les fonctionnalités
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;