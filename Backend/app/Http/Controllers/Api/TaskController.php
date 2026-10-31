<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks()->with(['project', 'subtasks']);

        if ($request->has('status') && in_array($request->status, ['todo', 'in_progress', 'done'])) {
            $query->where('status', $request->status);
        }
        if ($request->has('project_id') && is_numeric($request->project_id)) {
            $query->where('project_id', (int) $request->project_id);
        }
        if ($request->has('priority') && in_array($request->priority, ['low', 'medium', 'high'])) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->whereNull('parent_id')->orderBy('order')->orderBy('created_at', 'desc')->limit(100)->get();
        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'status' => ['nullable', Rule::in(['todo', 'in_progress', 'done'])],
            'due_date' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'is_completed' => ['nullable', 'boolean'],
            'recurrence' => ['nullable', Rule::in(['none', 'daily', 'weekly', 'monthly', 'yearly'])],
            'recurrence_end_date' => ['nullable', 'date'],
            'recurrence_count' => ['nullable', 'integer', 'min:1'],
            'depends_on' => ['nullable', 'exists:tasks,id'],
        ]);

        if (isset($validated['depends_on']) && $validated['depends_on'] == ($validated['parent_id'] ?? null)) {
            return response()->json(['message' => 'Une tâche ne peut pas dépendre de sa propre parente'], 400);
        }

        if (isset($validated['project_id'])) {
            $project = \App\Models\Project::find($validated['project_id']);
            if ($project->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Projet non autorisé'], 403);
            }
        }

        if (isset($validated['parent_id'])) {
            $parent = Task::find($validated['parent_id']);
            if ($parent->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Tâche parente non autorisée'], 403);
            }
        }

        $task = $request->user()->tasks()->create($validated);

        $subtasks = $request->input('subtasks', []);
        if (is_array($subtasks)) {
            foreach ($subtasks as $subtask) {
                if (is_array($subtask) && !empty($subtask['title'])) {
                    $task->subtasks()->create([
                        'title' => $subtask['title'],
                        'user_id' => $request->user()->id,
                        'status' => 'todo',
                    ]);
                }
            }
        }

        $task->load('project', 'subtasks');
        return response()->json($task, 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $task->load('project', 'timeEntries', 'subtasks');
        return response()->json($task);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high'])],
            'status' => ['nullable', Rule::in(['todo', 'in_progress', 'done'])],
            'due_date' => ['nullable', 'date'],
            'is_completed' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
            'recurrence' => ['nullable', Rule::in(['none', 'daily', 'weekly', 'monthly', 'yearly'])],
            'recurrence_end_date' => ['nullable', 'date'],
            'recurrence_count' => ['nullable', 'integer', 'min:1'],
            'depends_on' => ['nullable', 'exists:tasks,id'],
        ]);

        if (isset($validated['project_id'])) {
            $project = \App\Models\Project::find($validated['project_id']);
            if ($project->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Projet non autorisé'], 403);
            }
        }

        if (isset($validated['parent_id'])) {
            $parent = Task::find($validated['parent_id']);
            if (!$parent || $parent->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Tâche parente non autorisée'], 403);
            }
            if ($validated['parent_id'] === $task->id) {
                return response()->json(['message' => 'Une tâche ne peut pas être sa propre parente'], 400);
            }
        }

        if (isset($validated['depends_on'])) {
            $dependsOn = Task::find($validated['depends_on']);
            if (!$dependsOn || $dependsOn->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Tâche dépendante non autorisée'], 403);
            }
            if ($validated['depends_on'] === $task->id) {
                return response()->json(['message' => 'Une tâche ne peut pas dépendre d\'elle-même'], 400);
            }
        }

        $task->update($validated);
        $task->load('project', 'subtasks');

        if (($validated['status'] ?? null) === 'done' && $task->wasChanged('status')) {
            $this->sendTaskDonePush($task);
        }

        return response()->json($task);
    }

    /**
     * Push best-effort quand une tâche passe à "done" (ne casse jamais le flux).
     */
    private function sendTaskDonePush(Task $task): void
    {
        try {
            PushNotificationController::sendToUser(
                $task->user,
                'Tâche terminée 🎉',
                'Bravo ! Tu as terminé : ' . $task->title,
                ['task_id' => $task->id, 'type' => 'task_done']
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Push task_done échouée', [
                'task_id' => $task->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        if ($task->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $task->delete();
        return response()->json(['message' => 'Tâche supprimée']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'tasks' => ['required', 'array'],
            'tasks.*.id' => ['required', 'integer', 'exists:tasks,id'],
            'tasks.*.status' => ['required', 'string', Rule::in(['todo', 'in_progress', 'done'])],
            'tasks.*.order' => ['nullable', 'integer', 'min:0'],
        ]);

        foreach ($request->tasks as $taskData) {
            $task = Task::where('id', $taskData['id'])
                ->where('user_id', $request->user()->id)
                ->first();

            if ($task) {
                $task->update([
                    'status' => $taskData['status'],
                    'order' => $taskData['order'] ?? $task->order,
                ]);

                if ($taskData['status'] === 'done' && $task->wasChanged('status')) {
                    $this->sendTaskDonePush($task);
                }
            }
        }

        return response()->json(['message' => 'Tâches réorganisées']);
    }
}
