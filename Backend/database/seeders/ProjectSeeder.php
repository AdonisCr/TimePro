<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $projects = [
            [
                'name' => 'TimePro - Application Web',
                'description' => 'Développement de l\'application de gestion de temps TimePro',
                'color' => '#00B4DB',
                'status' => 'active',
                'deadline' => now()->addMonths(2),
            ],
            [
                'name' => 'Refonte Dashboard',
                'description' => 'Nouvelle interface utilisateur pour le tableau de bord',
                'color' => '#6366F1',
                'status' => 'active',
                'deadline' => now()->addWeeks(3),
            ],
            [
                'name' => 'API REST',
                'description' => 'Développement des endpoints API REST',
                'color' => '#10B981',
                'status' => 'completed',
                'deadline' => now()->subWeeks(1),
            ],
            [
                'name' => 'Documentation',
                'description' => 'Rédaction de la documentation technique',
                'color' => '#F59E0B',
                'status' => 'active',
                'deadline' => now()->addMonths(1),
            ],
        ];

        foreach ($projects as $project) {
            Project::create(array_merge($project, ['user_id' => $user->id]));
        }
    }
}
