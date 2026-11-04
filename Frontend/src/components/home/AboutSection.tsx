import { ListChecks, CalendarDays, Timer, Info } from 'lucide-react';

const steps = [
  {
    icon: ListChecks,
    number: '1',
    title: 'Tu écris tout en vrac',
    description:
      'Une tâche par ligne, comme ça vient. Pas de formulaire à remplir, pas de menu à parcourir.',
  },
  {
    icon: CalendarDays,
    number: '2',
    title: "L'app range ta journée",
    description:
      'Elle estime les durées, repère les urgences et place chaque tâche dans un créneau, pauses comprises.',
  },
  {
    icon: Timer,
    number: '3',
    title: 'Tu avances, tout est gardé',
    description:
      'Lance le chronomètre sur une tâche. Ton temps est enregistré, même si tu fermes l’onglet.',
  },
];

const AboutSection = () => {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#00B4DB]/10 px-6 py-3 rounded-full mb-8">
            <ListChecks className="w-5 h-5 text-[#00B4DB]" />
            <span className="text-sm font-semibold text-[#00B4DB] uppercase tracking-wide">
              Comment ça marche
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#1A2A49] mb-6">
            Trois étapes,
            <span className="text-[#00B4DB]"> deux minutes</span>
          </h2>

          <p className="text-xl text-[#4A6073] max-w-3xl mx-auto leading-relaxed">
            Pas de méthode compliquée à apprendre. Tu écris, l'app range, tu travailles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, number, title, description }) => (
            <div
              key={number}
              className="relative p-8 bg-[#F8FCFD] rounded-2xl border border-gray-100 hover:border-[#00B4DB]/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-[#00B4DB]/10 rounded-xl">
                  <Icon className="w-8 h-8 text-[#00B4DB]" />
                </div>
                <span className="text-5xl font-bold text-[#00B4DB]/15">{number}</span>
              </div>

              <h3 className="text-2xl font-bold text-[#1A2A49] mb-4">{title}</h3>
              <p className="text-[#4A6073] leading-relaxed text-lg">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto flex items-start gap-3 p-5 bg-gray-50 border border-gray-100 rounded-xl">
          <Info className="w-5 h-5 text-[#4A6073] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#4A6073] leading-relaxed">
            Pas de boîte noire : les durées et les priorités sont estimées par des règles
            simples, que tu peux corriger à la main avant de valider ton planning.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
