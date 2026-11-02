<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\User;
use App\Notifications\EmailAddressChanged;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─── Inscription ────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()   // au moins 1 majuscule + 1 minuscule
                    ->numbers()     // au moins 1 chiffre
                    ->symbols(),    // au moins 1 caractère spécial
            ],
        ], [
            'name.required'      => 'Le nom est obligatoire.',
            'email.required'     => 'L\'adresse email est obligatoire.',
            'email.email'        => 'L\'adresse email n\'est pas valide.',
            'email.unique'       => 'Cette adresse email est déjà utilisée.',
            'password.required'  => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            'password.min'       => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (app()->environment('local')) {
            $user->markEmailAsVerified();
        } else {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                // Le compte existe : une panne SMTP ne doit pas faire échouer
                // l'inscription. L'utilisateur pourra demander un nouveau lien.
                report($e);
            }
        }

        TeamInvitation::where('email', $user->email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->each(function (TeamInvitation $invitation) use ($user) {
                $exists = TeamMember::where('team_id', $invitation->team_id)
                    ->where('user_id', $user->id)
                    ->exists();

                if (!$exists) {
                    TeamMember::create([
                        'team_id' => $invitation->team_id,
                        'user_id' => $user->id,
                        'role' => $invitation->role,
                    ]);
                }

                $invitation->update(['accepted_at' => now()]);
            });

        return response()->json([
            'message' => app()->environment('local')
                ? 'Compte créé ! Vous pouvez vous connecter.'
                : 'Compte créé ! Vérifiez votre email avant de vous connecter.',
            'user'    => $user,
        ], 201);
    }

    // ─── Connexion ──────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (app()->environment('local') && !$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message'            => 'Veuillez vérifier votre email avant de vous connecter.',
                'email_not_verified' => true,
            ], 403);
        }

        // Supprime les anciens tokens pour éviter l'accumulation
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', [], now()->addHours(24))->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => 24 * 60, // minutes
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    // ─── Infos utilisateur connecté ─────────────────────────────
    public function me(Request $request)
    {
        $user = $request->user()->load('preferences');

        return response()->json($user);
    }

    // ─── Vérification email ─────────────────────────────────────
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Lien de vérification invalide.'], 403);
        }

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        if ($user->hasVerifiedEmail()) {
            return redirect($frontendUrl . '/login?already_verified=1');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return redirect($frontendUrl . '/login?verified=1');
    }

    // ─── Renvoi lien de vérification ────────────────────────────
    //
    // Route publique : un compte non vérifié n'a pas de token, il ne peut
    // donc pas s'authentifier. On limite par email (3 demandes / 10 min) en
    // plus du throttle par IP de la route, et on répond toujours de façon
    // neutre pour ne pas révéler si l'adresse existe.
    public function resendVerification(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $email = Str::lower($request->input('email'));
        $limiterKey = 'resend-verification:' . sha1($email);

        if (RateLimiter::tooManyAttempts($limiterKey, 3)) {
            $seconds = RateLimiter::availableIn($limiterKey);

            return response()->json([
                'message' => 'Trop de demandes. Réessayez dans ' . ceil($seconds / 60) . ' minute(s).',
            ], 429);
        }

        RateLimiter::hit($limiterKey, 600);

        $user = User::where('email', $email)->first();

        if ($user && !$user->hasVerifiedEmail()) {
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json([
            'message' => 'Si un compte non vérifié existe pour cette adresse, un email de vérification vient d\'être envoyé.',
        ]);
    }

    // ─── Mot de passe oublié ────────────────────────────────────
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        // Toujours retourner 200 pour ne pas révéler si l'email existe
        return response()->json([
            'message' => 'Si cette adresse email existe, un lien de réinitialisation a été envoyé.',
        ]);
    }

    // ─── Réinitialisation du mot de passe ───────────────────────
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => [
                'required',
                'confirmed',
                PasswordRule::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'password_confirmation' => 'required',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Révoque tous les tokens existants après reset
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        return response()->json(['message' => 'Lien invalide ou expiré.'], 422);
    }

    // ─── Déconnexion ────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // ─── Mise à jour du profil ──────────────────────────────────
    //
    // Changer d'adresse email est une opération sensible : on exige le mot
    // de passe actuel, on remet l'email comme "non vérifié" et on prévient
    // l'ancienne adresse. Sans cela, un simple token volé suffirait à
    // détourner définitivement le compte.
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
            'current_password' => ['nullable', 'string'],
        ]);

        $newEmail = Str::lower($validated['email']);
        $emailChanged = $newEmail !== Str::lower($user->email);

        if ($emailChanged) {
            if (is_null($user->password)) {
                throw ValidationException::withMessages([
                    'email' => 'Définissez d\'abord un mot de passe avant de changer d\'adresse email.',
                ]);
            }

            if (empty($validated['current_password'])) {
                throw ValidationException::withMessages([
                    'current_password' => 'Le mot de passe actuel est obligatoire pour changer d\'adresse email.',
                ]);
            }

            if (!Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => 'Le mot de passe actuel est incorrect.',
                ]);
            }
        }

        unset($validated['current_password']);

        $oldEmail = $user->email;

        if ($emailChanged) {
            // La nouvelle adresse doit être prouvée avant de servir à
            // réinitialiser le mot de passe.
            $validated['email'] = $newEmail;
        }

        $user->update($validated);

        if ($emailChanged) {
            // email_verified_at n'est pas "fillable" : on le modifie
            // explicitement pour éviter qu'un update de masse ne le contourne.
            $user->forceFill(['email_verified_at' => null])->save();

            // Un changement d'email est sensible : on déconnecte les autres
            // appareils, tout en gardant la session courante.
            $this->revokeOtherTokens($user, $request);

            try {
                Notification::route('mail', $oldEmail)
                    ->notify(new EmailAddressChanged($user->name, $oldEmail, $newEmail));

                if (!app()->environment('local')) {
                    $user->sendEmailVerificationNotification();
                }
            } catch (\Throwable $e) {
                // L'email a bien été changé en base : une panne d'envoi ne
                // doit pas transformer l'opération en erreur 500.
                report($e);
            }
        }

        return response()->json([
            'message' => $emailChanged
                ? 'Profil mis à jour. Un email de confirmation a été envoyé à votre ancienne adresse.'
                : 'Profil mis à jour',
            'email_changed' => $emailChanged,
            'user' => $user->fresh()->load('preferences'),
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->profile_photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['profile_photo_path' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour',
            'user' => $user->fresh(),
        ]);
    }

    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->profile_photo_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo_path);
            $user->update(['profile_photo_path' => null]);
        }

        return response()->json([
            'message' => 'Photo de profil supprimée',
            'user' => $user->fresh(),
        ]);
    }

    // ─── Changement de mot de passe ─────────────────────────────
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'different:current_password',
                PasswordRule::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        // Les autres sessions ne doivent plus être valides après un
        // changement de mot de passe.
        $this->revokeOtherTokens($user, $request);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }

    /**
     * Supprime les tokens de l'utilisateur sauf celui de la requête courante.
     */
    private function revokeOtherTokens(User $user, Request $request): void
    {
        $current = $request->user()?->currentAccessToken();
        $currentId = $current instanceof \Laravel\Sanctum\PersonalAccessToken
            ? $current->id
            : null;

        $query = $user->tokens();

        if ($currentId !== null) {
            $query->where('id', '!=', $currentId);
        }

        $query->delete();
    }
}