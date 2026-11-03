/**
 * Offline Storage Manager
 * Gère la synchronisation localStorage <-> API avec détection de connectivité.
 *
 * Principes :
 *  - chaque utilisateur possède son propre cache, sa propre file d'attente et
 *    sa propre table de correspondance (aucun mélange entre comptes) ;
 *  - un élément créé hors ligne reçoit un identifiant négatif, puis la
 *    correspondance vers l'identifiant serveur est enregistrée après envoi ;
 *  - chaque action envoyée porte une clé d'idempotence : un renvoi après une
 *    réponse perdue ne crée pas de doublon ;
 *  - les erreurs définitives (validation, droits, ressource absente) sortent
 *    de la file et sont signalées à l'utilisateur.
 */

import {
  LEGACY_STORAGE_PREFIXES,
  cacheKeyPrefix,
  cacheStorageKey,
  failuresStorageKey,
  idMapStorageKey,
  isLocalId,
  isRetryableStatus,
  nextLocalId as createLocalId,
  pendingLocalIds,
  queueStorageKey,
  registerMapping,
  resolveLocalId,
  resolveLocalReferences,
  userDataStorageKey,
  type LocalIdMapping,
  type OfflineActionType,
} from './offlineQueue';

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  endpoint: string;
  resourceId?: number;
  /** Identifiant local (négatif) de la ressource créée. */
  localId?: number;
  /** URL complète, si elle ne suit pas le schéma `endpoint/resourceId`. */
  url?: string;
  /** Verbe HTTP à utiliser (par défaut : post / put / delete). */
  method?: 'post' | 'put' | 'patch' | 'delete';
  data?: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  userId: number | null;
  idempotencyKey: string;
  attempts: number;
  lastError: string | null;
}

export interface OfflineFailure {
  id: string;
  actionId: string;
  type: OfflineActionType;
  endpoint: string;
  message: string;
  status?: number;
  timestamp: number;
}

export interface SyncResult {
  synced: number;
  failed: number;
  blocked: number;
  remaining: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

type NewOfflineAction = Omit<
  OfflineAction,
  'id' | 'timestamp' | 'synced' | 'userId' | 'idempotencyKey' | 'attempts' | 'lastError'
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const generateIdempotencyKey = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // crypto indisponible (contexte non sécurisé) : repli ci-dessous.
  }
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const defaultMethod = (type: OfflineActionType): 'post' | 'put' | 'delete' => {
  if (type === 'create') return 'post';
  if (type === 'update') return 'put';
  return 'delete';
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (isRecord(error) && isRecord(error.response)) {
    const status = error.response.status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (isRecord(error) && isRecord(error.response) && isRecord(error.response.data)) {
    const message = error.response.data.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue';
};

/** Remplace un identifiant local par son identifiant serveur dans les données mises en cache. */
const rewriteIds = (value: unknown, localId: number, serverId: number): unknown => {
  if (Array.isArray(value)) return value.map((item) => rewriteIds(item, localId, serverId));
  if (!isRecord(value)) return value;

  const next: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, item]) => {
    const isReference = key === 'id' || key === 'depends_on' || key.endsWith('_id');
    next[key] = isReference && item === localId ? serverId : rewriteIds(item, localId, serverId);
  });
  return next;
};

/** Retire un élément jamais synchronisé des données mises en cache. */
const removeById = (value: unknown, localId: number): unknown => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => !(isRecord(item) && item.id === localId))
      .map((item) => removeById(item, localId));
  }
  if (!isRecord(value)) return value;

  const next: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, item]) => {
    next[key] = removeById(item, localId);
  });
  return next;
};

class OfflineStorage {
  private static instance: OfflineStorage;
  private isOnline: boolean = typeof navigator === 'undefined' ? true : navigator.onLine;
  private pendingActions: OfflineAction[] = [];
  private failures: OfflineFailure[] = [];
  private mapping: LocalIdMapping = {};
  private listeners: Set<() => void> = new Set();
  private syncListeners: Set<(result: SyncResult) => void> = new Set();
  private syncing = false;
  private userScope: number | null = null;
  private readonly CACHE_VERSION = 2;
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 jours
  private readonly MAX_FAILURES = 20;

