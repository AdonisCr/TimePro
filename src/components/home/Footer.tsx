import { Link } from 'react-router-dom';
import { Clock, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1A2A49] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-[#00B4DB] rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold">Time Pro</span>
            </Link>
            
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Time Pro révolutionne la gestion du temps grâce à l'intelligence artificielle. 
              Optimisez votre productivité avec notre solution innovante.
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-3 bg-gray-700 hover:bg-[#00B4DB] rounded-xl transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-700 hover:bg-[#00B4DB] rounded-xl transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-700 hover:bg-[#00B4DB] rounded-xl transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-gray-700 hover:bg-[#00B4DB] rounded-xl transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-8">Liens rapides</h3>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg"
                >
                  À propos
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg"
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg"
                >
                  Témoignages
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg"
                >
                  Tarifs
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-8">Légal</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                  RGPD
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-8">Contact</h3>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-[#00B4DB] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <a href="mailto:contact@timepro.fr" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                    contact@timepro.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-[#00B4DB] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Téléphone</div>
                  <a href="tel:+33123456789" className="text-gray-300 hover:text-[#00B4DB] transition-colors text-lg">
                    +229 01 64 02 85 46
                    </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-[#00B4DB] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400 mb-1">Adresse</div>
                  <div className="text-gray-300 text-lg">
                    Cotonou / Benin <br />
                    123 Rue de l'Innovation                    
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-lg">
              © 2024 Time Pro. Tous droits réservés.
            </div>
            
            <div className="flex items-center space-x-8 text-lg text-gray-400">
              <span>🇫🇷 Français</span>
              <Link to="/login" className="hover:text-[#00B4DB] transition-colors">
                Se connecter
              </Link>
              <Link 
                to="/signup" 
                className="bg-[#00B4DB] hover:bg-[#087c95] text-white px-6 py-3 rounded-xl transition-all font-semibold"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;