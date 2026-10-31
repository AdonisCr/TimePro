<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FocusSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FocusController extends Controller
{
    private const METHODS = ['pomodoro', 'deep_work', 'flowtime', 'fifty_two_seventeen', 'timebox'];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'method' => ['required', 'in:' . implode(',', self::METHODS)],
        ]);

        if (isset($validated['task_id'])) {
            $task = \App\Models\Task::find($validated['task_id']);
            if (!$task || $task->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Tâche non autorisée'], 403);
            }
        }

        $session = $request->user()->focusSessions()->create([
            'task_id' => $validated['task_id'] ?? null,
            'method' => $validated['method'],
            'started_at' => now(),
            'completed' => false,
        ]);

        return response()->json([
            'id' => $session->id,
            'task_id' => $session->task_id,
            'method' => $session->method,
            'started_at' => $session->started_at,
        ], 201);
    }

    public function stop(Request $request, FocusSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $endedAt = now();
        $session->ended_at = $endedAt;
        $session->duration_seconds = abs($session->started_at->diffInSeconds($endedAt));
        $session->completed = $session->duration_seconds >= 60;

        if (array_key_exists('notes', $validated)) {
            $session->notes = $validated['notes'];
        }

        $session->save();

        return response()->json($session);
    }

    public function todaySessions(Request $request): JsonResponse
    {
        $sessions = $request->user()->focusSessions()
            ->with('task:id,title')
            ->whereDate('started_at', today())
            ->orderByDesc('started_at')
            ->get();

        $byMethod = array_fill_keys(self::METHODS, 0);

        $payload = $sessions->map(function (FocusSession $session) use (&$byMethod) {
            $byMethod[$session->method] += $session->duration_seconds;

            return [
                'id' => $session->id,
                'task_id' => $session->task_id,
                'method' => $session->method,
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
                'duration_seconds' => $session->duration_seconds,
                'completed' => $session->completed,
                'notes' => $session->notes,
                'task_title' => $session->task->title ?? null,
            ];
        });

        return response()->json([
            'sessions' => $payload,
            'total_seconds' => (int) $sessions->sum('duration_seconds'),
            'by_method' => $byMethod,
        ]);
    }

    public function dailyReport(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = today();

        $sessions = $user->focusSessions()->whereDate('started_at', $today)->get();

        $byMethod = array_fill_keys(self::METHODS, 0);
        foreach ($sessions as $session) {
            $byMethod[$session->method] += $session->duration_seconds;
        }

        $tasksDone = $user->tasks()
            ->where('status', 'done')
            ->whereDate('updated_at', $today)
            ->get(['id', 'title']);

        $tasksPendingToday = $user->tasks()
            ->whereDate('due_date', $today)
            ->where('status', '!=', 'done')
            ->count();

        return response()->json([
            'date' => $today->toDateString(),
            'sessions_count' => $sessions->count(),
            'total_focus_seconds' => (int) $sessions->sum('duration_seconds'),
            'tasks_done_today' => $tasksDone->count(),
            'tasks_done' => $tasksDone,
            'tasks_pending_today' => $tasksPendingToday,
            'by_method' => $byMethod,
            'longest_session_seconds' => (int) $sessions->max('duration_seconds'),
            'current_streak_days' => $this->currentStreak($user),
        ]);
    }

    private function currentStreak(User $user): int
    {
        $streak = 0;
        $day = today();

        for ($i = 0; $i < 365; $i++) {
            $hasCompleted = $user->focusSessions()
                ->where('completed', true)
                ->whereDate('started_at', $day)
                ->exists();

            if (!$hasCompleted) {
                break;
            }

            $streak++;
            $day = $day->copy()->subDay();
        }

        return $streak;
    }
}
