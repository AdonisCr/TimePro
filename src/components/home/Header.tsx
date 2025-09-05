import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-[#00B4DB] rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1A2A49]">Time Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('about')}
              className="text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium text-lg"
            >
              À propos
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium text-lg"
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium text-lg"
            >
              Témoignages
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium text-lg"
            >
              Tarifs
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium text-lg"
            >
              Se connecter
            </Link>
            <Link
              to="/signup"
              className="bg-[#00B4DB] hover:bg-[#087c95] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:scale-105"
            >
              Essai gratuit
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#4A6073] hover:text-[#00B4DB] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection('about')}
                className="block w-full text-left text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium py-2 text-lg"
              >
                À propos
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium py-2 text-lg"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="block w-full text-left text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium py-2 text-lg"
              >
                Témoignages
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium py-2 text-lg"
              >
                Tarifs
              </button>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  to="/login"
                  className="block text-[#4A6073] hover:text-[#00B4DB] transition-colors font-medium py-2 text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/signup"
                  className="block bg-[#00B4DB] hover:bg-[#087c95] text-white px-6 py-3 rounded-xl font-semibold transition-all text-center text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Essai gratuit
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