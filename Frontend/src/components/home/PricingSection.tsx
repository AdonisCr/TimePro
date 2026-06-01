import { Check, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'Toujours gratuit',
      description: 'Parfait pour découvrir Time Pro',
      features: [
        'Jusqu\'à 3 projets',
        'Planning de base',
        'Notifications simples',
        'Support communautaire',
        'Synchronisation 2 appareils'
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      icon: Zap
    },
    {
      name: 'Pro',
      price: '12',
      period: 'par mois',
      description: 'Pour les professionnels exigeants',
      features: [
        'Projets illimités',
        'IA avancée et recommandations',
        'Analytics détaillés',
        'Intégrations premium',
        'Support prioritaire 24/7',
        'Synchronisation illimitée',
        'Collaboration équipe',
        'Automatisations avancées'
      ],
      cta: 'Essai gratuit 14 jours',
      popular: true,
      icon: Crown
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: 'Contactez-nous',
      description: 'Pour les grandes organisations',
      features: [
        'Tout du plan Pro',
        'Déploiement sur site',
        'SSO et sécurité avancée',
        'API personnalisée',
        'Formation dédiée',
        'Account manager dédié',
        'SLA garantie 99.9%',
        'Conformité RGPD+'
      ],
      cta: 'Contactez-nous',
      popular: false,
      icon: Crown
    }
  ];

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FCFD]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Crown className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">Tarifs</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-[#1A2A49] mb-8">
            Choisissez votre
            <span className="text-[#00B4DB] block mt-2">formule idéale</span>
          </h2>
          
          <p className="text-xl text-[#4A6073] max-w-4xl mx-auto leading-relaxed">
            Commencez gratuitement et évoluez selon vos besoins. 
            Tous nos plans incluent un support client exceptionnel et des mises à jour régulières.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-[#00B4DB] scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#00B4DB] text-white px-6 py-2 rounded-full text-sm font-bold">
                    Le plus populaire
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`p-4 rounded-2xl w-fit mx-auto mb-6 ${
                  plan.popular ? 'bg-[#00B4DB]/10' : 'bg-gray-100'
                }`}>
                  <plan.icon className={`w-10 h-10 ${
                    plan.popular ? 'text-[#00B4DB]' : 'text-gray-600'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-bold text-[#1A2A49] mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  {typeof plan.price === 'string' && plan.price !== '0' ? (
                    <div className="text-[#4A6073] text-lg">{plan.price}</div>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-[#1A2A49]">{plan.price}€</span>
                      <span className="text-[#4A6073] ml-2">{plan.period}</span>
                    </>
                  )}
                </div>
                
                <p className="text-[#4A6073]">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-[#00B4DB] mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-[#4A6073]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block w-full text-center py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
                  plan.popular
                    ? 'bg-[#00B4DB] hover:bg-[#087c95] text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-[#1A2A49]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-[#1A2A49]">Garantie satisfait ou remboursé</div>
              <div className="text-[#4A6073]">30 jours pour changer d'avis</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;