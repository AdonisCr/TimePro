<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Team;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TeamWorkloadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_le_workload_agrege_les_heures_par_membre_par_jour_et_par_projet(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $team = Team::create([
            'name' => 'Équipe test',
            'owner_id' => $owner->id,
        ]);

        DB::table('team_members')->insert([
            ['team_id' => $team->id, 'user_id' => $owner->id, 'role' => 'admin', 'joined_at' => now()],
            ['team_id' => $team->id, 'user_id' => $member->id, 'role' => 'member', 'joined_at' => now()],
        ]);

        $project = Project::create([
            'user_id' => $owner->id,
            'name' => 'Projet facturé',
            'color' => '#00B4DB',
        ]);

        $start = now()->startOfWeek()->addHours(9);

        TimeEntry::create([
            'user_id' => $owner->id,
            'project_id' => $project->id,
            'start_time' => $start,
            'end_time' => $start->copy()->addHour(),
            'duration' => 3600,
        ]);

        TimeEntry::create([
            'user_id' => $owner->id,
            'project_id' => null,
            'start_time' => $start->copy()->addDay(),
            'end_time' => $start->copy()->addDay()->addMinutes(30),
            'duration' => 1800,
        ]);

        TimeEntry::create([
            'user_id' => $member->id,
            'project_id' => $project->id,
            'start_time' => $start,
            'end_time' => $start->copy()->addMinutes(45),
            'duration' => 2700,
        ]);

        $response = $this->withToken($this->tokenFor($owner))
            ->getJson("/api/teams/{$team->id}/workload?period=week")
            ->assertOk();

        $response->assertJsonPath('team_id', $team->id);
        $response->assertJsonPath('period', 'week');

        $members = collect($response->json('members'))->keyBy('user_id');

        $this->assertSame(5400, $members[$owner->id]['total_seconds']);
        $this->assertSame(2, $members[$owner->id]['entries_count']);
        $this->assertSame(3600, $members[$owner->id]['by_project'][0]['total_seconds']);

        $this->assertSame(2700, $members[$member->id]['total_seconds']);
        $this->assertSame(1, $members[$member->id]['entries_count']);

        // Le détail par jour couvre les deux journées du propriétaire.
        $this->assertCount(2, $members[$owner->id]['by_day']);
    }

    public function test_un_utilisateur_hors_de_l_equipe_ne_voit_pas_le_workload(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();

        $team = Team::create([
            'name' => 'Équipe privée',
            'owner_id' => $owner->id,
        ]);

        DB::table('team_members')->insert([
            'team_id' => $team->id,
            'user_id' => $owner->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        $this->withToken($this->tokenFor($outsider))
            ->getJson("/api/teams/{$team->id}/workload")
            ->assertStatus(403);
    }

    private function tokenFor(User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }
}
