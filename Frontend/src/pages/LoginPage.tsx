import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Check, Clock } from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const justVerified    = searchParams.get("verified") === "1";
  const alreadyVerified = searchParams.get("already_verified") === "1";
  const successMessage  = location.state?.successMessage;
  const rawRedirect     = searchParams.get("redirect") || "";
  const redirectTo      = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [formData, setFormData]         = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/login", {
        email:    formData.email,
        password: formData.password,
      });

      // Stocke le token ET les infos user dans le contexte
      login(response.data.access_token, response.data.user);
      navigate(redirectTo);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        setError("Identifiants incorrects ou compte non vérifié. Veuillez réessayer.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&fit=crop"
          alt="Paysage inspirant"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#16213e]/70 via-[#0d4f6b]/40 to-[#00B4DB]/30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Time Pro</span>
          </Link>
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Reprenez le contrôle<br />de votre temps.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Planifiez, priorisez et avancez chaque jour avec clarté.
            </p>
          </div>
          <p className="text-white/40 text-sm">© 2025 Time Pro. Tous droits réservés.</p>
        </div>
      </div>

      {/* RIGHT form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="mb-8 flex lg:hidden items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B4DB]">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#16213e]">Time Pro</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-[#16213e] mb-1">Bon retour parmi nous !</h1>
          <p className="text-[#7a91a6] mb-8">Connectez-vous à votre compte Time Pro</p>

          {(justVerified || alreadyVerified || successMessage) && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">
                {justVerified
                  ? "Email vérifié ! Vous pouvez maintenant vous connecter."
                  : alreadyVerified
                  ? "Votre email est déjà vérifié. Connectez-vous."
                  : successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#16213e] mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                <input
                  name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#16213e]">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-[#00B4DB] hover:text-[#0097bc] transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                <input
                  name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-11 py-3 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a91a6] hover:text-[#16213e] transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#00B4DB] focus:ring-[#00B4DB]" />
              <label htmlFor="remember" className="text-sm text-[#7a91a6]">Se souvenir de moi</label>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,180,219,0.30)] transition-all hover:-translate-y-0.5 hover:bg-[#0097bc] disabled:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Ou continuer avec</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button disabled className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-400 cursor-not-allowed" title="Coming soon">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button disabled className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-400 cursor-not-allowed" title="Coming soon">
              <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#7a91a6]">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="font-semibold text-[#00B4DB] hover:text-[#0097bc] transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;