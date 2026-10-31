<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
    public function callback(string $provider): JsonResponse|RedirectResponse
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            return redirect($frontendUrl . '/login?error=oauth_failed');
        }

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        // Check if provider account already linked
        $providerAccount = UserProvider::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($providerAccount) {
            // Existing user — login
            $user = $providerAccount->user;
            return $this->loginUser($user, $frontendUrl);
        }

        // Check if email already exists
        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            // Link provider to existing account
            UserProvider::create([
                'user_id'      => $existingUser->id,
                'provider'     => $provider,
                'provider_id'  => $socialUser->getId(),
                'access_token' => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
                'expires_at'   => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
            ]);

            return $this->loginUser($existingUser, $frontendUrl);
        }

        // Create new user
        $user = User::create([
            'name'     => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Utilisateur',
            'email'    => $socialUser->getEmail(),
            'password' => null, // No password for OAuth users
        ]);

        $user->markEmailAsVerified();

        // Link provider
        UserProvider::create([
            'user_id'      => $user->id,
            'provider'     => $provider,
            'provider_id'  => $socialUser->getId(),
            'access_token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at'   => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);

        // Auto-create preferences
        $user->preferences()->create([]);

        return $this->loginUser($user, $frontendUrl);
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

    private function loginUser(User $user, string $frontendUrl): JsonResponse|RedirectResponse
    {
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', [], now()->addHours(24))->plainTextToken;

        // Redirect to frontend with token in URL fragment
        return redirect($frontendUrl . '/auth/callback?token=' . $token . '&user=' . urlencode(json_encode([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ])));
    }
}
