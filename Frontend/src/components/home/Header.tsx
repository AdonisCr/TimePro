import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'how-it-works', label: 'Comment ça marche' },
  { id: 'features', label: 'Fonctionnalités' },
  { id: 'pricing', label: 'Tarifs' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f1c]/95 backdrop-blur-lg shadow-lg border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-[#00B4DB] to-[#0086a8] rounded-xl group-hover:scale-105 transition-transform shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Time Pro</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white/70 hover:text-white transition-colors font-medium text-base tracking-wide"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-white/70 hover:text-white transition-colors font-medium text-base"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#00B4DB] to-[#0086a8] hover:from-[#00c9ed] hover:to-[#00a3c2] text-white px-6 py-2.5 rounded-full font-semibold text-base transition-all hover:shadow-lg hover:shadow-[#00B4DB]/30"
            >
              Essayer gratuitement
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0f1c]/98 backdrop-blur-lg border-t border-white/10 shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-white/70 hover:text-white transition-colors font-medium py-3 text-lg border-b border-white/10"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="block text-white/70 hover:text-white transition-colors font-medium py-3 text-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/signup"
                  className="block bg-gradient-to-r from-[#00B4DB] to-[#0086a8] text-white px-6 py-3 rounded-full font-semibold transition-all text-center text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Essayer gratuitement
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
