import { Calendar, BarChart3, Bell, Smartphone, Globe, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Planning Intelligent',
      description: 'Calendrier adaptatif qui s\'ajuste automatiquement selon vos priorités et votre charge de travail.',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    },
    {
      icon: BarChart3,
      title: 'Analytics Détaillés',
      description: 'Visualisez vos habitudes de travail et identifiez les opportunités d\'optimisation.',
      image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    },
    {
      icon: Bell,
      title: 'Notifications Intelligentes',
      description: 'Rappels contextuels qui s\'adaptent à votre rythme et vos moments de concentration.',
      image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    },
    {
      icon: Smartphone,
      title: 'Multi-Plateforme',
      description: 'Synchronisation parfaite entre tous vos appareils : mobile, tablette, ordinateur.',
      image: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    },
    {
      icon: Globe,
      title: 'Intégrations',
      description: 'Connectez Time Pro avec plus de 50 applications que vous utilisez déjà.',
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    },
    {
      icon: Zap,
      title: 'Automatisation',
      description: 'Automatisez vos tâches répétitives et concentrez-vous sur ce qui compte vraiment.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FCFD]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Zap className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">Fonctionnalités</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-[#1A2A49] mb-8">
            Tout ce dont vous avez besoin
            <span className="text-[#00B4DB] block mt-2">en une seule plateforme</span>
          </h2>
          
          <p className="text-xl text-[#4A6073] max-w-4xl mx-auto leading-relaxed">
            Time Pro combine intelligence artificielle et design intuitif pour vous offrir 
            l'expérience de gestion du temps la plus avancée du marché.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="p-8">
                <div className="p-3 bg-[#00B4DB]/10 rounded-xl w-fit mb-6">
                  <feature.icon className="w-7 h-7 text-[#00B4DB]" />
                </div>
                
                <h3 className="text-2xl font-bold text-[#1A2A49] mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-[#4A6073] leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;