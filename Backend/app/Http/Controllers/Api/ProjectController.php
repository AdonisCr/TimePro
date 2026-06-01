<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 20);
        $projects = $request->user()->projects()
            ->orderBy('created_at', 'desc')
            ->paginate(min($perPage, 100));

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['active', 'completed', 'archived'])],
            'deadline' => ['nullable', 'date'],
            'time_budget' => ['nullable', 'integer', 'min:0'],
            'time_budget_warning' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $project = $request->user()->projects()->create($validated);
        $project->loadCount('tasks');
        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $project->load('tasks');
        return response()->json($project);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['active', 'completed', 'archived'])],
            'deadline' => ['nullable', 'date'],
            'time_budget' => ['nullable', 'integer', 'min:0'],
            'time_budget_warning' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $project->update($validated);
        return response()->json($project->fresh());
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $project->delete();
        return response()->json(['message' => 'Projet supprimé']);
    }
}
