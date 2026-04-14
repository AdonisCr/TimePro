<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();
        $projects = Project::where('user_id', $user->id)->get();

        $tasks = [
            [
                'title' => 'Implémenter l\'authentification',
                'description' => 'Login, register, mot de passe oublié',
                'priority' => 'high',
                'status' => 'done',
                'due_date' => now()->subDays(5),
            ],
            [
                'title' => 'Créer le Dashboard principal',
                'description' => 'Interface avec stats, graphiques et liste des tâches',
                'priority' => 'high',
                'status' => 'done',
                'due_date' => now()->subDays(2),
            ],
            [
                'title' => 'Développer les API REST',
                'description' => 'Endpoints CRUD pour tasks, projects, time entries',
                'priority' => 'high',
                'status' => 'in_progress',
                'due_date' => now()->addDays(3),
            ],
            [
                'title' => 'Intégrer le suivi du temps',
                'description' => 'Timer, historique, statistiques',
                'priority' => 'medium',
                'status' => 'todo',
                'due_date' => now()->addDays(7),
            ],
            [
                'title' => 'Responsive Design',
                'description' => 'Adaptation mobile et tablette',
                'priority' => 'medium',
                'status' => 'todo',
                'due_date' => now()->addDays(14),
            ],
            [
                'title' => 'Tests unitaires',
                'description' => 'Couverture de code pour les controllers API',
                'priority' => 'low',
                'status' => 'todo',
                'due_date' => now()->addWeeks(3),
            ],
            [
                'title' => 'Déploiement production',
                'description' => 'Mise en ligne sur serveur',
                'priority' => 'high',
                'status' => 'todo',
                'due_date' => now()->addMonths(1),
            ],
        ];

        foreach ($tasks as $index => $task) {
            Task::create([
                'user_id' => $user->id,
                'project_id' => $projects->isNotEmpty() ? $projects[$index % $projects->count()]->id : null,
                'title' => $task['title'],
                'description' => $task['description'],
                'priority' => $task['priority'],
                'status' => $task['status'],
                'due_date' => $task['due_date'],
            ]);
        }
    }
}
