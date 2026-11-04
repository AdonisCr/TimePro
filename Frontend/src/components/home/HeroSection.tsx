import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0f1c] pt-28 pb-16">
      {/* Halo discret, on garde l'identité cyan existante */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#00B4DB]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00B4DB]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-14">
          {/* Texte */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00B4DB] animate-pulse" />
              <span className="text-white/70 text-sm font-medium">Bêta ouverte, accès gratuit</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Tu vides ta tête.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B4DB] to-[#00d4ff]">
                L'app planifie
                <br />
                ta journée.
              </span>
            </h1>

            <p className="text-lg text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Écris tout ce que tu as à faire, en vrac. Time Pro estime les durées,
              repère les urgences et range tes tâches dans ta journée.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B4DB] to-[#0086a8] hover:from-[#00c9ed] hover:to-[#00a3c2] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#00B4DB]/30 hover:-translate-y-1 w-full sm:w-auto"
              >
                Planifier ma journée
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/10 hover:-translate-y-1 w-full sm:w-auto"
              >
                Voir les fonctionnalités
              </a>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-white/50 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Sans carte bancaire
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Gratuit pendant la bêta
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00B4DB]" />
                Mobile et ordinateur
              </span>
            </div>
          </div>

          {/* Capture réelle de l'application */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-[#00B4DB]/10">
              <div className="flex items-center gap-1.5 px-2 py-2" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <img
                src="/product-preview.webp"
                alt="Tableau de bord Time Pro : priorités du jour, nombre de tâches, projets et heures travaillées"
                className="w-full h-auto rounded-xl"
                loading="eager"
                width={1740}
                height={1374}
              />
            </div>
            <p className="text-center text-white/40 text-xs mt-3">
              Capture réelle de l'application. Données de démonstration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
