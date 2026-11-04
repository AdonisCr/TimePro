<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class PublicApiController extends Controller
{
    /**
     * Get public planning for a user
     * GET /api/public/planning/{userId}
     */
    public function getPlanning(Request $request, int $userId): JsonResponse
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé',
            ], 404);
        }

        // Check if user has public planning enabled
        $preferences = $user->preferences()->first();
        if (!$preferences || !$preferences->public_planning) {
            return response()->json([
                'error' => 'Ce planning n\'est pas public',
            ], 403);
        }

        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $date = $validated['date'] ?? now()->toDateString();
        
        $cacheKey = "public_planning_{$userId}_{$date}";
        
        $planning = Cache::remember($cacheKey, 300, function () use ($user, $date) {
            $tasks = Task::where('user_id', $user->id)
                ->where('status', '!=', 'done')
                ->whereDate('due_date', $date)
                ->with('project:id,name,color')
                ->orderBy('priority', 'desc')
                ->orderBy('due_date', 'asc')
                ->get()
                ->map(fn($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'project' => $task->project ? [
                        'name' => $task->project->name,
                        'color' => $task->project->color,
                    ] : null,
                ]);

            $timeEntries = TimeEntry::where('user_id', $user->id)
                ->whereDate('start_time', $date)
                ->get()
                ->map(fn($entry) => [
                    'id' => $entry->id,
                    'start_time' => $entry->start_time,
                    'end_time' => $entry->end_time,
                    'duration' => $entry->duration,
                ]);

            return [
                'user' => [
                    'name' => $user->name,
                    'avatar' => $user->profile_photo_url,
                ],
                'date' => $date,
                'tasks' => $tasks,
                'time_entries' => $timeEntries,
                'stats' => [
                    'total_tasks' => $tasks->count(),
                    'completed_today' => Task::where('user_id', $user->id)
                        ->whereDate('completed_at', $date)
                        ->count(),
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $planning,
        ]);
    }

    /**
     * Get public stats for a user
     * GET /api/public/stats/{userId}
     */
    public function getStats(int $userId): JsonResponse
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé',
            ], 404);
        }

        $preferences = $user->preferences()->first();
        if (!$preferences || !$preferences->public_stats) {
            return response()->json([
                'error' => 'Ces statistiques ne sont pas publiques',
            ], 403);
        }

        $cacheKey = "public_stats_{$userId}";
        
        $stats = Cache::remember($cacheKey, 300, function () use ($user) {
            $totalTasks = Task::where('user_id', $user->id)->count();
            $completedTasks = Task::where('user_id', $user->id)
                ->where('status', 'done')
                ->count();
            
            $totalTime = TimeEntry::where('user_id', $user->id)
                ->sum('duration');
            
            $todayEntries = TimeEntry::where('user_id', $user->id)
                ->whereDate('start_time', today())
                ->count();

            $projects = Project::where('user_id', $user->id)
                ->count();

            return [
                'user' => [
                    'name' => $user->name,
                    'avatar' => $user->profile_photo_url,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'completed' => $completedTasks,
                    'completion_rate' => $totalTasks > 0 
                        ? round(($completedTasks / $totalTasks) * 100, 1) 
                        : 0,
                ],
                'time' => [
                    'total_hours' => round($totalTime / 3600, 1),
                    'today_entries' => $todayEntries,
                ],
                'projects' => $projects,
                'updated_at' => now()->toDateTimeString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get public projects for a user
     * GET /api/public/projects/{userId}
     */
    public function getProjects(int $userId): JsonResponse
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé',
            ], 404);
        }

        $preferences = $user->preferences()->first();
        if (!$preferences || !$preferences->public_projects) {
            return response()->json([
                'error' => 'Ces projets ne sont pas publics',
            ], 403);
        }

        $cacheKey = "public_projects_{$userId}";
        
        $projects = Cache::remember($cacheKey, 300, function () use ($user) {
            return Project::where('user_id', $user->id)
                ->get()
                ->map(fn($project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'color' => $project->color,
                    'status' => $project->status,
                    'tasks_count' => $project->tasks()->count(),
                    'completed_tasks' => $project->tasks()
                        ->where('status', 'done')
                        ->count(),
                ]);
        });

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    /**
     * API documentation endpoint
     * GET /api/public/docs
     */
    public function docs(): JsonResponse
    {
        return response()->json([
            'name' => 'Time Pro Public API',
            'version' => '1.0.0',
            'description' => 'API publique pour accéder aux données partagées de Time Pro',
            'endpoints' => [
                'GET /api/public/planning/{userId}' => [
                    'description' => 'Récupère le planning public d\'un utilisateur',
                    'parameters' => [
                        'userId' => 'ID de l\'utilisateur',
                        'date' => 'Date au format YYYY-MM-DD (optionnel, défaut: aujourd\'hui)',
                    ],
                    'response' => [
                        'user' => 'Informations utilisateur',
                        'tasks' => 'Liste des tâches',
                        'time_entries' => 'Entrées de temps',
                        'stats' => 'Statistiques du jour',
                    ],
                ],
                'GET /api/public/stats/{userId}' => [
                    'description' => 'Récupère les statistiques publiques d\'un utilisateur',
                    'parameters' => [
                        'userId' => 'ID de l\'utilisateur',
                    ],
                    'response' => [
                        'tasks' => 'Statistiques des tâches',
                        'time' => 'Statistiques de temps',
                        'projects' => 'Nombre de projets',
                    ],
                ],
                'GET /api/public/projects/{userId}' => [
                    'description' => 'Récupère les projets publics d\'un utilisateur',
                    'parameters' => [
                        'userId' => 'ID de l\'utilisateur',
                    ],
                    'response' => [
                        'Liste des projets avec nombre de tâches',
                    ],
                ],
            ],
            'rate_limiting' => '100 requêtes par minute par IP',
            'authentication' => 'Aucune authentification requise (données publiques uniquement)',
        ]);
    }
}