  private constructor() {
    this.purgeLegacyStorage();
    this.setupConnectivityListeners();
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private setupConnectivityListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      void this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /** Supprime les anciennes clés globales, qui pouvaient fuiter entre comptes. */
  private purgeLegacyStorage() {
    if (typeof localStorage === 'undefined') return;

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('timepro_u')) return;
      if (LEGACY_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });
  }

  private readArray<T>(key: string): T[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  private readObject<T extends Record<string, unknown>>(key: string): T {
    if (typeof localStorage === 'undefined') return {} as T;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return {} as T;
      const parsed: unknown = JSON.parse(stored);
      return isRecord(parsed) ? (parsed as T) : ({} as T);
    } catch {
      return {} as T;
    }
  }

  private write(key: string, value: unknown) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save offline data');
    }
  }

  // ─── Portée utilisateur ─────────────────────────────────────
  setUserScope(userId: number | null): void {
    if (this.userScope === userId) return;

    this.userScope = userId;

    if (userId === null) {
      this.pendingActions = [];
      this.failures = [];
      this.mapping = {};
    } else {
      this.pendingActions = this.readArray<OfflineAction>(queueStorageKey(userId));
      this.failures = this.readArray<OfflineFailure>(failuresStorageKey(userId));
      this.mapping = this.readObject<LocalIdMapping>(idMapStorageKey(userId));
    }

    this.notifyListeners();

    // Une session vient de s'ouvrir avec des actions en attente : on tente une
    // synchronisation. C'est le seul déclencheur automatique au démarrage ; les
    // événements « online » et le bouton manuel couvrent le reste (pas de boucle
    // de nouvelles tentatives si le serveur est indisponible).
    if (userId !== null && this.isOnline) {
      void this.syncPendingActions();
    }
  }

  getActiveUserId(): number | null {
    return this.userScope;
  }

  /**
   * Quitte la session courante : vide la mémoire et, par défaut, le cache de
   * cet utilisateur. Les actions non synchronisées restent stockées sous sa
   * propre clé et seront rejouées à sa prochaine connexion (aucune perte).
   */
  clearUserSession(options: { purgeCache?: boolean } = {}): void {
    const { purgeCache = true } = options;

    if (this.userScope !== null && purgeCache) {
      this.clearCache();
    }

    this.userScope = null;
    this.pendingActions = [];
    this.failures = [];
    this.mapping = {};
    this.notifyListeners();
  }

  // ─── Abonnements ────────────────────────────────────────────
  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Prévenu après une synchronisation réelle (pour recharger les listes). */
  subscribeToSync(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  private emitSync(result: SyncResult) {
    this.syncListeners.forEach((listener) => listener(result));
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  // ─── Cache ──────────────────────────────────────────────────
  setCache<T>(key: string, data: T): void {
    if (this.userScope === null) return;

    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      localStorage.setItem(cacheStorageKey(this.userScope, key), JSON.stringify(cached));
    } catch {
      console.error('Failed to set cache');
    }
  }

  getCache<T>(key: string): T | null {
    if (this.userScope === null || typeof localStorage === 'undefined') return null;

    try {
      const storageKey = cacheStorageKey(this.userScope, key);
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const cached: CachedData<T> = JSON.parse(stored);

      if (cached.version !== this.CACHE_VERSION) {
        localStorage.removeItem(storageKey);
        return null;
      }

      if (Date.now() - cached.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  private cacheKeys(): string[] {
    if (this.userScope === null || typeof localStorage === 'undefined') return [];
    const prefix = cacheKeyPrefix(this.userScope);
    return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
  }

  clearCache(pattern?: string): void {
    this.cacheKeys().forEach((key) => {
      if (!pattern || key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  }

  private transformCaches(transform: (value: unknown) => unknown) {
    this.cacheKeys().forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const cached: unknown = JSON.parse(raw);
        if (!isRecord(cached) || !('data' in cached)) return;
        cached.data = transform(cached.data);
        localStorage.setItem(key, JSON.stringify(cached));
      } catch {
        // Cache illisible : on l'ignore, il sera remplacé au prochain chargement.
      }
    });
  }

  private rewriteCachedIds(localId: number, serverId: number) {
    this.transformCaches((value) => rewriteIds(value, localId, serverId));
  }

  private removeCachedId(localId: number) {
    this.transformCaches((value) => removeById(value, localId));
  }

  // ─── Identifiants locaux ────────────────────────────────────
  nextLocalId(): number {
    return createLocalId();
  }

  // ─── File d'attente ─────────────────────────────────────────
  private savePendingActions() {
    if (this.userScope === null) return;
    this.write(queueStorageKey(this.userScope), this.pendingActions);
  }

  private saveFailures() {
    if (this.userScope === null) return;
    this.write(failuresStorageKey(this.userScope), this.failures);
  }

  private saveMapping() {
    if (this.userScope === null) return;
    this.write(idMapStorageKey(this.userScope), this.mapping);
  }

  addPendingAction(action: NewOfflineAction): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      synced: false,
      userId: this.userScope,
      idempotencyKey: generateIdempotencyKey(),
      attempts: 0,
      lastError: null,
    };

    this.pendingActions.push(newAction);
    this.savePendingActions();
    this.notifyListeners();
    return id;
  }

  removeAction(id: string): void {
    this.pendingActions = this.pendingActions.filter((action) => action.id !== id);
    this.savePendingActions();
    this.notifyListeners();
  }

  private markActionFailed(id: string, message: string, status?: number): void {
    this.pendingActions = this.pendingActions.map((action) =>
      action.id === id
        ? {
            ...action,
            attempts: action.attempts + 1,
            lastError: status ? `${status} — ${message}` : message,
          }
        : action
    );
    this.savePendingActions();
  }

  getPendingActions(): OfflineAction[] {
    return this.pendingActions.filter((action) => !action.synced);
  }

  getPendingActionsCount(): number {
    return this.getPendingActions().length;
  }

  // ─── Échecs définitifs ──────────────────────────────────────
  private addFailure(action: OfflineAction, message: string, status?: number): void {
    const failure: OfflineFailure = {
      id: `failure_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      actionId: action.id,
      type: action.type,
      endpoint: action.endpoint,
      message,
      status,
      timestamp: Date.now(),
    };

    this.failures = [failure, ...this.failures].slice(0, this.MAX_FAILURES);
    this.saveFailures();
  }

  getFailures(): OfflineFailure[] {
    return [...this.failures];
  }

  getFailedActionsCount(): number {
    return this.failures.length;
  }

  clearFailures(): void {
    this.failures = [];
    this.saveFailures();
    this.notifyListeners();
  }

  // ─── Synchronisation ────────────────────────────────────────
  async syncPendingActions(): Promise<void> {
    // Évite qu'un double déclenchement (événement "online" + montage d'un
    // écran) envoie deux fois la même action.
    if (this.syncing || this.userScope === null) return;

    const pending = this.getPendingActions();
    if (pending.length === 0) return;

    // Le client HTTP est résolu avant de verrouiller : une erreur de
    // chargement ne laisse pas la synchronisation bloquée.
    const axios = (await import('../lib/axios')).default;
    const scopeAtStart = this.userScope;

    this.syncing = true;
    let synced = 0;
    let failed = 0;
    let blocked = 0;

    try {
      for (const action of pending) {
        // Changement de compte ou déconnexion pendant l'envoi : on s'arrête.
        if (this.userScope !== scopeAtStart) break;

        // L'action a pu être retirée entre-temps.
        if (!this.pendingActions.some((item) => item.id === action.id)) continue;

        const waiting = pendingLocalIds(this.getPendingActions());
        let resourceId = action.resourceId;

        if (action.type !== 'create' && resourceId !== undefined && isLocalId(resourceId)) {
          const resolved = resolveLocalId(resourceId, this.mapping);

          if (resolved === null) {
            if (waiting.has(resourceId)) {
              // La création correspondante est encore dans la file.
              blocked += 1;
              continue;
            }

            // La création a échoué définitivement : l'action n'a plus de cible.
            this.removeAction(action.id);
            this.addFailure(action, 'Élément jamais synchronisé : sa création a été abandonnée.');
            failed += 1;
            continue;
          }

          resourceId = resolved;
        }

        // Les références (`task_id`, `project_id`...) peuvent aussi être locales.
        const resolvedData = resolveLocalReferences(action.data, this.mapping, waiting);
        if (resolvedData.blocked) {
          blocked += 1;
          continue;
        }

        const path =
          action.url ??
          (resourceId !== undefined ? `${action.endpoint}/${resourceId}` : action.endpoint);

        try {
          const response = await axios.request({
            url: path,
            method: action.method ?? defaultMethod(action.type),
            data: resolvedData.data,
            headers: { 'X-Idempotency-Key': action.idempotencyKey },
          });

          // Le compte a pu changer pendant l'attente réseau.
          if (this.userScope !== scopeAtStart) break;

          if (action.type === 'create' && action.localId !== undefined) {
            const serverId = Number(
              isRecord(response.data) ? response.data.id : undefined
            );

            if (Number.isInteger(serverId) && serverId > 0) {
              this.mapping = registerMapping(this.mapping, action.localId, serverId);
              this.saveMapping();
              this.rewriteCachedIds(action.localId, serverId);
            }
          }

          this.removeAction(action.id);
          synced += 1;
        } catch (error) {
          // Déconnexion pendant l'envoi : ne rien écrire sous un autre compte.
          if (this.userScope !== scopeAtStart) break;

          const status = getErrorStatus(error);
          const message = getErrorMessage(error);

          if (isRetryableStatus(status)) {
            // Réseau coupé, serveur indisponible ou synchronisation déjà en
            // cours : l'action reste dans la file.
            this.markActionFailed(action.id, message, status);
          } else {
            if (action.type === 'create' && action.localId !== undefined) {
              this.removeCachedId(action.localId);
            }
            this.removeAction(action.id);
            this.addFailure(action, message, status);
            failed += 1;
          }
        }
      }
    } finally {
      // Si le compte a changé, les tableaux en mémoire appartiennent déjà au
      // nouveau compte : ne jamais les réécrire sous l'ancien.
      if (this.userScope === scopeAtStart) {
        this.savePendingActions();
        this.saveFailures();
        this.saveMapping();
      }
      this.syncing = false;
      this.notifyListeners();

      if (this.userScope === scopeAtStart && (synced > 0 || failed > 0)) {
        this.emitSync({
          synced,
          failed,
          blocked,
          remaining: this.getPendingActionsCount(),
        });
      }
    }
  }

  // ─── Données utilisateur ────────────────────────────────────
  setUser(key: string, value: unknown): void {
    if (this.userScope === null) return;
    this.write(userDataStorageKey(this.userScope, key), value);
  }

  getUser<T>(key: string): T | null {
    if (this.userScope === null || typeof localStorage === 'undefined') return null;
    try {
      const stored = localStorage.getItem(userDataStorageKey(this.userScope, key));
      return stored ? (JSON.parse(stored) as T) : null;
    } catch {
      return null;
    }
  }

  clearUser(): void {
    if (this.userScope === null || typeof localStorage === 'undefined') return;

    const prefix = `timepro_u${this.userScope}_`;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix) && !key.includes('_pending') && !key.includes('_idmap')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const offlineStorage = OfflineStorage.getInstance();
export type { OfflineAction as OfflineActionRecord };
