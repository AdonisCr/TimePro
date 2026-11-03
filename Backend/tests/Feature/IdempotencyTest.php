<?php

namespace Tests\Feature;

use App\Models\IdempotencyKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Tests\TestCase;

class IdempotencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    private function entryPayload(): array
    {
        return [
            'start_time' => now()->subMinutes(30)->toIso8601String(),
            'end_time' => now()->toIso8601String(),
            'duration' => 1800,
            'is_manual' => false,
        ];
    }

    public function test_un_renvoi_avec_la_meme_cle_ne_cree_pas_de_doublon(): void
    {
        $user = User::factory()->create();
        $token = $this->tokenFor($user);
        $key = 'offline-test-1';
        // Le même corps exact : l'empreinte de la requête doit être identique.
        $payload = $this->entryPayload();

        $first = $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', $payload)
            ->assertCreated();

        $second = $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', $payload)
            ->assertCreated()
            ->assertHeader('X-Idempotency-Replayed', 'true');

        $this->assertSame($first->json('id'), $second->json('id'));
        $this->assertDatabaseCount('time_entries', 1);
        $this->assertDatabaseCount('idempotency_keys', 1);
    }

    public function test_sans_cle_deux_requetes_creent_bien_deux_elements(): void
    {
        $user = User::factory()->create();
        $token = $this->tokenFor($user);

        $this->withToken($token)
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertCreated();

        $this->withToken($token)
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertCreated();

        $this->assertDatabaseCount('time_entries', 2);
        $this->assertDatabaseCount('idempotency_keys', 0);
    }

    public function test_la_meme_cle_ne_peut_pas_servir_a_une_autre_requete(): void
    {
        $user = User::factory()->create();
        $token = $this->tokenFor($user);
        $key = 'offline-test-2';

        $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertCreated();

        $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', array_merge($this->entryPayload(), [
                'duration' => 600,
            ]))
            ->assertStatus(422)
            ->assertJsonPath('message', "Cette clé d'idempotence a déjà été utilisée pour une autre requête.");

        $this->assertDatabaseCount('time_entries', 1);
    }

    public function test_deux_utilisateurs_peuvent_utiliser_la_meme_cle(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();
        $key = 'offline-shared';

        $this->withToken($this->tokenFor($first))
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertCreated();

        // En test, le garde d'authentification garde l'utilisateur en mémoire
        // entre deux requêtes HTTP : on le vide pour changer de compte.
        $this->app['auth']->forgetGuards();

        $this->withToken($this->tokenFor($second))
            ->withHeader('X-Idempotency-Key', $key)
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertCreated()
            ->assertHeaderMissing('X-Idempotency-Replayed');

        $this->assertDatabaseCount('time_entries', 2);
        $this->assertDatabaseCount('idempotency_keys', 2);
    }

    public function test_une_cle_trop_longue_est_refusee(): void
    {
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($user))
            ->withHeader('X-Idempotency-Key', str_repeat('a', 192))
            ->postJson('/api/time-entries', $this->entryPayload())
            ->assertStatus(422);

        $this->assertDatabaseCount('time_entries', 0);
        $this->assertDatabaseCount('idempotency_keys', 0);
    }

    public function test_l_arret_d_une_session_de_focus_est_rejoue_sans_erreur(): void
    {
        $user = User::factory()->create();
        $token = $this->tokenFor($user);
        $key = 'offline-focus-stop';

        $session = $this->withToken($token)
            ->postJson('/api/focus/sessions', [
                'method' => 'pomodoro',
                'started_at' => now()->subMinutes(25)->toIso8601String(),
            ])
            ->assertCreated();

        $url = '/api/focus/sessions/'.$session->json('id').'/stop';
        $payload = ['notes' => 'Terminé hors ligne'];

        $first = $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->patchJson($url, $payload)
            ->assertOk();

        $second = $this->withToken($token)
            ->withHeader('X-Idempotency-Key', $key)
            ->patchJson($url, $payload)
            ->assertOk()
            ->assertHeader('X-Idempotency-Replayed', 'true');

        $this->assertSame($first->json('duration_seconds'), $second->json('duration_seconds'));
    }

    public function test_les_cles_anciennes_sont_purgees(): void
    {
        $user = User::factory()->create();

        $old = IdempotencyKey::create([
            'user_id' => $user->id,
            'key' => 'ancienne',
            'request_hash' => str_repeat('a', 64),
        ]);
        $old->forceFill(['created_at' => now()->subDays(30)])->save();

        IdempotencyKey::create([
            'user_id' => $user->id,
            'key' => 'recente',
            'request_hash' => str_repeat('b', 64),
        ]);

        $this->artisan('idempotency:prune')->assertSuccessful();

        $this->assertDatabaseMissing('idempotency_keys', ['key' => 'ancienne']);
        $this->assertDatabaseHas('idempotency_keys', ['key' => 'recente']);
    }

    private function tokenFor(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }
}
