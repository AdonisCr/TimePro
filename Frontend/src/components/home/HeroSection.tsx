import { Link } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

const PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80&fit=crop',
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f1c]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00B4DB]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left photos */}
          <div className="hidden lg:flex flex-col gap-6 shrink-0 w-[200px]">
            <img 
              src={PHOTOS[0]} 
              alt="Professional woman"
              className="w-full h-[250px] object-cover rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
            />
            <img 
              src={PHOTOS[1]} 
              alt="Team meeting"
              className="w-full h-[180px] object-cover rounded-3xl shadow-2xl ml-8 hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          {/* Center text */}
          <div className="flex-1 text-center max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00B4DB] animate-pulse" />
              <span className="text-white/70 text-sm font-medium">La gestion de temps réinventée</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Gérez votre temps
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4DB] to-[#00d4ff]">
                intelligemment
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-lg mx-auto mb-10 leading-relaxed">
              Time Pro vous aide à organiser vos journées, suivre votre productivité et atteindre vos objectifs. 
              Simple, intuitif et puissant.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4DB] to-[#0086a8] hover:from-[#00c9ed] hover:to-[#00a3c2] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#00B4DB]/30 hover:-translate-y-1 w-full sm:w-auto"
              >
                Essai gratuit
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/10 hover:-translate-y-1 w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Voir la démo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-white/50 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Setup en 2 min
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Support prioritaire
              </span>
            </div>
          </div>

          {/* Right photos */}
          <div className="hidden lg:flex flex-col gap-6 shrink-0 w-[200px]">
            <img 
              src={PHOTOS[2]} 
              alt="Colleague smiling"
              className="w-full h-[180px] object-cover rounded-3xl shadow-2xl mr-8 hover:scale-[1.02] transition-transform duration-500"
            />
            <img 
              src={PHOTOS[3]} 
              alt="Collaborative work"
              className="w-full h-[250px] object-cover rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
          {[
            { value: '98%', label: 'Satisfaction', sub: 'Note 4.9/5' },
            { value: '+40%', label: 'Productivité', sub: 'Gain en 30 jours' },
            { value: '50k+', label: 'Utilisateurs', sub: '24 pays' }
          ].map(({ value, label, sub }) => (
            <div 
              key={label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-white/70 font-medium">{label}</div>
              <div className="text-white/40 text-sm">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;