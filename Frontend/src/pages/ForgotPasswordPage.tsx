import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, Loader2, AlertCircle, Check, Clock, ArrowLeft } from "lucide-react";
import api from "../lib/axios";

interface ForgotPasswordErrorResponse {
  message?: string;
}

const ForgotPasswordPage = () => {
  const [email, setEmail]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/forgot-password", { email });
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError<ForgotPasswordErrorResponse>(err)) {
        setError(err.response?.data?.message ?? "Une erreur est survenue.");
      } else {
        setError("Une erreur est survenue.");
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
              Pas de panique,<br />ça arrive à tout le monde.
            </h2>
            <p className="text-white/70 text-lg">On vous envoie un lien de réinitialisation.</p>
          </div>
          <p className="text-white/40 text-sm">© 2025 Time Pro.</p>
        </div>
      </div>

      {/* RIGHT form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="max-w-sm w-full mx-auto">

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#7a91a6] hover:text-[#16213e] transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>

          <h1 className="text-3xl font-black text-[#16213e] mb-1">Mot de passe oublié ?</h1>
          <p className="text-[#7a91a6] mb-8">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {success ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-semibold text-emerald-800 mb-1">Email envoyé !</p>
              <p className="text-sm text-emerald-600">
                Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-flex items-center justify-center w-full rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white transition hover:bg-[#0097bc]"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#16213e] mb-1.5">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,180,219,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0097bc] disabled:translate-y-0 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le lien"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
