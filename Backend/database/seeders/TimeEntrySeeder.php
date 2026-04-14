<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\TimeEntry;
use Illuminate\Database\Seeder;

class TimeEntrySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();
        $tasks = Task::where('user_id', $user->id)->get();
        $projects = Project::where('user_id', $user->id)->get();

        $entries = [
            ['description' => 'Setup projet Laravel', 'hours' => 2, 'task_index' => 0],
            ['description' => 'Configuration Sanctum', 'hours' => 1, 'task_index' => 0],
            ['description' => 'Création des models', 'hours' => 3, 'task_index' => 2],
            ['description' => 'Migrations database', 'hours' => 1, 'task_index' => 2],
            ['description' => 'API AuthController', 'hours' => 4, 'task_index' => 2],
            ['description' => 'Frontend React', 'hours' => 6, 'task_index' => 1],
            ['description' => 'Composants dashboard', 'hours' => 5, 'task_index' => 1],
            ['description' => 'Debug et corrections', 'hours' => 2, 'task_index' => null],
            ['description' => 'Réunion équipe', 'hours' => 1, 'task_index' => null],
            ['description' => 'Code review', 'hours' => 2, 'task_index' => null],
        ];

        foreach ($entries as $index => $entry) {
            $startTime = now()->subDays(rand(0, 14))->setTime(rand(8, 17), rand(0, 59));
            $endTime = (clone $startTime)->addHours($entry['hours']);
            
            TimeEntry::create([
                'user_id' => $user->id,
                'task_id' => $entry['task_index'] !== null && isset($tasks[$entry['task_index']]) 
                    ? $tasks[$entry['task_index']]->id 
                    : null,
                'project_id' => $projects->isNotEmpty() 
                    ? $projects[rand(0, $projects->count() - 1)]->id 
                    : null,
                'description' => $entry['description'],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'duration' => $entry['hours'] * 3600,
                'is_manual' => rand(0, 1) == 1,
            ]);
        }
    }
}
