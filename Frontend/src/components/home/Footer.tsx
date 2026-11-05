import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

const Footer = () => {
  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050810] text-white border-t border-white/10">
      <div className="site-container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Identité */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-[#00B4DB] rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold">Time Pro</span>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed text-lg max-w-md">
              Écris tout ce que tu as à faire. Time Pro le range dans ta journée :
              priorités, créneaux et temps travaillé.
            </p>

            <div className="flex items-center gap-3 text-gray-400">
              <MapPin className="w-5 h-5 text-[#00B4DB]" />
              <span>Cotonou, Bénin</span>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <span className="w-2 h-2 rounded-full bg-[#00B4DB]" />
              Bêta gratuite, sans carte bancaire
            </p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-lg font-bold mb-6">Produit</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors"
                >
                  Comment ça marche
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors"
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('beta')}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors"
                >
                  Bêta ouverte
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors"
                >
                  Tarifs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq')}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-lg font-bold mb-6">Compte</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/signup" className="text-gray-300 hover:text-[#00B4DB] transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-[#00B4DB] transition-colors">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Time Pro — Cotonou, Bénin
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Français</span>
              <Link to="/login" className="hover:text-[#00B4DB] transition-colors">
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="bg-[#00B4DB] hover:bg-[#087c95] text-white px-5 py-2.5 rounded-xl transition-all font-semibold"
              >
                Essayer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
