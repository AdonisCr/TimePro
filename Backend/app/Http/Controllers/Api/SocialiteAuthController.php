<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteAuthController extends Controller
{
    /**
     * Redirect to provider (Google/Facebook)
     * GET /api/auth/{provider}
     */
    public function redirect(string $provider): RedirectResponse
    {
        $this->validateProvider($provider);

        return Socialite::driver($provider)
            ->scopes($this->getScopes($provider))
            ->redirect();
    }

    /**
     * Handle callback from provider
     * GET /api/auth/{provider}/callback
     */
    public function callback(string $provider): RedirectResponse
    {
        $this->validateProvider($provider);

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect($frontendUrl . '/login?error=oauth_failed');
        }

        $email = $socialUser->getEmail();

        // Un compte sans email ne peut pas être relié de façon sûre.
        if (empty($email)) {
            return redirect($frontendUrl . '/login?error=oauth_email_missing');
        }

        // On ne relie un compte que si le fournisseur garantit que
        // l'adresse lui appartient bien.
        if (!$this->providerEmailIsVerified($provider, $socialUser)) {
            return redirect($frontendUrl . '/login?error=oauth_email_unverified');
        }

        $email = Str::lower($email);

        // Compte fournisseur déjà relié → connexion directe.
        $providerAccount = UserProvider::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($providerAccount && $providerAccount->user) {
            $user = $providerAccount->user;

            // Le fournisseur vient de prouver la propriété de l'adresse.
            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            return $this->redirectWithCode($user, $frontendUrl);
        }

        // Adresse déjà utilisée par un compte local → liaison.
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            $this->linkProvider($existingUser, $provider, $socialUser);

            if (!$existingUser->hasVerifiedEmail()) {
                $existingUser->markEmailAsVerified();
            }

            return $this->redirectWithCode($existingUser, $frontendUrl);
        }

        // Nouveau compte.
        $user = DB::transaction(function () use ($provider, $socialUser, $email) {
            $user = User::create([
                'name'     => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Utilisateur',
                'email'    => $email,
                'password' => null, // Pas de mot de passe pour un compte OAuth
            ]);

            $user->markEmailAsVerified();

            $this->linkProvider($user, $provider, $socialUser);

            // Préférences par défaut
            $user->preferences()->create([]);

            return $user;
        });

        return $this->redirectWithCode($user, $frontendUrl);
    }

    /**
     * Échange un code à usage unique contre un token Sanctum.
     * POST /api/auth/oauth/exchange
     *
     * Le token n'apparaît ainsi jamais dans l'URL, l'historique du
     * navigateur ou les logs du serveur web.
     */
    public function exchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:128'],
        ]);

        $userId = Cache::pull($this->exchangeCacheKey($validated['code']));

        if (!$userId) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 422);
        }

        $token = $user->createToken('auth_token', [], now()->addHours(24))->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => 24 * 60,
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Get linked providers for current user
     * GET /api/auth/providers
     */
    public function getProviders(): JsonResponse
    {
        $providers = UserProvider::where('user_id', auth()->id())
            ->get(['provider', 'created_at'])
            ->map(fn($p) => [
                'provider' => $p->provider,
                'connected_at' => $p->created_at,
            ]);

        return response()->json([
            'providers' => $providers,
            'available' => ['google', 'facebook'],
        ]);
    }

    /**
     * Unlink a provider
     * DELETE /api/auth/providers/{provider}
     */
    public function unlinkProvider(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        $user = auth()->user();

        // Don't allow unlinking if it's the only auth method and user has no password
        $hasPassword = !is_null($user->password);
        $providerCount = UserProvider::where('user_id', $user->id)->count();

        if (!$hasPassword && $providerCount <= 1) {
            return response()->json([
                'message' => 'Vous devez définir un mot de passe avant de déconnecter ce provider.',
            ], 422);
        }

        UserProvider::where('user_id', $user->id)
            ->where('provider', $provider)
            ->delete();

        return response()->json(['message' => 'Compte déconnecté avec succès.']);
    }

    // ─── Helpers ───────────────────────────────────────────────

    private function validateProvider(string $provider): void
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404, 'Provider non supporté.');
        }
    }

    private function getScopes(string $provider): array
    {
        return match ($provider) {
            'google'   => ['email', 'profile'],
            'facebook' => ['email', 'public_profile'],
            default    => [],
        };
    }

    private function linkProvider(User $user, string $provider, $socialUser): void
    {
        UserProvider::updateOrCreate(
            [
                'provider'    => $provider,
                'provider_id' => $socialUser->getId(),
            ],
            [
                'user_id'       => $user->id,
                'access_token'  => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
                'expires_at'    => $socialUser->expiresIn
                    ? now()->addSeconds($socialUser->expiresIn)
                    : null,
            ]
        );
    }

    private function redirectWithCode(User $user, string $frontendUrl): RedirectResponse
    {
        // Un seul token actif à la fois.
        $user->tokens()->delete();

        $code = Str::random(64);

        Cache::put($this->exchangeCacheKey($code), $user->id, now()->addMinutes(2));

        return redirect($frontendUrl . '/auth/callback?code=' . urlencode($code));
    }

    private function exchangeCacheKey(string $code): string
    {
        return 'oauth_exchange:' . hash('sha256', $code);
    }

    /**
     * Vérifie que le fournisseur garantit la propriété de l'adresse email.
     */
    private function providerEmailIsVerified(string $provider, $socialUser): bool
    {
        $raw = $socialUser->getRaw();

        return match ($provider) {
            'google' => filter_var($raw['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN),
            // Facebook ne renvoie pas de drapeau explicite : l'API ne
            // communique l'email que pour un compte disposant d'une adresse
            // valide. On s'appuie donc sur sa présence (vérifiée plus haut).
            'facebook' => true,
            default => false,
        };
    }
}
