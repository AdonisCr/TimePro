<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Tests\TestCase;

class DataProtectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    // ─── Suppressions non destructrices (B-5) ──────────────────

    public function test_supprimer_un_projet_conserve_ses_taches_et_son_historique_de_temps(): void
    {
        $user = User::factory()->create();
        $project = $user->projects()->create(['name' => 'Projet à supprimer']);

        $task = $user->tasks()->create([
            'title' => 'Tâche du projet',
            'project_id' => $project->id,
        ]);

        $entry = $user->timeEntries()->create([
            'task_id' => $task->id,
            'project_id' => $project->id,
            'start_time' => now()->subHour(),
            'duration' => 3600,
        ]);

        $this->withToken($this->tokenFor($user))
            ->deleteJson('/api/projects/' . $project->id)
            ->assertOk();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'project_id' => null]);
        $this->assertDatabaseHas('time_entries', [
            'id' => $entry->id,
            'task_id' => $task->id,
            'project_id' => null,
        ]);
    }

    public function test_supprimer_une_tache_conserve_le_temps_les_sous_taches_et_les_dependances(): void
    {
        $user = User::factory()->create();

        $task = $user->tasks()->create(['title' => 'Tâche principale']);

        $subtask = $user->tasks()->create([
            'title' => 'Sous-tâche',
            'parent_id' => $task->id,
        ]);

        $dependent = $user->tasks()->create([
            'title' => 'Dépend de la tâche',
            'depends_on' => $task->id,
        ]);

        $entry = $user->timeEntries()->create([
            'task_id' => $task->id,
            'start_time' => now()->subMinutes(30),
            'duration' => 1800,
        ]);

        $this->withToken($this->tokenFor($user))
            ->deleteJson('/api/tasks/' . $task->id)
            ->assertOk();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
        $this->assertDatabaseHas('tasks', ['id' => $subtask->id, 'parent_id' => null]);
        $this->assertDatabaseHas('tasks', ['id' => $dependent->id, 'depends_on' => null]);
        $this->assertDatabaseHas('time_entries', ['id' => $entry->id, 'task_id' => null]);
    }

    // ─── Dépendances entre tâches (S-5, S-6) ───────────────────

    public function test_une_tache_ne_peut_pas_dependre_de_la_tache_d_un_autre_utilisateur(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $otherTask = $other->tasks()->create(['title' => 'Tâche privée']);

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/tasks', [
                'title' => 'Tâche de l\'attaquant',
                'depends_on' => $otherTask->id,
            ])
            ->assertStatus(403);

        $this->assertSame(0, $user->tasks()->count());
    }

    public function test_une_dependance_indirecte_formant_une_boucle_est_refusee(): void
    {
        $user = User::factory()->create();

        $taskA = $user->tasks()->create(['title' => 'A']);
        $taskB = $user->tasks()->create(['title' => 'B', 'depends_on' => $taskA->id]);

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/tasks/' . $taskA->id, ['depends_on' => $taskB->id])
            ->assertStatus(400);

        $this->assertNull($taskA->fresh()->depends_on);
    }

    public function test_une_parente_indirecte_formant_une_boucle_est_refusee(): void
    {
        $user = User::factory()->create();

        $parent = $user->tasks()->create(['title' => 'Parent']);
        $child = $user->tasks()->create([
            'title' => 'Enfant',
            'parent_id' => $parent->id,
        ]);

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/tasks/' . $parent->id, ['parent_id' => $child->id])
            ->assertStatus(400);

        $this->assertNull($parent->fresh()->parent_id);
    }

    // ─── Contraintes d'unicité ─────────────────────────────────

    public function test_les_preferences_ne_peuvent_pas_etre_dupliquees(): void
    {
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/preferences', ['timezone' => 'Europe/Paris'])
            ->assertOk();

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/preferences', ['timezone' => 'Europe/London'])
            ->assertOk();

        $this->assertSame(1, $user->preferences()->count());
        $this->assertSame('Europe/London', $user->fresh()->preferences->timezone);
    }

    public function test_un_abonnement_push_identique_n_est_pas_duplique(): void
    {
        $user = User::factory()->create();

        $payload = [
            'endpoint' => 'https://push.example.com/endpoint-unique',
            'keys' => [
                'p256dh' => 'cle-publique',
                'auth' => 'secret-auth',
            ],
        ];

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/notifications/subscribe', $payload)
            ->assertStatus(201);

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/notifications/subscribe', $payload)
            ->assertStatus(201);

        $this->assertSame(1, $user->pushSubscriptions()->count());
    }

    // ─── Helpers ───────────────────────────────────────────────

    private function tokenFor(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }
}
