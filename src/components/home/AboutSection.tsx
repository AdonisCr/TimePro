import { Brain, Target, Zap, Shield, Users, TrendingUp } from 'lucide-react';

const AboutSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'IA Intelligente',
      description: 'Notre intelligence artificielle apprend de vos habitudes pour optimiser automatiquement votre planning et maximiser votre efficacité.'
    },
    {
      icon: Target,
      title: 'Objectifs Personnalisés',
      description: 'Définissez vos objectifs et laissez Time Pro créer le plan parfait pour les atteindre avec des recommandations sur mesure.'
    },
    {
      icon: Zap,
      title: 'Optimisation Automatique',
      description: 'Réorganisation intelligente de vos tâches selon vos priorités, votre énergie et vos pics de productivité.'
    },
    {
      icon: Shield,
      title: 'Sécurisé et Privé',
      description: 'Vos données sont protégées avec un chiffrement de niveau bancaire. Nous ne vendons jamais vos informations.'
    },
    {
      icon: Users,
      title: 'Collaboration Équipe',
      description: 'Travaillez en équipe avec des outils de collaboration intégrés, partage de calendriers et suivi de projets.'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avancés',
      description: 'Tableaux de bord détaillés pour suivre votre progression et identifier les opportunités d\'amélioration.'
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Brain className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">À propos de Time Pro</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-[#1A2A49] mb-8">
            La gestion du temps
            <span className="text-[#00B4DB] block mt-2">réinventée par l'IA</span>
          </h2>
          
          <p className="text-xl text-[#4A6073] max-w-4xl mx-auto leading-relaxed">
            Time Pro révolutionne votre façon de gérer le temps en utilisant l'intelligence artificielle 
            pour comprendre vos habitudes, optimiser votre planning et maximiser votre productivité.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-[#F8FCFD] rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-[#00B4DB]/20"
            >
              <div className="p-4 bg-[#00B4DB]/10 rounded-xl w-fit mb-6 group-hover:bg-[#00B4DB]/20 transition-colors">
                <feature.icon className="w-8 h-8 text-[#00B4DB]" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A2A49] mb-4">
                {feature.title}
              </h3>
              
              <p className="text-[#4A6073] leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#00B4DB] to-blue-600 rounded-3xl p-16 text-white">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">
              Rejoignez des milliers d'utilisateurs satisfaits
            </h3>
            <p className="text-blue-100 text-xl max-w-3xl mx-auto">
              Découvrez pourquoi Time Pro est la solution de gestion du temps préférée des professionnels 
              et des équipes les plus performantes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-3">50k+</div>
              <div className="text-blue-100 text-lg">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3">98%</div>
              <div className="text-blue-100 text-lg">Taux de satisfaction</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3">2.5M</div>
              <div className="text-blue-100 text-lg">Heures optimisées</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-3">40%</div>
              <div className="text-blue-100 text-lg">Gain de productivité</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;