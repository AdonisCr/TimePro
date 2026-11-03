/**
 * Règles pures du mode hors ligne.
 *
 * Ce fichier ne touche ni au navigateur ni au réseau : il peut être testé
 * directement. `offlineStorage` s'appuie dessus pour le stockage réel.
 */

export type OfflineActionType = 'create' | 'update' | 'delete';

export interface OfflineActionLike {
  id: string;
  type: OfflineActionType;
  endpoint: string;
  resourceId?: number;
  /** Identifiant local de la ressource créée (négatif). */
  localId?: number;
  data?: Record<string, unknown>;
}

export type LocalIdMapping = Record<string, number>;

/** Un identifiant local est toujours négatif : aucun risque de collision avec MySQL. */
export const isLocalId = (id: number | null | undefined): boolean =>
  typeof id === 'number' && Number.isInteger(id) && id < 0;

let localIdCounter = 0;

/**
 * Identifiant temporaire unique et négatif.
 * `now * 1000` reste très en dessous de Number.MAX_SAFE_INTEGER.
 */
export const nextLocalId = (now: number = Date.now()): number => {
  localIdCounter += 1;
  return -(now * 1000 + localIdCounter);
};

export const scopeSuffix = (userId: number | null): string =>
  userId === null ? 'anonymous' : String(userId);

// ─── Clés de stockage, séparées par utilisateur ─────────────────
export const cacheStorageKey = (userId: number, key: string): string =>
  `timepro_u${scopeSuffix(userId)}_cache_${key}`;

export const cacheKeyPrefix = (userId: number): string =>
  `timepro_u${scopeSuffix(userId)}_cache_`;

export const queueStorageKey = (userId: number): string =>
  `timepro_u${scopeSuffix(userId)}_pending`;

export const failuresStorageKey = (userId: number): string =>
  `timepro_u${scopeSuffix(userId)}_failures`;

export const idMapStorageKey = (userId: number): string =>
  `timepro_u${scopeSuffix(userId)}_idmap`;

export const userDataStorageKey = (userId: number, key: string): string =>
  `timepro_u${scopeSuffix(userId)}_user_${key}`;

/** Anciennes clés globales (avant la séparation par utilisateur). */
export const LEGACY_STORAGE_PREFIXES = [
  'timepro_cache_',
  'timepro_pending_actions',
  'timepro_failures_',
  'timepro_user_',
  'timepro_id_map',
];

// ─── Correspondance identifiant local → identifiant serveur ─────
export const resolveLocalId = (
  id: number,
  mapping: LocalIdMapping
): number | null => {
  if (!isLocalId(id)) return id;
  const mapped = mapping[String(id)];
  return typeof mapped === 'number' && mapped > 0 ? mapped : null;
};

export const registerMapping = (
  mapping: LocalIdMapping,
  localId: number,
  serverId: number
): LocalIdMapping => {
  if (!isLocalId(localId) || !Number.isInteger(serverId) || serverId <= 0) return mapping;
  return { ...mapping, [String(localId)]: serverId };
};

/** Identifiants locaux encore en attente de création côté serveur. */
export const pendingLocalIds = (actions: OfflineActionLike[]): Set<number> => {
  const ids = new Set<number>();
  actions.forEach((action) => {
    if (action.type === 'create' && isLocalId(action.localId)) {
      ids.add(action.localId as number);
    }
  });
  return ids;
};

const isReferenceKey = (key: string): boolean =>
  key === 'id' || key === 'depends_on' || key.endsWith('_id');

export interface ResolvedReferences {
  data: Record<string, unknown> | undefined;
  blocked: boolean;
}

/**
 * Remplace les identifiants locaux présents dans les données envoyées à l'API
 * (`task_id`, `project_id`, `parent_id`, `depends_on`...) par les identifiants
 * serveur correspondants.
 *
 * - si la ressource référencée n'est pas encore créée : `blocked = true`,
 *   l'action sera rejouée plus tard ;
 * - si elle a été abandonnée : la référence est mise à `null`.
 */
export const resolveLocalReferences = (
  data: Record<string, unknown> | undefined,
  mapping: LocalIdMapping,
  waitingLocalIds: Set<number>
): ResolvedReferences => {
  if (!data) return { data, blocked: false };

  let blocked = false;
  const resolved: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (!isReferenceKey(key) || typeof value !== 'number' || !isLocalId(value)) {
      resolved[key] = value;
      return;
    }

    const mapped = resolveLocalId(value, mapping);
    if (mapped !== null) {
      resolved[key] = mapped;
      return;
    }

    if (waitingLocalIds.has(value)) {
      blocked = true;
      resolved[key] = value;
      return;
    }

    // La ressource référencée n'existe plus : on détache proprement.
    resolved[key] = null;
  });

  return { data: resolved, blocked };
};

// ─── Politique de nouvelle tentative ────────────────────────────
/**
 * `undefined` = pas de réponse (réseau coupé) → on réessaie.
 * 409 = une synchronisation identique est déjà en cours → on réessaie.
 */
export const isRetryableStatus = (status?: number): boolean => {
  if (status === undefined) return true;
  if ([401, 408, 409, 425, 429].includes(status)) return true;
  return status >= 500;
};

export const isDefinitiveFailure = (status?: number): boolean => !isRetryableStatus(status);
