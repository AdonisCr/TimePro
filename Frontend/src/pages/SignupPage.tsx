import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Check,
  Clock,
  ArrowRight,
} from "lucide-react";

import api from "../lib/axios";
import { PasswordRules } from "../components/Passwordrules";

interface SignupErrorResponse {
  errors?: Record<string, string[]>;
}

/* ── Post-registration modal: check your email ── */
const EmailVerificationCard = ({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage(null);
    try {
      await api.post("/email/resend", { email });
      setResendMessage("Email renvoyé. Pensez à vérifier vos spams.");
    } catch {
      setResendMessage("Impossible de renvoyer l'email pour le moment.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16213e]/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center animate-[fadeInUp_0.35s_ease]">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f4fb]">
          <Mail className="h-7 w-7 text-[#00B4DB]" />
        </div>

        <h2 className="text-xl font-black text-[#16213e] mb-2">
          Vérifiez votre email !
        </h2>
        <p className="text-sm text-[#7a91a6] leading-relaxed mb-1">
          Un lien de confirmation a été envoyé à
        </p>
        <p className="text-sm font-semibold text-[#16213e] mb-5 break-all">
          {email}
        </p>

        <p className="text-xs text-[#7a91a6] mb-6">
          Cliquez sur le lien dans l'email pour activer votre compte, puis
          revenez vous connecter.
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00B4DB]/30 bg-[#e6f4fb] py-3 text-sm font-semibold text-[#007a94] transition hover:bg-[#d5eefa] disabled:opacity-60"
        >
          {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Renvoyer l'email de vérification
        </button>

        {resendMessage && (
          <p className="mb-4 text-xs text-[#7a91a6]">{resendMessage}</p>
        )}

        <Link
          to="/login"
          onClick={onClose}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,180,219,0.28)] transition hover:bg-[#0097bc]"
        >
          Aller à la connexion
          <ArrowRight className="h-4 w-4" />
        </Link>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

const getPasswordStrength = (password: string) => {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[a-z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
};

const strengthLabels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
const strengthColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-green-600",
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const rawRedirect = searchParams.get("redirect") || "";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "";

  const [showVerifyCard, setShowVerifyCard] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await api.post("/register", {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      setRegisteredEmail(formData.email);
      setShowVerifyCard(true);
    } catch (err: unknown) {
      if (
        axios.isAxiosError<SignupErrorResponse>(err) &&
        err.response?.status === 422
      ) {
        setErrors(err.response.data?.errors ?? {});
      } else {
        setErrors({
          general: ["Une erreur est survenue. Veuillez réessayer."],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      {showVerifyCard && (
        <EmailVerificationCard
          email={registeredEmail}
          onClose={() => navigate(redirectTo ? `/login?redirect=${redirectTo}` : "/login")}
        />
      )}

      <div className="min-h-screen flex">
        {/* ── LEFT: image panel ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85&fit=crop"
            alt="Espace de travail moderne"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#16213e]/75 via-[#0d4f6b]/45 to-[#00B4DB]/25" />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Time Pro</span>
            </Link>

            <div>
              <h2 className="text-4xl font-black leading-tight mb-4">
                Commencez à<br />
                mieux gérer votre
                <br />
                temps dès aujourd'hui.
              </h2>
              <p className="text-white/70 text-lg leading-relaxed max-w-sm">
                Rejoignez 50 000+ professionnels qui avancent avec clarté chaque
                jour.
              </p>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&fit=crop",
                    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop",
                    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=80&q=80&fit=crop",
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="h-8 w-8 rounded-full border-2 border-white/30 object-cover"
                      alt=""
                    />
                  ))}
                </div>
                <p className="text-sm text-white/70">
                  <span className="font-semibold text-white">+50 000</span>{" "}
                  utilisateurs actifs
                </p>
              </div>
            </div>

            <p className="text-white/40 text-sm">
              © 2025 Time Pro. Tous droits réservés.
            </p>
          </div>
        </div>

        {/* ── RIGHT: form panel ── */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-white overflow-y-auto">
          {/* Mobile logo */}
          <div className="mb-6 flex lg:hidden items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B4DB]">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#16213e]">Time Pro</span>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <h1 className="text-3xl font-black text-[#16213e] mb-1">
              Créez votre compte
            </h1>
            <p className="text-[#7a91a6] mb-7">
              Essai gratuit de 14 jours, sans carte bancaire.
            </p>

            {/* General error */}
            {errors.general && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{errors.general[0]}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#16213e] mb-1.5">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                    <input
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jean"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#16213e] mb-1.5">
                    Nom
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[#16213e] mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-red-400" : "text-[#7a91a6]"}`}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vous@exemple.com"
                    className={`w-full rounded-xl border bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2 ${errors.email ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#00B4DB] focus:ring-[#00B4DB]/15"}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[#16213e] mb-1.5">
                  Mot de passe
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-10 py-2.5 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
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
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || "bg-gray-200"}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#7a91a6] shrink-0">
                      {strengthLabels[passwordStrength - 1] || "Aucun"}
                    </span>
                  </div>
                )}
              </div>
<PasswordRules password={formData.password} />
              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-[#16213e] mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a91a6]" />
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-10 py-2.5 text-sm text-[#16213e] placeholder-gray-400 outline-none transition focus:border-[#00B4DB] focus:bg-white focus:ring-2 focus:ring-[#00B4DB]/15"
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
                {formData.confirmPassword && (
                  <p
                    className={`mt-1 text-xs flex items-center gap-1 ${formData.password === formData.confirmPassword ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {formData.password === formData.confirmPassword ? (
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

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  id="terms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#00B4DB] focus:ring-[#00B4DB]"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-[#7a91a6] leading-relaxed"
                >
                  J'accepte les{" "}
                  <a href="#" className="text-[#00B4DB] hover:underline">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="text-[#00B4DB] hover:underline">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.acceptTerms ||
                  formData.password !== formData.confirmPassword
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00B4DB] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,180,219,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#0097bc] disabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">Ou créer avec</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google`}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-[#16213e] transition hover:border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button 
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/facebook`}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-[#16213e] transition hover:border-gray-300 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-[#7a91a6]">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#00B4DB] hover:text-[#0097bc] transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
