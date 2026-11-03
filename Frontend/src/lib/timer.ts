/**
 * Chronomètre à segments.
 *
 * Un segment représente une période de travail réellement active :
 * `start` = début (timestamp en millisecondes), `end` = fin, ou `null`
 * si le segment est encore en cours.
 *
 * Le temps affiché et enregistré est la somme des segments. Le temps passé
 * en pause n'est donc jamais compté.
 */

export interface TimerSegment {
  start: number;
  end: number | null;
}

export interface TimerState {
  segments: TimerSegment[];
}

export type TimerStatus = 'idle' | 'running' | 'paused';

/** Clé de sauvegarde locale du chronomètre en cours. */
export const ACTIVE_TIMER_STORAGE_KEY = 'timepro_active_timer';

export const createIdleTimer = (): TimerState => ({ segments: [] });

export const startTimer = (now: number): TimerState => ({
  segments: [{ start: now, end: null }],
});

/** Ferme le segment en cours. Sans effet si le chrono est déjà en pause. */
export const pauseTimer = (state: TimerState, now: number): TimerState => {
  const last = state.segments[state.segments.length - 1];
  if (!last || last.end !== null) return state;

  const end = Math.max(last.start, now);
  return {
    segments: [...state.segments.slice(0, -1), { start: last.start, end }],
  };
};

/** Ouvre un nouveau segment. Sans effet si le chrono tourne déjà. */
export const resumeTimer = (state: TimerState, now: number): TimerState => {
  const last = state.segments[state.segments.length - 1];
  if (!last || last.end === null) return state;

  return {
    segments: [...state.segments, { start: Math.max(last.end, now), end: null }],
  };
};

export const getStatus = (state: TimerState): TimerStatus => {
  if (state.segments.length === 0) return 'idle';
  const last = state.segments[state.segments.length - 1];
  return last.end === null ? 'running' : 'paused';
};

/** Temps actif cumulé, en secondes entières. */
export const getElapsedSeconds = (state: TimerState, now: number): number => {
  const totalMs = state.segments.reduce((total, segment) => {
    const end = segment.end === null ? now : segment.end;
    return total + (end - segment.start);
  }, 0);

  return Math.max(0, Math.floor(totalMs / 1000));
};

/** Début de la toute première période de travail, ou `null` si vide. */
export const getFirstStart = (state: TimerState): number | null =>
  state.segments.length > 0 ? state.segments[0].start : null;

export const serializeTimer = (state: TimerState): string =>
  JSON.stringify({ segments: state.segments });

/**
 * Relit un chronomètre stocké localement. Toute donnée incohérente est
 * ignorée (retour `null`) plutôt que de fausser le temps mesuré.
 */
export const parseTimerState = (raw: string | null): TimerState | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.segments) || parsed.segments.length === 0) {
      return null;
    }

    const segments: TimerSegment[] = [];

    for (let index = 0; index < parsed.segments.length; index += 1) {
      const item: unknown = parsed.segments[index];
      if (!isRecord(item)) return null;

      const { start, end } = item;
      if (typeof start !== 'number' || !Number.isFinite(start)) return null;
      if (end !== null && (typeof end !== 'number' || !Number.isFinite(end) || end < start)) {
        return null;
      }

      // Seul le dernier segment peut être encore ouvert.
      if (end === null && index !== parsed.segments.length - 1) return null;

      const previous = segments[segments.length - 1];
      if (previous && start < previous.start) return null;

      segments.push({ start, end: end as number | null });
    }

    const last = segments[segments.length - 1];
    if (last.end === null && last.start > Date.now()) return null;

    return { segments };
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
