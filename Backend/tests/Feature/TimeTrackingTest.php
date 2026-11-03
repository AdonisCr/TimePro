<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TimeTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    // ─── Chronomètre à segments (B-6) ──────────────────────────

    public function test_une_session_avec_pause_conserve_la_duree_active_envoyee(): void
    {
        $user = User::factory()->create();

        $start = now()->subMinutes(40);
        $end = now();

        // 25 min de travail + 5 min de pause + 10 min de travail = 35 min.
        // La plage horaire fait 40 min : c'est bien 2100 s qui doit être gardé.
        $response = $this->withToken($this->tokenFor($user))
            ->postJson('/api/time-entries', [
                'start_time' => $start->toIso8601String(),
                'end_time' => $end->toIso8601String(),
                'duration' => 2100,
                'is_manual' => false,
            ])
            ->assertCreated();

        $this->assertSame(2100, $response->json('duration'));
        $this->assertDatabaseHas('time_entries', [
            'id' => $response->json('id'),
            'duration' => 2100,
        ]);
    }

    public function test_une_duree_negative_est_refusee(): void
    {
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/time-entries', [
                'start_time' => now()->toIso8601String(),
                'duration' => -60,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('duration');
    }

    public function test_les_statistiques_sont_exprimees_en_secondes(): void
    {
        $user = User::factory()->create();

        $user->timeEntries()->create([
            'start_time' => now()->subMinutes(30),
            'duration' => 1800,
        ]);

        $this->withToken($this->tokenFor($user))
            ->getJson('/api/time-entries/stats')
            ->assertOk()
            ->assertJsonPath('today.total_seconds', 1800)
            ->assertJsonPath('today.entries_count', 1);
    }

    // ─── Date réelle de complétion (B-8) ───────────────────────

    public function test_terminer_une_tache_enregistre_sa_date_de_completion(): void
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create(['title' => 'À terminer']);

        $this->assertNull($task->fresh()->completed_at);

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/tasks/' . $task->id, ['status' => 'done'])
            ->assertOk()
            ->assertJsonPath('status', 'done');

        $this->assertNotNull($task->fresh()->completed_at);
    }

    public function test_rouvrir_une_tache_efface_sa_date_de_completion(): void
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create(['title' => 'Terminée', 'status' => 'done']);

        $this->assertNotNull($task->fresh()->completed_at);

        $this->withToken($this->tokenFor($user))
            ->putJson('/api/tasks/' . $task->id, ['status' => 'todo'])
            ->assertOk();

        $this->assertNull($task->fresh()->completed_at);
    }

    public function test_le_rapport_du_jour_utilise_la_date_de_completion(): void
    {
        $user = User::factory()->create();

        $doneToday = $user->tasks()->create(['title' => 'Faite aujourd hui', 'status' => 'done']);
        $doneOlder = $user->tasks()->create(['title' => 'Faite avant', 'status' => 'done']);

        // Cas piège : `updated_at` récent mais complétion ancienne, et inversement.
        DB::table('tasks')->where('id', $doneToday->id)->update([
            'completed_at' => now(),
            'updated_at' => now()->subDays(3),
        ]);
        DB::table('tasks')->where('id', $doneOlder->id)->update([
            'completed_at' => now()->subDays(3),
            'updated_at' => now(),
        ]);

        $response = $this->withToken($this->tokenFor($user))
            ->getJson('/api/focus/report/today')
            ->assertOk();

        $response->assertJsonPath('tasks_done_today', 1);
        $this->assertSame([$doneToday->id], array_column($response->json('tasks_done'), 'id'));
    }

    // ─── Sessions de focus hors ligne (B-9) ────────────────────

    public function test_une_session_de_focus_hors_ligne_est_enregistree_avec_sa_duree(): void
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create(['title' => 'Focus']);

        $startedAt = now()->subMinutes(25);
        $endedAt = now();

        $response = $this->withToken($this->tokenFor($user))
            ->postJson('/api/focus/sessions', [
                'task_id' => $task->id,
                'method' => 'pomodoro',
                'started_at' => $startedAt->toIso8601String(),
                'ended_at' => $endedAt->toIso8601String(),
                'duration_seconds' => 1500,
                'completed' => true,
                'notes' => 'session hors ligne',
            ])
            ->assertCreated()
            ->assertJsonPath('duration_seconds', 1500)
            ->assertJsonPath('completed', true);

        $this->assertDatabaseHas('focus_sessions', [
            'id' => $response->json('id'),
            'user_id' => $user->id,
            'task_id' => $task->id,
            'duration_seconds' => 1500,
            'completed' => true,
        ]);
    }

    public function test_une_session_de_focus_hors_ligne_ne_peut_pas_finir_avant_de_commencer(): void
    {
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/focus/sessions', [
                'method' => 'pomodoro',
                'started_at' => now()->toIso8601String(),
                'ended_at' => now()->subMinutes(10)->toIso8601String(),
                'duration_seconds' => 600,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('ended_at');
    }

    public function test_une_session_de_focus_hors_ligne_ne_peut_pas_depasser_24_heures(): void
    {
        $user = User::factory()->create();

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/focus/sessions', [
                'method' => 'deep_work',
                'started_at' => now()->subHour()->toIso8601String(),
                'ended_at' => now()->toIso8601String(),
                'duration_seconds' => 90000,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('duration_seconds');
    }

    public function test_une_session_de_focus_ne_peut_pas_viser_la_tache_d_un_autre_utilisateur(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $otherTask = $other->tasks()->create(['title' => 'Tâche privée']);

        $this->withToken($this->tokenFor($user))
            ->postJson('/api/focus/sessions', [
                'task_id' => $otherTask->id,
                'method' => 'pomodoro',
            ])
            ->assertStatus(403);

        $this->assertSame(0, $user->focusSessions()->count());
    }

    private function tokenFor(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }
}
