<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $labels = $request->user()->labels()->orderBy('name')->get();
        return response()->json($labels);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $label = $request->user()->labels()->create($validated);
        return response()->json($label, 201);
    }

    public function update(Request $request, Label $label): JsonResponse
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $label->update($validated);
        return response()->json($label);
    }

    public function destroy(Request $request, Label $label): JsonResponse
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $label->delete();
        return response()->json(['message' => 'Étiquette supprimée']);
    }

    public function assign(Request $request, Label $label): JsonResponse
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
        ]);

        $task = $request->user()->tasks()->find($validated['task_id']);
        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        $task->labels()->syncWithoutDetaching([$label->id]);
        $task->load('labels');

        return response()->json($task);
    }

    public function remove(Request $request, Label $label): JsonResponse
    {
        if ($label->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
        ]);

        $task = $request->user()->tasks()->find($validated['task_id']);
        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        $task->labels()->detach($label->id);
        $task->load('labels');

        return response()->json($task);
    }
}