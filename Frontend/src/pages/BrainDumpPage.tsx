import { useCallback, useState } from 'react';
import { api } from '../lib/axios';
import BrainDumpStep1 from '../components/dashboard/braindump/BrainDumpStep1';
import BrainDumpReview from '../components/dashboard/braindump/BrainDumpReview';
import BrainDumpPlan from '../components/dashboard/braindump/BrainDumpPlan';
import type {
  BrainDumpItem,
  BrainDumpItemPatch,
  BrainDumpResponse,
  ConfirmResponse,
  Plan,
} from '../lib/braindump';

type Stage = 'input' | 'review' | 'plan';

const STAGES: Stage[] = ['input', 'review', 'plan'];

const BrainDumpPage = () => {
  const [stage, setStage] = useState<Stage>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [failedPatch, setFailedPatch] = useState<{ id: number; patch: BrainDumpItemPatch } | null>(
    null
  );
  const [brainDumpId, setBrainDumpId] = useState<number | null>(null);
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [lastText, setLastText] = useState('');

  const analyze = useCallback(async (text: string) => {
    setLastText(text);
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<BrainDumpResponse>('/brain-dump', { text });
      setBrainDumpId(data.id);
      setItems(data.items);
      setStage('review');
    } catch {
      setError("Impossible d'analyser tes idées. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPlan = useCallback(async () => {
    if (brainDumpId === null) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<ConfirmResponse>(`/brain-dump/${brainDumpId}/confirm`, {});
      setPlan(data.plan);
      setStage('plan');
    } catch {
      setError('La planification a échoué. Tes choix sont conservés, réessaie.');
    } finally {
      setLoading(false);
    }
  }, [brainDumpId]);

  const patchItem = useCallback(async (id: number, patch: BrainDumpItemPatch) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...patch } : item)));
    try {
      await api.put(`/brain-dump/items/${id}`, patch);
      setFailedPatch(null);
      setSaveError(null);
    } catch {
      setFailedPatch({ id, patch });
      setSaveError('Impossible de sauvegarder la dernière modification.');
    }
  }, []);

  const retryFailedPatch = useCallback(() => {
    if (failedPatch) {
      patchItem(failedPatch.id, failedPatch.patch);
    }
  }, [failedPatch, patchItem]);

  const retry = useCallback(() => {
    if (stage === 'review') {
      confirmPlan();
    } else if (stage === 'input' && lastText) {
      analyze(lastText);
    }
  }, [stage, lastText, analyze, confirmPlan]);

  const stageIndex = STAGES.indexOf(stage);

  const loadingLabel =
    stage === 'review' ? 'Planification de ta journée…' : 'Analyse de tes idées…';

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light via-white to-primary/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STAGES.map((s, index) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === stageIndex
                  ? 'w-12 bg-primary'
                  : index < stageIndex
                  ? 'w-2 bg-primary/60'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={retry}
              className="shrink-0 px-4 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {saveError && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <span className="text-sm text-orange-700">{saveError}</span>
            <button
              onClick={retryFailedPatch}
              className="shrink-0 px-4 py-1.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {stage === 'input' && <BrainDumpStep1 onSubmit={analyze} loading={loading} />}

        {stage === 'review' && (
          <BrainDumpReview
            items={items}
            onPatch={patchItem}
            onConfirm={confirmPlan}
            confirming={loading}
          />
        )}

        {stage === 'plan' && plan && <BrainDumpPlan plan={plan} />}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-medium text-text-soft">{loadingLabel}</p>
        </div>
      )}
    </div>
  );
};

export default BrainDumpPage;
