<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProvider;
use App\Notifications\EmailAddressChanged;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Contracts\Provider as SocialiteProvider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Le throttle par IP est teste separement ; on le neutralise ici pour
        // eviter que les tests se bloquent entre eux.
        $this->withoutMiddleware(ThrottleRequests::class);

        config(['app.frontend_url' => 'http://localhost:5173']);
    }

    // ─── Connexion et verification email (S-2) ─────────────────

    public function test_un_compte_non_verifie_ne_peut_pas_se_connecter(): void
    {
        $user = User::factory()->unverified()->create(['password' => 'Password123!']);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJson(['email_not_verified' => true]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_un_compte_verifie_peut_se_connecter(): void
    {
        $user = User::factory()->create(['password' => 'Password123!']);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['access_token', 'token_type', 'expires_in', 'user' => ['id', 'name', 'email']]);
    }

    public function test_le_renvoi_de_verification_est_public_et_neutre(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/email/resend', [
            'email' => 'inconnu-' . uniqid() . '@example.com',
        ]);

        $response->assertOk()->assertJsonStructure(['message']);
        Notification::assertNothingSent();
    }

    public function test_le_renvoi_de_verification_envoie_un_email_a_un_compte_non_verifie(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertOk();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_le_renvoi_de_verification_ne_fait_rien_pour_un_compte_deja_verifie(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/email/resend', ['email' => $user->email])
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_le_renvoi_est_limite_a_trois_demandes_par_email(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/email/resend', ['email' => $user->email])->assertOk();
        }

        $this->postJson('/api/email/resend', ['email' => $user->email])->assertStatus(429);

        Notification::assertSentToTimes($user, VerifyEmail::class, 3);
    }

    public function test_le_renvoi_exige_une_adresse_email_valide(): void
    {
        $this->postJson('/api/email/resend', ['email' => 'pas-un-email'])
            ->assertStatus(422);
    }

    // ─── Changement d'email (S-1) ──────────────────────────────

    public function test_changer_d_email_sans_mot_de_passe_actuel_est_refuse(): void
    {
        $user = User::factory()->create(['password' => 'Password123!']);

        $response = $this->withToken($this->tokenFor($user))
            ->putJson('/api/user', [
                'name'  => $user->name,
                'email' => 'nouvelle-' . uniqid() . '@example.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('current_password');

        $this->assertSame($user->email, $user->fresh()->email);
    }

    public function test_changer_d_email_avec_un_mauvais_mot_de_passe_est_refuse(): void
    {
        $user = User::factory()->create(['password' => 'Password123!']);

        $response = $this->withToken($this->tokenFor($user))
            ->putJson('/api/user', [
                'name'             => $user->name,
                'email'            => 'nouvelle-' . uniqid() . '@example.com',
                'current_password' => 'MauvaisMotDePasse1!',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('current_password');

        $this->assertSame($user->email, $user->fresh()->email);
    }

    public function test_changer_d_email_verifie_le_mot_de_passe_et_previent_l_ancienne_adresse(): void
    {
        Notification::fake();

        $user = User::factory()->create(['password' => 'Password123!']);
        $oldEmail = $user->email;
        $newEmail = 'nouvelle-' . uniqid() . '@example.com';

        $response = $this->withToken($this->tokenFor($user))
            ->putJson('/api/user', [
                'name'             => $user->name,
                'email'            => $newEmail,
                'current_password' => 'Password123!',
            ]);

        $response->assertOk()
            ->assertJson(['email_changed' => true]);

        $user->refresh();
        $this->assertSame($newEmail, $user->email);
        $this->assertNull($user->email_verified_at, 'La nouvelle adresse doit redevenir non verifiee.');

        Notification::assertSentOnDemand(
            EmailAddressChanged::class,
            function (EmailAddressChanged $notification, array $channels, object $notifiable) use ($oldEmail) {
                return $notifiable->routes['mail'] === $oldEmail;
            }
        );

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_modifier_uniquement_le_nom_ne_demande_pas_de_mot_de_passe(): void
    {
        $user = User::factory()->create(['password' => 'Password123!']);

        $response = $this->withToken($this->tokenFor($user))
            ->putJson('/api/user', [
                'name'  => 'Nouveau nom',
                'email' => $user->email,
            ]);

        $response->assertOk()
            ->assertJson(['email_changed' => false]);

        $this->assertSame('Nouveau nom', $user->fresh()->name);
    }

    public function test_un_compte_sans_mot_de_passe_ne_peut_pas_changer_d_email(): void
    {
        $user = User::factory()->create(['password' => null]);

        $response = $this->withToken($this->tokenFor($user))
            ->putJson('/api/user', [
                'name'             => $user->name,
                'email'            => 'nouvelle-' . uniqid() . '@example.com',
                'current_password' => 'PeuImporte1!',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_changer_le_mot_de_passe_deconnecte_les_autres_sessions(): void
    {
        $user = User::factory()->create(['password' => 'Password123!']);

        $current = $user->createToken('courante');
        $other = $user->createToken('autre-appareil');

        $this->withToken($current->plainTextToken)
            ->postJson('/api/user/password', [
                'current_password'      => 'Password123!',
                'password'              => 'NouveauPass1!',
                'password_confirmation' => 'NouveauPass1!',
            ])
            ->assertOk();

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $current->accessToken->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $other->accessToken->id]);
    }

    // ─── OAuth (S-3) ───────────────────────────────────────────

    public function test_le_code_d_echange_oauth_est_a_usage_unique(): void
    {
        $user = User::factory()->create();
        $code = 'code-' . uniqid();

        Cache::put('oauth_exchange:' . hash('sha256', $code), $user->id, now()->addMinutes(2));

        $this->postJson('/api/auth/oauth/exchange', ['code' => $code])
            ->assertOk()
            ->assertJsonStructure(['access_token', 'user' => ['id', 'email']]);

        $this->postJson('/api/auth/oauth/exchange', ['code' => $code])
            ->assertStatus(422);
    }

    public function test_un_code_d_echange_invalide_est_refuse(): void
    {
        $this->postJson('/api/auth/oauth/exchange', ['code' => 'n-importe-quoi'])
            ->assertStatus(422);
    }

    public function test_oauth_redirige_avec_un_code_et_non_avec_le_token(): void
    {
        $this->mockSocialite('google', [
            'id'             => 'google-123',
            'name'           => 'Utilisateur OAuth',
            'email'          => 'oauth-' . uniqid() . '@example.com',
            'token'          => 'provider-access-token',
            'refreshToken'   => 'provider-refresh-token',
            'expiresIn'      => 3600,
            'raw'            => ['email_verified' => true],
        ]);

        $response = $this->get('/api/auth/google/callback');

        $response->assertRedirect();
        $location = $response->headers->get('Location');

        $this->assertStringStartsWith('http://localhost:5173/auth/callback?code=', $location);
        $this->assertStringNotContainsString('token=', $location);
        $this->assertStringNotContainsString('access_token', $location);

        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
        $this->assertNotEmpty($query['code'] ?? null);

        $email = User::where('email', 'like', 'oauth-%@example.com')->value('email');
        $this->assertNotNull($email);

        $user = User::where('email', $email)->first();
        $this->assertNotNull($user->email_verified_at);

        // Le token fournisseur doit etre chiffre en base.
        $raw = DB::table('user_providers')->first();
        $this->assertNotSame('provider-access-token', $raw->access_token);
        $this->assertSame('provider-access-token', UserProvider::first()->access_token);

        // Le code permet bien d'obtenir un token Sanctum.
        $this->postJson('/api/auth/oauth/exchange', ['code' => $query['code']])
            ->assertOk()
            ->assertJsonStructure(['access_token']);
    }

    public function test_oauth_refuse_un_email_fournisseur_non_verifie(): void
    {
        $email = 'non-verifie-' . uniqid() . '@example.com';

        $this->mockSocialite('google', [
            'id'    => 'google-999',
            'name'  => 'Non Verifie',
            'email' => $email,
            'raw'   => ['email_verified' => false],
        ]);

        $this->get('/api/auth/google/callback')
            ->assertRedirect('http://localhost:5173/login?error=oauth_email_unverified');

        $this->assertDatabaseMissing('users', ['email' => $email]);
    }

    public function test_oauth_refuse_un_compte_sans_email(): void
    {
        $this->mockSocialite('facebook', [
            'id'    => 'facebook-999',
            'name'  => 'Sans Email',
            'email' => null,
            'raw'   => [],
        ]);

        $this->get('/api/auth/facebook/callback')
            ->assertRedirect('http://localhost:5173/login?error=oauth_email_missing');
    }

    public function test_oauth_relie_un_compte_existant_et_le_marque_verifie(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'existant-' . uniqid() . '@example.com',
        ]);

        $this->mockSocialite('google', [
            'id'    => 'google-' . uniqid(),
            'name'  => $user->name,
            'email' => $user->email,
            'raw'   => ['email_verified' => true],
        ]);

        $this->get('/api/auth/google/callback')->assertRedirect();

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseHas('user_providers', ['user_id' => $user->id, 'provider' => 'google']);
    }

    // ─── Helpers ───────────────────────────────────────────────

    private function tokenFor(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function mockSocialite(string $provider, array $data): void
    {
        $socialUser = new SocialiteUser();
        $socialUser->id = $data['id'];
        $socialUser->name = $data['name'];
        $socialUser->email = $data['email'];
        $socialUser->token = $data['token'] ?? 'token';
        $socialUser->refreshToken = $data['refreshToken'] ?? null;
        $socialUser->expiresIn = $data['expiresIn'] ?? null;
        $socialUser->user = $data['raw'] ?? [];

        $driver = Mockery::mock(SocialiteProvider::class);
        $driver->shouldReceive('user')->once()->andReturn($socialUser);

        Socialite::shouldReceive('driver')->once()->with($provider)->andReturn($driver);
    }
}
