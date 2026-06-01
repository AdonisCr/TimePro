<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();
        $tasks = Task::where('user_id', $user->id)->get();

        if ($tasks->isEmpty()) {
            return;
        }

        $comments = [
            'En attente de validation',
            'J\'ai commencé à travailler dessus',
            'Il reste quelques points à finaliser',
            'Review nécessaire avant déploiement',
            'Terminé, prêt pour la mise en production',
        ];

        foreach ($tasks->take(3) as $task) {
            TaskComment::create([
                'task_id' => $task->id,
                'user_id' => $user->id,
                'content' => $comments[array_rand($comments)],
            ]);
        }
    }
}
