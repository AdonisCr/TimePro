import type { FocusEvent, KeyboardEvent } from 'react';
import type {
  BrainDumpItem,
  BrainDumpItemPatch,
  BrainDumpPriority,
} from '../../../lib/braindump';

interface BrainDumpReviewProps {
  items: BrainDumpItem[];
  onPatch: (id: number, patch: BrainDumpItemPatch) => void;
  onConfirm: () => void;
  confirming: boolean;
}

const CAPACITY_MINUTES = 480;
const ORANGE_THRESHOLD = 420;

const PRIORITY_LABEL: Record<BrainDumpPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

const PRIORITY_NEXT: Record<BrainDumpPriority, BrainDumpPriority> = {
  low: 'medium',
  medium: 'high',
  high: 'low',
};

const PRIORITY_CLASS: Record<BrainDumpPriority, string> = {
  low: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  high: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const BrainDumpReview = ({ items, onPatch, onConfirm, confirming }: BrainDumpReviewProps) => {
  const retained = items.filter(item => item.status !== 'rejected');
  const totalMinutes = retained.reduce((sum, item) => sum + item.estimated_minutes, 0);
  const ratio = Math.min((totalMinutes / CAPACITY_MINUTES) * 100, 100);

  const capacityBarColor =
    totalMinutes > CAPACITY_MINUTES
      ? 'bg-red-500'
      : totalMinutes >= ORANGE_THRESHOLD
      ? 'bg-orange-500'
      : 'bg-green-500';

  const capacityMessage =
    totalMinutes > CAPACITY_MINUTES
      ? '⚠️ Capacité dépassée — refuse ou raccourcis quelques tâches.'
      : totalMinutes >= ORANGE_THRESHOLD
      ? '🟡 Journée chargée mais faisable.'
      : "🟢 Tu as de la marge pour l'imprévu.";

  const handleDurationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  const handleDurationBlur = (event: FocusEvent<HTMLInputElement>, item: BrainDumpItem) => {
    const parsed = parseInt(event.currentTarget.value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      event.currentTarget.value = String(item.estimated_minutes);
      return;
    }
    if (parsed !== item.estimated_minutes) {
      onPatch(item.id, { estimated_minutes: parsed });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-dark">Revue rapide</h1>
        <p className="text-lg text-text-soft">
          <span className="font-semibold text-text-dark">{retained.length} tâche{retained.length > 1 ? 's' : ''} retenue{retained.length > 1 ? 's' : ''}</span>
          {' '}sur {items.length}
        </p>
      </div>

      {/* Capacité */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-dark">Capacité du jour</span>
          <span className="text-sm text-text-soft">
            {Math.floor(totalMinutes / 60)}h{totalMinutes % 60 > 0 ? String(totalMinutes % 60).padStart(2, '0') : ''} / 8h
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${capacityBarColor}`}
            style={{ width: `${ratio}%` }}
          />
        </div>
        <p className="text-xs text-text-soft mt-1">{capacityMessage}</p>
      </div>

      {/* Liste des items */}
      <ul className="space-y-2">
        {items.map(item => {
          const retainedItem = item.status !== 'rejected';
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                retainedItem
                  ? 'bg-white border-gray-100 hover:border-gray-200'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={retainedItem}
                onChange={(e) =>
                  onPatch(item.id, { status: e.target.checked ? 'accepted' : 'rejected' })
                }
                className="h-5 w-5 rounded accent-primary shrink-0 cursor-pointer"
                aria-label={`Retenir la tâche : ${item.text}`}
              />

              <span
                className={`flex-1 text-sm ${
                  retainedItem ? 'text-text-dark' : 'text-text-soft line-through'
                }`}
              >
                {item.text}
              </span>

              <label className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={1440}
                  defaultValue={item.estimated_minutes}
                  onBlur={(e) => handleDurationBlur(e, item)}
                  onKeyDown={handleDurationKeyDown}
                  className="w-16 px-2 py-1 text-sm text-right border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                  aria-label={`Durée en minutes pour : ${item.text}`}
                />
                <span className="text-xs text-text-soft">min</span>
              </label>

              <button
                type="button"
                onClick={() => onPatch(item.id, { priority: PRIORITY_NEXT[item.priority] })}
                className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${PRIORITY_CLASS[item.priority]}`}
                title="Cliquer pour changer la priorité"
              >
                {PRIORITY_LABEL[item.priority]}
              </button>

              <button
                type="button"
                onClick={() => onPatch(item.id, { status: 'rejected' })}
                className="shrink-0 p-1.5 text-text-soft hover:text-red-500 transition-colors"
                aria-label={`Refuser la tâche : ${item.text}`}
              >
                🗑
              </button>
            </li>
          );
        })}
      </ul>

      {retained.length === 0 && (
        <p className="text-center text-sm text-text-soft">
          Coche au moins une tâche pour planifier ta journée.
        </p>
      )}

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onConfirm}
          disabled={confirming || retained.length === 0}
          className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {confirming ? 'Planification…' : 'Planifier ma journée →'}
        </button>
        <p className="text-sm text-text-soft text-center max-w-md">
          💡 Tout est modifiable en 1 clic : durée, priorité, ou abandon de la tâche.
        </p>
      </div>
    </div>
  );
};

export default BrainDumpReview;
