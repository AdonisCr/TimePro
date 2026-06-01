import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  Clock,
} from "lucide-react";
import api from "../lib/axios";
import { PasswordRules } from "../components/Passwordrules";

interface ResetPasswordErrorResponse {
  message?: string;
}

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Laravel envoie ?token=xxx&email=yyy dans le lien
  const token = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/reset-password", { ...formData, token });
      navigate("/login", {
        state: {
          successMessage: "Mot de passe réinitialisé ! Connectez-vous.",
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError<ResetPasswordErrorResponse>(err)) {
        setError(err.response?.data?.message ?? "Lien invalide ou expiré.");
      } else {
        setError("Lien invalide ou expiré.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85&fit=crop"
          alt=""
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
              Choisissez un
              <br />
              nouveau mot de passe.
            </h2>
            <p className="text-white/70 text-lg">
              Utilisez au moins 8 caractères avec des chiffres et des
              majuscules.
            </p>
          </div>
          <p className="text-white/40 text-sm">© 2025 Time Pro.</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-[#16213e] mb-1">
            Nouveau mot de passe
          </h1>
          <p className="text-[#7a91a6] mb-8">
            Choisissez un mot de passe sécurisé pour votre compte.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (pré-rempli, readonly) */}
            <div>
              <label className="block text-sm font-medium text-[#16213e] mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={!!emailFromUrl}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#16213e] outline-none focus:border-[#00B4DB] focus:ring-2 focus:ring-[#00B4DB]/15"
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-[#16213e] mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 py-3 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a91a6] hover:text-[#16213e] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <PasswordRules password={formData.password} />
            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-[#16213e] mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                <input
                  name="password_confirmation"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 py-3 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a91a6] hover:text-[#16213e] transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.password_confirmation && (
                <p
                  className={`mt-1 text-xs flex items-center gap-1 ${formData.password === formData.password_confirmation ? "text-emerald-600" : "text-red-500"}`}
                >
                  {formData.password === formData.password_confirmation ? (
                    <>
                      <Check className="h-3 w-3" /> Les mots de passe
                      correspondent
                    </>
                  ) : (
                    "Les mots de passe ne correspondent pas"
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                formData.password !== formData.password_confirmation
              }
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,180,219,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0097bc] disabled:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
