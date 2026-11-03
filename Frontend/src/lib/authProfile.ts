/**
 * Profil minimal conservé sur l'appareil pour rouvrir l'application hors
 * ligne. Sans lui, le chargement de `/user` échoue sans réseau et l'utilisateur
 * est renvoyé à la page de connexion, alors que son jeton est encore valide.
 *
 * Ce profil ne contient que l'identifiant, le nom et l'email. Il est remplacé à
 * chaque connexion et effacé à la déconnexion.
 */

export interface StoredAuthProfile {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string | null;
}

const STORAGE_KEY = 'timepro_auth_profile';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const saveAuthProfile = (user: StoredAuthProfile): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        profile_photo_url: user.profile_photo_url ?? null,
      })
    );
  } catch {
    // Stockage plein ou désactivé : le mode hors ligne restera limité.
  }
};

export const readAuthProfile = (): StoredAuthProfile | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return null;

    const { id, name, email, profile_photo_url } = parsed;
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return null;
    if (typeof name !== 'string' || typeof email !== 'string') return null;

    return {
      id,
      name,
      email,
      profile_photo_url: typeof profile_photo_url === 'string' ? profile_photo_url : null,
    };
  } catch {
    return null;
  }
};

export const clearAuthProfile = (): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Vrai quand la requête n'a jamais reçu de réponse (réseau coupé, serveur
 * injoignable, délai dépassé). Un 401/403 a, lui, une réponse : le jeton est
 * réellement invalide.
 */
export const isNetworkFailure = (error: unknown): boolean => {
  if (!isRecord(error)) return false;
  const response = error.response;
  if (response === undefined || response === null) return true;
  return false;
};
