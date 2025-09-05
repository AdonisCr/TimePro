import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Clock, Zap, TrendingUp, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F8FCFD] via-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
              <Brain className="w-5 h-5 text-[#00B4DB]" />
              <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">Powered by AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1A2A49] leading-tight mb-8">
              Révolutionnez votre 
              <span className="text-[#00B4DB] block mt-2">gestion du temps</span>
            </h1>
            
            <p className="text-xl text-[#4A6073] mb-12 leading-relaxed max-w-xl">
              Time Pro utilise l'intelligence artificielle pour optimiser votre productivité. 
              Découvrez comment notre technologie révolutionnaire transforme votre façon de travailler.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Link
                to="/signup"
                className="bg-[#00B4DB] hover:bg-[#087c95] text-white px-10 py-5 rounded-xl font-bold text-xl transition-all hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
              >
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="border-2 border-[#00B4DB] text-[#00B4DB] hover:bg-[#00B4DB] hover:text-white px-10 py-5 rounded-xl font-bold text-xl transition-all flex items-center justify-center group">
                <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Voir la démo
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A2A49] mb-2">98%</div>
                <div className="text-[#4A6073] font-medium">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A2A49] mb-2">+40%</div>
                <div className="text-[#4A6073] font-medium">Productivité</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A2A49] mb-2">50k+</div>
                <div className="text-[#4A6073] font-medium">Utilisateurs</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Dashboard Mockup */}
          <div className="relative animate-slide-up">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[#1A2A49]">Tableau de bord</h3>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">+24%</span>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-[#00B4DB]/10 p-6 rounded-2xl">
                  <Clock className="w-10 h-10 text-[#00B4DB] mb-4" />
                  <div className="text-sm text-[#4A6073] mb-2">Temps optimisé</div>
                  <div className="text-2xl font-bold text-[#1A2A49]">2h 45m</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-2xl">
                  <Zap className="w-10 h-10 text-green-600 mb-4" />
                  <div className="text-sm text-[#4A6073] mb-2">Tâches complétées</div>
                  <div className="text-2xl font-bold text-[#1A2A49]">12/15</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#4A6073] font-medium">Progression aujourd'hui</span>
                  <span className="text-lg font-bold text-[#00B4DB]">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-[#00B4DB] to-blue-400 h-3 rounded-full w-4/5 transition-all duration-1000"></div>
                </div>
              </div>
              
              {/* Floating AI Badge */}
              <div className="absolute -top-6 -right-6 bg-[#00B4DB] text-white p-4 rounded-full shadow-xl animate-bounce-gentle">
                <Brain className="w-8 h-8" />
              </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute -z-10 -top-10 -left-10 w-40 h-40 bg-[#00B4DB]/20 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-10 -right-10 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;