<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $team = Team::create([
            'name' => 'Équipe Time Pro',
            'description' => 'Équipe principale de développement',
            'owner_id' => $user->id,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);
    }
}
