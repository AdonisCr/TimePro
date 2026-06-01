import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Directrice Marketing',
      company: 'TechCorp',
      content: 'Time Pro a complètement transformé ma façon de travailler. Je gagne maintenant 2 heures par jour grâce à l\'optimisation intelligente de mon planning. L\'IA comprend parfaitement mes priorités.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Jean Martin',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'L\'IA de Time Pro est impressionnante. Elle anticipe mes besoins et optimise mon emploi du temps mieux que je ne pourrais le faire moi-même. Un véritable assistant personnel intelligent.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Sophie Laurent',
      role: 'Consultante',
      company: 'Freelance',
      content: 'Depuis que j\'utilise Time Pro, ma productivité a augmenté de 45%. Les recommandations de l\'IA sont incroyablement précises et m\'aident à rester focalisée sur mes objectifs.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Pierre Durand',
      role: 'Chef de Projet',
      company: 'AgenceDigital',
      content: 'Time Pro a révolutionné la gestion de mes équipes. La collaboration n\'a jamais été aussi fluide et efficace. Les tableaux de bord nous donnent une visibilité parfaite.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Camille Petit',
      role: 'Designer UX',
      company: 'CreativeStudio',
      content: 'Interface intuitive, IA performante, résultats exceptionnels. Time Pro est devenu indispensable à mon quotidien professionnel. Je le recommande sans hésitation.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Thomas Moreau',
      role: 'Développeur Senior',
      company: 'DevCompany',
      content: 'Enfin un outil qui comprend le rythme des développeurs ! Time Pro optimise mes sessions de code selon mes pics de concentration. Ma productivité a explosé.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Star className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">Témoignages</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-[#1A2A49] mb-8">
            Ce que disent nos
            <span className="text-[#00B4DB] block mt-2">utilisateurs</span>
          </h2>
          
          <p className="text-xl text-[#4A6073] max-w-4xl mx-auto leading-relaxed">
            Découvrez comment Time Pro transforme la productivité de milliers de professionnels 
            à travers le monde et révolutionne leur façon de travailler.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#F8FCFD] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="bg-[#00B4DB] p-3 rounded-full">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-6 pt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-[#4A6073] mb-8 leading-relaxed italic text-lg">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-bold text-[#1A2A49] text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-[#4A6073]">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-8 bg-white px-12 py-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
              <span className="font-bold text-[#1A2A49] text-2xl">4.9/5</span>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-[#4A6073] text-lg">
              Basé sur <strong className="text-[#1A2A49]">2,847</strong> avis
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;