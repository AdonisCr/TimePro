import { useState } from 'react';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Comment l’app planifie ma journée ?',
    answer:
      'Tu écris tes tâches en vrac. L’app estime une durée et une priorité à partir de mots simples (« réunion », « urgent », « rapport »…), puis propose un ordre et des créneaux. Tu peux tout corriger à la main avant de valider.',
  },
  {
    question: 'Ça marche sur téléphone ?',
    answer:
      'Oui, dans le navigateur du téléphone comme sur ordinateur. Sur mobile, tu peux aussi l’ajouter à ton écran d’accueil pour l’ouvrir comme une application.',
  },
  {
    question: 'Et si je n’ai pas de connexion ?',
    answer:
      'Le planning et le chronomètre continuent de fonctionner hors ligne. Les actions sont mises en attente, puis envoyées automatiquement quand le réseau revient.',
  },
  {
    question: 'Mes données m’appartiennent-elles ?',
    answer:
      'Tu peux exporter tes tâches, ton temps et tes projets en JSON, CSV ou Markdown, quand tu veux. Tes données ne sont pas revendues.',
  },
  {
    question: 'Combien coûte Time Pro ?',
    answer:
      'Rien pendant la bêta. Aucune carte bancaire n’est demandée. Si une offre payante arrive, tu seras prévenu avant toute facturation et tu resteras libre de refuser.',
  },
  {
    question: 'Je peux partager mon planning ?',
    answer:
      'Oui. Un lien public peut afficher ton planning du jour, et si tu le souhaites tes statistiques et tes projets. Tu actives ou désactives chaque partie dans les réglages, et la coupure est immédiate.',
  },
  {
    question: 'Est-ce fait pour les équipes ?',
    answer:
      'Tu peux créer une équipe, inviter des personnes par email et leur donner un rôle. Les fonctions d’équipe restent simples pendant la bêta.',
  },
  {
    question: 'Y a-t-il des intégrations (Google Calendar, Slack…) ?',
    answer:
      'Pas encore. Time Pro ne se connecte aujourd’hui à aucun calendrier ni outil externe. On préfère le dire plutôt que de le promettre.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 bg-white">
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

          <p className="text-xl text-[#4A6073]">
            Des réponses courtes, sans promesse en l’air.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-[#F8FCFD] border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-text-dark pr-8">{faq.question}</h3>
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
                    <p className="text-[#4A6073] leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-blue-100 rounded-2xl">
          <h3 className="text-2xl font-bold text-text-dark mb-4">Prêt à essayer ?</h3>
          <p className="text-[#4A6073] mb-6">
            Crée ton compte, écris tes tâches, et regarde ta journée se ranger.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg hover:scale-105"
          >
            Planifier ma journée
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
