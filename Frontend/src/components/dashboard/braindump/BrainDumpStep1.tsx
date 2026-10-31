import { useState } from 'react';

interface BrainDumpStep1Props {
  onSubmit: (text: string) => void;
  loading?: boolean;
}

const BrainDumpStep1 = ({ onSubmit, loading = false }: BrainDumpStep1Props) => {
  const [text, setText] = useState('');

  const handleValidate = () => {
    if (text.trim().length > 0 && !loading) {
      onSubmit(text);
    }
  };

  const lineCount = text.split('\n').filter(line => line.trim().length > 0).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-text-dark">
          Vider son esprit
        </h1>
        <p className="text-lg text-text-soft">
          Écris tout. Sans réfléchir. Sans trier.
        </p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Appeler le plombier avant vendredi…\nRépondre à l'email de Marc…\nPréparer la présentation…"}
          className="w-full h-64 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-gray-300"
          autoFocus
        />
        {lineCount > 0 && (
          <div className="absolute bottom-3 right-3 text-sm text-text-soft bg-white/80 px-2 py-1 rounded">
            {lineCount} tâche{lineCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleValidate}
          disabled={lineCount === 0 || loading}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Analyser mes idées →
        </button>

        <p className="text-sm text-text-soft text-center max-w-md">
          💡 Une ligne = une tâche. On affinera la durée et la priorité juste après.
        </p>
      </div>
    </div>
  );
};

export default BrainDumpStep1;
