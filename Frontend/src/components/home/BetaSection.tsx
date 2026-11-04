import { Link } from 'react-router-dom';
import { Users, CreditCard, Download, WifiOff, ArrowRight } from 'lucide-react';

const points = [
  {
    icon: CreditCard,
    title: 'Accès gratuit',
    description:
      'Toutes les fonctionnalités actuelles, sans carte bancaire et sans engagement.',
  },
  {
    icon: Download,
    title: 'Tes données exportables',
    description:
      'Tâches, temps et projets en JSON, CSV ou Markdown. Tu repars quand tu veux.',
  },
  {
    icon: WifiOff,
    title: 'Utilisable hors ligne',
    description:
      'Le planning et le chronomètre continuent de fonctionner quand le réseau tombe.',
  },
];

const BetaSection = () => {
  return (
    <section id="beta" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <Users className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">
              Bêta ouverte
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2A49] mb-6">
            Pas encore de témoignages.
            <span className="text-[#00B4DB] block mt-2">
              On préfère te laisser essayer.
            </span>
          </h2>

          <p className="text-xl text-[#4A6073] max-w-3xl mx-auto leading-relaxed">
            L’application est jeune. Plutôt que d’inventer des avis, voici exactement ce que
            tu obtiens en créant un compte aujourd’hui.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {points.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-8 bg-[#F8FCFD] rounded-2xl border border-gray-100 hover:border-[#00B4DB]/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-4 bg-[#00B4DB]/10 rounded-xl w-fit mb-6">
                <Icon className="w-7 h-7 text-[#00B4DB]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A2A49] mb-3">{title}</h3>
              <p className="text-[#4A6073] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-block p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 max-w-2xl">
            <p className="text-[#4A6073] leading-relaxed">
              Quand de vrais retours arriveront, ils seront publiés ici avec l’accord des
              personnes concernées. Pas avant.
            </p>
          </div>

          <div>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#00B4DB] hover:bg-[#087c95] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#00B4DB]/30 hover:-translate-y-1"
            >
              Créer mon compte
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BetaSection;
