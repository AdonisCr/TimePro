import { Check, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

const included = [
  'Projets, tâches et planning du jour',
  'Saisie en vrac avec durée estimée',
  'Chronomètre et bilan de la semaine',
  'Rappels d’échéance',
  'Partage d’un planning par lien',
  'Export en JSON, CSV ou Markdown',
];

const PricingSection = () => {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-[#F8FCFD]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Gift className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">
              Tarifs
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2A49] mb-6">
            Une seule offre pour l’instant :
            <span className="text-[#00B4DB] block mt-2">la bêta, gratuite.</span>
          </h2>

          <p className="text-xl text-[#4A6073] max-w-2xl mx-auto leading-relaxed">
            Aucun paiement, aucune carte bancaire. Le produit est encore en construction et
            l’accès reste gratuit pendant cette période.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-lg border-2 border-[#00B4DB]">
          <div className="text-center mb-8">
            <div className="p-4 bg-[#00B4DB]/10 rounded-2xl w-fit mx-auto mb-6">
              <Gift className="w-10 h-10 text-[#00B4DB]" />
            </div>

            <h3 className="text-2xl font-bold text-[#1A2A49] mb-2">Bêta gratuite</h3>

            <div className="my-4">
              <span className="text-5xl font-bold text-[#1A2A49]">0 FCFA</span>
              <span className="text-[#4A6073] ml-2">pendant la bêta</span>
            </div>

            <p className="text-[#4A6073]">Toutes les fonctionnalités ci-dessous, tant que la bêta dure.</p>
          </div>

          <ul className="space-y-4 mb-8">
            {included.map(feature => (
              <li key={feature} className="flex items-start">
                <Check className="w-5 h-5 text-[#00B4DB] mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-[#4A6073]">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/signup"
            className="block w-full text-center py-4 px-6 rounded-xl font-bold text-lg bg-[#00B4DB] hover:bg-[#087c95] text-white shadow-lg transition-all hover:scale-[1.02]"
          >
            Créer mon compte
          </Link>

          <p className="text-xs text-[#4A6073] leading-relaxed mt-6 text-center">
            Si une offre payante arrive un jour, les tarifs seront annoncés avant toute
            facturation. Tu resteras libre de refuser, sans perdre tes données.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
