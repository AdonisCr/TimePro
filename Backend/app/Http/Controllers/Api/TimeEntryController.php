<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimeEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->timeEntries()->with(['task', 'project']);

        if ($request->has('task_id') && is_numeric($request->task_id)) {
            $query->where('task_id', (int) $request->task_id);
        }
        if ($request->has('project_id') && is_numeric($request->project_id)) {
            $query->where('project_id', (int) $request->project_id);
        }
        if ($request->has('date')) {
            $query->whereDate('start_time', $request->date);
        }
        if ($request->has('from') && $request->has('to')) {
            $from = date('Y-m-d H:i:s', strtotime($request->from));
            $to = date('Y-m-d H:i:s', strtotime($request->to));
            $query->whereBetween('start_time', [$from, $to]);
        }

        $page = (int) $request->get('page', 1);
        $perPage = min((int) $request->get('per_page', 50), 100);
        $offset = ($page - 1) * $perPage;

        $total = (clone $query)->count();
        $entries = $query->orderBy('start_time', 'desc')->offset($offset)->limit($perPage)->get();

        return response()->json([
            'data' => $entries,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_id' => ['nullable', 'exists:tasks,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'description' => ['nullable', 'string'],
            'start_time' => ['required', 'date'],
            'end_time' => ['nullable', 'date', 'after:start_time'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'is_manual' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['task_id'])) {
            $task = \App\Models\Task::find($validated['task_id']);
            if ($task->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Tâche non autorisée'], 403);
            }
        }

        if (isset($validated['project_id'])) {
            $project = \App\Models\Project::find($validated['project_id']);
            if ($project->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Projet non autorisé'], 403);
            }
        }

        if (isset($validated['start_time']) && isset($validated['end_time']) && !isset($validated['duration'])) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = $end->diffInSeconds($start);
        }

        $entry = $request->user()->timeEntries()->create($validated);
        $entry->load('task', 'project');
        return response()->json($entry, 201);
    }

    public function show(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $timeEntry->load('task', 'project');
        return response()->json($timeEntry);
    }

    public function update(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'task_id' => ['nullable', 'exists:tasks,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'description' => ['nullable', 'string'],
            'start_time' => ['nullable', 'date'],
            'end_time' => ['nullable', 'date'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'is_manual' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['start_time']) && isset($validated['end_time']) && !isset($validated['duration'])) {
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $validated['duration'] = $end->diffInSeconds($start);
        }

        $timeEntry->update($validated);
        $timeEntry->load('task', 'project');
        return response()->json($timeEntry);
    }

    public function destroy(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        if ($timeEntry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $timeEntry->delete();
        return response()->json(['message' => 'Entrée de temps supprimée']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();
        $monthStart = now()->startOfMonth();

        $stats = [
            'today' => [
                'total_seconds' => $user->timeEntries()->whereDate('start_time', $today)->sum('duration'),
                'entries_count' => $user->timeEntries()->whereDate('start_time', $today)->count(),
            ],
            'week' => [
                'total_seconds' => $user->timeEntries()->whereBetween('start_time', [$weekStart, now()])->sum('duration'),
                'entries_count' => $user->timeEntries()->whereBetween('start_time', [$weekStart, now()])->count(),
            ],
            'month' => [
                'total_seconds' => $user->timeEntries()->whereBetween('start_time', [$monthStart, now()])->sum('duration'),
                'entries_count' => $user->timeEntries()->whereBetween('start_time', [$monthStart, now()])->count(),
            ],
        ];

        return response()->json($stats);
    }
}
