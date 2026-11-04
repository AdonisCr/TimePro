<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PublicSharingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_les_donnees_publiques_sont_refusees_par_defaut(): void
    {
        $user = User::factory()->create();

        $this->getJson('/api/public/planning/' . $user->id)->assertForbidden();
        $this->getJson('/api/public/stats/' . $user->id)->assertForbidden();
        $this->getJson('/api/public/projects/' . $user->id)->assertForbidden();
    }

    public function test_les_reglages_de_partage_sont_enregistrables(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);
        $this->putJson('/api/preferences', [
                'public_planning' => true,
                'public_stats' => true,
                'public_projects' => true,
            ])
            ->assertOk()
            ->assertJsonPath('preferences.public_planning', true)
            ->assertJsonPath('preferences.public_stats', true)
            ->assertJsonPath('preferences.public_projects', true);

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'public_planning' => true,
        ]);
    }

    public function test_le_planning_public_est_accessible_quand_active(): void
    {
        $user = User::factory()->create(['name' => 'Alice']);
        $user->preferences()->create(['public_planning' => true]);
        $user->tasks()->create(['title' => 'Tâche publique', 'due_date' => today()]);

        $this->getJson('/api/public/planning/' . $user->id)
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.name', 'Alice')
            ->assertJsonPath('data.tasks.0.title', 'Tâche publique');
    }

    public function test_les_statistiques_publiques_respectent_le_reglage(): void
    {
        $user = User::factory()->create();
        $user->tasks()->create(['title' => 'Terminée', 'status' => 'done']);

        $this->getJson('/api/public/stats/' . $user->id)->assertForbidden();

        $user->preferences()->create(['public_stats' => true]);

        $this->getJson('/api/public/stats/' . $user->id)
            ->assertOk()
            ->assertJsonPath('data.tasks.completed', 1);
    }

    public function test_les_projets_publics_respectent_le_reglage(): void
    {
        $user = User::factory()->create();
        $user->projects()->create(['name' => 'Projet public']);

        $this->getJson('/api/public/projects/' . $user->id)->assertForbidden();

        $user->preferences()->create(['public_projects' => true]);

        $this->getJson('/api/public/projects/' . $user->id)
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Projet public');
    }

    public function test_desactiver_le_partage_bloque_immediatement_l_acces(): void
    {
        $user = User::factory()->create();
        $user->preferences()->create(['public_planning' => true]);

        $this->getJson('/api/public/planning/' . $user->id)->assertOk();

        Sanctum::actingAs($user);
        $this->putJson('/api/preferences', ['public_planning' => false])
            ->assertOk();

        $this->getJson('/api/public/planning/' . $user->id)->assertForbidden();
    }
}
