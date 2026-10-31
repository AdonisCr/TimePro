/**
 * Offline Storage Manager
 * Gère la synchronisation localStorage <-> API avec détection de connectivité
 */

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  resourceId?: number;
  data?: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

class OfflineStorage {
  private static instance: OfflineStorage;
  private isOnline: boolean = navigator.onLine;
  private pendingActions: OfflineAction[] = [];
  private listeners: Set<() => void> = new Set();
  private readonly CACHE_VERSION = 1;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.loadPendingActions();
    this.setupConnectivityListeners();
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  private loadPendingActions() {
    try {
      const stored = localStorage.getItem('timepro_pending_actions');
      if (stored) {
        this.pendingActions = JSON.parse(stored);
      }
    } catch {
      this.pendingActions = [];
    }
  }

  private savePendingActions() {
    try {
      localStorage.setItem('timepro_pending_actions', JSON.stringify(this.pendingActions));
    } catch {
      console.error('Failed to save pending actions');
    }
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.filter(a => !a.synced).length;
  }

  // Cache methods
  setCache<T>(key: string, data: T): void {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
      };
      localStorage.setItem(`timepro_cache_${key}`, JSON.stringify(cached));
    } catch {
      console.error('Failed to set cache');
    }
  }

  getCache<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`timepro_cache_${key}`);
      if (!stored) return null;

      const cached: CachedData<T> = JSON.parse(stored);
      
      // Check version
      if (cached.version !== this.CACHE_VERSION) {
        localStorage.removeItem(`timepro_cache_${key}`);
        return null;
      }

      // Check expiry
      if (Date.now() - cached.timestamp > this.CACHE_EXPIRY) {
        localStorage.removeItem(`timepro_cache_${key}`);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  clearCache(pattern?: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('timepro_cache_')) {
        if (!pattern || key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Offline action queue
  addPendingAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): string {
    const id = this.generateId();
    const newAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      synced: false,
    };
    this.pendingActions.push(newAction);
    this.savePendingActions();
    this.notifyListeners();
    return id;
  }

  markActionSynced(id: string): void {
    this.pendingActions = this.pendingActions.map(a => 
      a.id === id ? { ...a, synced: true } : a
    );
    this.savePendingActions();
    this.notifyListeners();
  }

  removeAction(id: string): void {
    this.pendingActions = this.pendingActions.filter(a => a.id !== id);
    this.savePendingActions();
    this.notifyListeners();
  }

  getPendingActions(): OfflineAction[] {
    return this.pendingActions.filter(a => !a.synced);
  }

  async syncPendingActions(): Promise<void> {
    const pending = this.getPendingActions();
    if (pending.length === 0) return;

    for (const action of pending) {
      try {
        const axios = (await import('../lib/axios')).default;
        
        switch (action.type) {
          case 'create':
            await axios.post(action.endpoint, action.data);
            break;
          case 'update':
            if (action.resourceId === undefined) {
              this.removeAction(action.id);
              break;
            }
            await axios.put(`${action.endpoint}/${action.resourceId}`, action.data);
            break;
          case 'delete':
            if (action.resourceId === undefined) {
              this.removeAction(action.id);
              break;
            }
            await axios.delete(`${action.endpoint}/${action.resourceId}`);
            break;
        }
        
        this.markActionSynced(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }
  }

  // User data storage
  setUser(key: string, value: unknown): void {
    try {
      localStorage.setItem(`timepro_user_${key}`, JSON.stringify(value));
    } catch {
      console.error('Failed to save user data');
    }
  }

  getUser<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`timepro_user_${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  clearUser(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('timepro_user_') || key.startsWith('timepro_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const offlineStorage = OfflineStorage.getInstance();
export type { OfflineAction };
