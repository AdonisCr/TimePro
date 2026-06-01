// ── Composant à ajouter dans SignupPage.tsx et ResetPasswordPage.tsx ──
// Importe-le ou colle-le directement dans le fichier

import { Check, X } from "lucide-react";

interface PasswordRulesProps {
  password: string;
}

export const PasswordRules = ({ password }: PasswordRulesProps) => {
  const rules = [
    { label: "8 caractères minimum",         ok: password.length >= 8 },
    { label: "Une majuscule (A-Z)",           ok: /[A-Z]/.test(password) },
    { label: "Une minuscule (a-z)",           ok: /[a-z]/.test(password) },
    { label: "Un chiffre (0-9)",              ok: /[0-9]/.test(password) },
    { label: "Un caractère spécial (!@#...)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <ul className="mt-2 space-y-1">
      {rules.map((r) => (
        <li key={r.label} className={`flex items-center gap-2 text-xs transition-colors ${r.ok ? "text-emerald-600" : "text-[#7a91a6]"}`}>
          {r.ok
            ? <Check className="h-3 w-3 shrink-0" />
            : <X className="h-3 w-3 shrink-0" />}
          {r.label}
        </li>
      ))}
    </ul>
  );
};