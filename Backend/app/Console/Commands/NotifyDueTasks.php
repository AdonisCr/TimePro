<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Task;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class NotifyDueTasks extends Command
{
    protected $signature = 'notifications:due-soon {--days=1 : Nombre de jours à venir à surveiller}';

    protected $description = 'Crée une notification pour les tâches dont l\'échéance approche';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $start = now()->startOfDay();
        $end = now()->addDays($days)->endOfDay();

        $tasks = Task::where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$start, $end])
            ->with('user.preferences')
            ->get();

        $alreadyNotified = Notification::where('type', 'task_due')
            ->where('created_at', '>=', now()->startOfDay())
            ->get()
            ->groupBy('user_id')
            ->map(fn ($items) => $items->pluck('data.task_id')->filter()->all());

        $created = 0;

        foreach ($tasks as $task) {
            if (!$task->user) {
                continue;
            }

            // Respecte le réglage "Rappels de tâches" quand il est explicitement désactivé.
            if ($task->user->preferences && $task->user->preferences->receive_reminders === false) {
                continue;
            }

            if (in_array($task->id, $alreadyNotified->get($task->user_id, []), true)) {
                continue;
            }

            NotificationService::notify(
                $task->user,
                'task_due',
                'Échéance proche',
                'La tâche « ' . $task->title . ' » arrive à échéance le ' . $task->due_date->format('d/m/Y') . '.',
                [
                    'task_id' => $task->id,
                    'due_date' => $task->due_date->toDateString(),
                ]
            );

            $created++;
        }

        $this->info($created . ' notification(s) d\'échéance créée(s).');

        return self::SUCCESS;
    }
}
