<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;

class DailyPlanBuilder
{
    private const BREAK_MINUTES = 15;

    private const DEFAULT_START = '09:00';

    private const DEFAULT_END = '18:00';

    private const DEFAULT_TASK_MINUTES = 30;

    /**
     * Construit le plan de la journée : blocs chronologiques séparés de 15 min,
     * de work_start_time à work_end_time (jamais au-delà).
     *
     * @return array{date: string, blocks: array<int, array{task_id: int, title: string, start: string, end: string, minutes: int}>}
     */
    public function build(User $user, ?string $date = null): array
    {
        $date = $date ?: now()->toDateString();

        $preferences = $user->preferences;
        $workStart = substr((string) ($preferences?->work_start_time ?: self::DEFAULT_START), 0, 5);
        $workEnd = substr((string) ($preferences?->work_end_time ?: self::DEFAULT_END), 0, 5);

        $currentTime = Carbon::parse($date.' '.$workStart);
        $dayEnd = Carbon::parse($date.' '.$workEnd);

        $blocks = [];

        foreach ($this->tasksForDay($user, $date) as $task) {
            $minutes = $this->minutesOf($task);

            // $currentTime est mutable : ne jamais le muter en passant le début d'un bloc.
            $blockEnd = $currentTime->copy()->addMinutes($minutes);

            if ($blockEnd->greaterThan($dayEnd)) {
                // Capacité dépassée : aucun bloc au-delà de work_end_time.
                break;
            }

            $blocks[] = [
                'task_id' => $task->id,
                'title' => $task->title,
                'start' => $currentTime->format('H:i'),
                'end' => $blockEnd->format('H:i'),
                'minutes' => $minutes,
            ];

            $currentTime = $blockEnd->copy()->addMinutes(self::BREAK_MINUTES);

            if ($currentTime->greaterThanOrEqualTo($dayEnd)) {
                break;
            }
        }

        return [
            'date' => $date,
            'blocks' => $blocks,
        ];
    }

    /**
     * Tâches "todo" du jour : due_date = aujourd'hui OU due_date null.
     *
     * @return array<int, Task>
     */
    private function tasksForDay(User $user, string $date): array
    {
        $tasks = Task::query()
            ->where('user_id', $user->id)
            ->where('status', 'todo')
            ->where(function ($query) use ($date) {
                $query->whereNull('due_date')->orWhere('due_date', $date);
            })
            ->get();

        $priorityOrder = ['high' => 0, 'medium' => 1, 'low' => 2];

        return $tasks
            ->sort(function (Task $a, Task $b) use ($priorityOrder) {
                $byPriority = ($priorityOrder[$a->priority] ?? 1) <=> ($priorityOrder[$b->priority] ?? 1);
                if ($byPriority !== 0) {
                    return $byPriority;
                }

                return ($b->estimated_duration ?? 0) <=> ($a->estimated_duration ?? 0);
            })
            ->values()
            ->all();
    }

    private function minutesOf(Task $task): int
    {
        $minutes = (int) ($task->estimated_duration ?? 0);

        return $minutes > 0 ? $minutes : self::DEFAULT_TASK_MINUTES;
    }
}
