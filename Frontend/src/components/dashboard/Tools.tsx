import React from 'react';
import { 
  Calculator, 
  Timer, 
  FileText, 
  Calendar, 
  Palette, 
  Code, 
  Camera, 
  Music,
  ExternalLink,
  Star
} from 'lucide-react';

const Tools = () => {
  const toolCategories = [
    {
      title: 'Productivité',
      tools: [
        {
          name: 'Minuteur Pomodoro',
          description: 'Minuteur de concentration avec pauses',
          icon: Timer,
          color: 'bg-red-500',
          rating: 4.8,
          popular: true
        },
        {
          name: 'Calculatrice tâches',
          description: 'Estimez le temps nécessaire pour vos tâches',
          icon: Calculator,
          color: 'bg-blue-500',
          rating: 4.6,
          popular: false
        },
        {
          name: 'Prise de notes',
          description: 'Notes rapides et documentation',
          icon: FileText,
          color: 'bg-green-500',
          rating: 4.7,
          popular: true
        }
      ]
    },
    {
      title: 'Planification',
      tools: [
        {
          name: 'Sync Calendrier',
          description: 'Intégration avec vos calendriers externes',
          icon: Calendar,
          color: 'bg-purple-500',
          rating: 4.5,
          popular: false
        },
        {
          name: 'Sélecteur couleur',
          description: 'Générateur de palettes de couleurs',
          icon: Palette,
          color: 'bg-pink-500',
          rating: 4.4,
          popular: false
        }
      ]
    },
    {
      title: 'Développement',
      tools: [
        {
          name: 'Extraits de code',
          description: 'Sauvegardez et organisez vos extraits de code',
          icon: Code,
          color: 'bg-gray-700',
          rating: 4.9,
          popular: true
        },
        {
          name: 'Capture d\'écran',
          description: 'Capturez et annotez vos écrans',
          icon: Camera,
          color: 'bg-indigo-500',
          rating: 4.3,
          popular: false
        }
      ]
    }
  ];

  const quickActions = [
    { name: 'Démarrer timer', icon: Timer, action: 'timer' },
    { name: 'Nouvelle note', icon: FileText, action: 'note' },
    { name: 'Calculatrice', icon: Calculator, action: 'calc' },
    { name: 'Couleurs', icon: Palette, action: 'color' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Outils</h1>
          <p className="text-text-soft mt-1">Outils de productivité pour améliorer votre flux de travail</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center space-y-3 p-4 hover:bg-bg-light rounded-xl transition-colors group"
            >
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-text-dark">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Categories */}
      {toolCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-text-dark mb-6">{category.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.tools.map((tool, toolIndex) => (
              <div key={toolIndex} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${tool.color} rounded-xl`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {tool.popular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Populaire
                      </span>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4 text-text-soft" />
                    </button>
                  </div>
                </div>
                
                <h4 className="font-semibold text-text-dark mb-2">{tool.name}</h4>
                <p className="text-text-soft text-sm mb-4">{tool.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-text-dark">{tool.rating}</span>
                  </div>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
                    Lancer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Featured Tool */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <Music className="w-6 h-6 text-primary" />
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                Nouvel outil
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-dark mb-2">Lecteur Focus Musique</h3>
            <p className="text-text-soft mb-6 max-w-md">
              Améliorez votre productivité avec de la musique de concentration et des sons ambiants.
              Parfait pour les sessions de travail profond.
            </p>
            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Essayer
            </button>
          </div>
          
          <div className="hidden lg:block flex-shrink-0 ml-8">
            <div className="w-48 h-32 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center">
              <Music className="w-16 h-16 text-primary/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;