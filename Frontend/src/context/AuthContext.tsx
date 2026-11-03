import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "../lib/axios";
import { ACTIVE_TIMER_STORAGE_KEY } from "../lib/timer";
import { offlineStorage } from "../lib/offlineStorage";
import { clearAuthProfile, isNetworkFailure, readAuthProfile, saveAuthProfile } from "../lib/authProfile";

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// ─── Context ─────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  // Au montage : si un token existe, récupère les infos user
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/user");
        // Chaque compte a son propre cache et sa propre file hors ligne.
        offlineStorage.setUserScope(response.data.id);
        saveAuthProfile(response.data);
        setUser(response.data);
        setToken(storedToken);
      } catch (error) {
        // Réseau coupé : le jeton reste valide, on rouvre avec le profil
        // mémorisé pour que le mode hors ligne fonctionne après rechargement.
        if (isNetworkFailure(error)) {
          const profile = readAuthProfile();
          if (profile) {
            offlineStorage.setUserScope(profile.id);
            setUser(profile);
            setToken(storedToken);
            setIsLoading(false);
            return;
          }
        }

        // Token réellement invalide (401) ou profil absent → on nettoie.
        localStorage.removeItem("token");
        localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
        clearAuthProfile();
        offlineStorage.clearUserSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    offlineStorage.setUserScope(userData.id);
    saveAuthProfile(userData);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    // Dernière chance d'envoyer les actions en attente avec le bon compte.
    if (navigator.onLine) {
      try {
        await offlineStorage.syncPendingActions();
      } catch {
        // Les actions restent stockées sous la clé de cet utilisateur.
      }
    }

    try {
      await api.post("/logout");
    } catch {
      // Silencieux si le token est déjà invalide
    } finally {
      localStorage.removeItem("token");
      // Le chronomètre en cours appartient à l'utilisateur qui se déconnecte.
      localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
      clearAuthProfile();
      offlineStorage.clearUserSession();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
};