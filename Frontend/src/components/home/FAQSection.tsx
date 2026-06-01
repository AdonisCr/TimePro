import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Comment l\'IA de Time Pro optimise-t-elle mon planning ?',
      answer: 'Notre intelligence artificielle analyse vos habitudes de travail, vos pics de productivité, et vos préférences pour créer un planning personnalisé. Elle apprend continuellement de vos actions pour améliorer ses recommandations et maximiser votre efficacité.'
    },
    {
      question: 'Time Pro est-il compatible avec mes outils existants ?',
      answer: 'Absolument ! Time Pro s\'intègre avec plus de 50 applications populaires comme Google Calendar, Slack, Trello, Asana, Microsoft Office, et bien d\'autres. L\'installation se fait en quelques clics via notre centre d\'intégrations.'
    },
    {
      question: 'Mes données personnelles sont-elles sécurisées ?',
      answer: 'La sécurité est notre priorité absolue. Toutes vos données sont chiffrées avec un standard de niveau bancaire (AES-256), stockées sur des serveurs certifiés SOC 2, et nous ne vendons jamais vos informations personnelles à des tiers.'
    },
    {
      question: 'Puis-je utiliser Time Pro en équipe ?',
      answer: 'Oui ! Time Pro propose des fonctionnalités collaboratives avancées : partage de calendriers, assignation de tâches, suivi de projets en temps réel, et tableaux de bord d\'équipe. Idéal pour les équipes de 2 à 500+ personnes.'
    },
    {
      question: 'Y a-t-il une période d\'essai gratuite ?',
      answer: 'Oui, nous offrons 14 jours d\'essai gratuit avec accès complet à toutes les fonctionnalités premium. Aucune carte de crédit requise pour commencer. Vous pouvez annuler à tout moment sans frais.'
    },
    {
      question: 'Comment fonctionne la recommandation intelligente de tâches ?',
      answer: 'L\'IA analyse votre historique, vos deadlines, l\'importance des tâches, et votre énergie selon les moments de la journée. Elle propose automatiquement le meilleur ordre d\'exécution et vous alerte sur les conflits potentiels.'
    },
    {
      question: 'Time Pro fonctionne-t-il hors ligne ?',
      answer: 'Time Pro fonctionne en mode hybride. Les fonctionnalités de base (consultation, modification de tâches) sont disponibles hors ligne. La synchronisation et les recommandations IA s\'activent dès que vous retrouvez une connexion internet.'
    },
    {
      question: 'Quels sont les tarifs de Time Pro ?',
      answer: 'Nous proposons un plan gratuit avec fonctionnalités de base, un plan Pro à 12€/mois avec IA avancée, et un plan Enterprise sur mesure. Tous les plans incluent un support client 24/7 et des mises à jour régulières.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-text-dark mb-6">
            Questions
            <span className="text-primary block">fréquentes</span>
          </h2>
          
          <p className="text-xl text-text-gray">
            Trouvez rapidement les réponses aux questions les plus courantes sur Time Pro.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-bg-light border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-text-dark pr-8">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-text-gray leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-blue-100 rounded-2xl">
          <h3 className="text-2xl font-bold text-text-dark mb-4">
            Vous ne trouvez pas votre réponse ?
          </h3>
          <p className="text-text-gray mb-6">
            Notre équipe support est disponible 24/7 pour répondre à toutes vos questions.
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105">
            Contactez-nous
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;