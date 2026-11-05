<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Models\TimeEntry;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teams = $request->user()
            ->teams()
            ->with(['owner', 'members', 'projects'])
            ->limit(50)
            ->get();

        return response()->json($teams);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $team = Team::create([
            'name' => $validated['name'],
            'owner_id' => $request->user()->id,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $request->user()->id,
            'role' => 'admin',
        ]);

        $team->load('owner', 'members');
        return response()->json($team, 201);
    }

    public function show(Request $request, Team $team): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $team->load(['owner', 'members', 'projects', 'invitations']);
        return response()->json($team);
    }

    public function update(Request $request, Team $team): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->pivot->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $team->update($validated);
        $team->load('owner', 'members');
        return response()->json($team);
    }

    public function destroy(Request $request, Team $team): JsonResponse
    {
        if ($team->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $team->delete();
        return response()->json(['message' => 'Équipe supprimée']);
    }

    public function addMember(Request $request, Team $team): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->pivot->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['nullable', Rule::in(['admin', 'member', 'viewer'])],
        ]);

        $existingMember = $team->members()
            ->whereRaw('LOWER(users.email) = ?', [mb_strtolower($validated['email'])])
            ->first();

        if ($existingMember) {
            return response()->json(['message' => 'Utilisateur déjà membre'], 400);
        }

        $existingInvitation = TeamInvitation::where('team_id', $team->id)
            ->where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            return response()->json(['message' => 'Invitation déjà envoyée à cet email'], 400);
        }

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'email' => $validated['email'],
            'token' => TeamInvitation::generateToken(),
            'invited_by' => $request->user()->id,
            'role' => $validated['role'] ?? 'member',
            'expires_at' => now()->addDays(7),
        ]);

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $acceptUrl = $frontendUrl . '/invitation/' . $invitation->token;

        Mail::to($validated['email'])->send(new TeamInvitationMail($invitation, $acceptUrl));

        // Si la personne a déjà un compte, on l'informe aussi dans l'application.
        $invitedUser = User::whereRaw('LOWER(email) = ?', [mb_strtolower($validated['email'])])->first();

        if ($invitedUser) {
            NotificationService::notify(
                $invitedUser,
                'team_invitation',
                'Invitation à rejoindre une équipe',
                $request->user()->name . ' t\'invite à rejoindre « ' . $team->name . ' ».',
                [
                    'team_id' => $team->id,
                    'invitation_token' => $invitation->token,
                ]
            );
        }

        $team->load('members', 'invitations');
        return response()->json([
            ...$team->toArray(),
            'invitation_sent' => true,
            'invited_email' => $validated['email'],
        ]);
    }

    public function removeMember(Request $request, Team $team, User $user): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->pivot->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($user->id === $team->owner_id) {
            return response()->json(['message' => 'Impossible de supprimer le propriétaire'], 400);
        }

        $team->members()->detach($user->id);
        return response()->json(['message' => 'Membre supprimé']);
    }

    public function updateMemberRole(Request $request, Team $team, User $user): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->pivot->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'member', 'viewer'])],
        ]);

        $team->members()->updateExistingPivot($user->id, ['role' => $validated['role']]);
        return response()->json(['message' => 'Rôle mis à jour']);
    }

    public function myTeams(Request $request): JsonResponse
    {
        $memberships = $request->user()->teamMemberships()
            ->with('team.owner')
            ->limit(50)
            ->get();
        return response()->json($memberships);
    }

    public function workload(Request $request, Team $team): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();

        if (!$member) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $team->load('members');

        $period = $request->get('period', 'week');
        $dateStart = match ($period) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            default => now()->startOfWeek(),
        };

        $projectId = $request->get('project_id');

        // Une seule requête agrégée pour tous les membres : le total, le
        // nombre d'entrées, le détail par jour et par projet sont calculés
        // en mémoire. Avant, on faisait 4 requêtes par membre.
        $rows = TimeEntry::query()
            ->whereIn('user_id', $team->members->pluck('id'))
            ->where('start_time', '>=', $dateStart)
            ->when($projectId, fn ($query) => $query->where('project_id', $projectId))
            ->select(
                'user_id',
                'project_id',
                DB::raw('DATE(start_time) as day'),
                DB::raw('SUM(duration) as total'),
                DB::raw('COUNT(*) as entries')
            )
            ->groupBy('user_id', 'project_id', DB::raw('DATE(start_time)'))
            ->get();

        $membersData = $team->members->map(function (User $user) use ($rows) {
            $memberRows = $rows->where('user_id', $user->id);

            $byDay = $memberRows
                ->groupBy('day')
                ->map(fn ($dayRows) => (int) $dayRows->sum('total'))
                ->sortKeys();

            $byProject = $memberRows
                ->filter(fn ($row) => $row->project_id !== null)
                ->groupBy('project_id')
                ->map(fn ($projectRows, $pid) => [
                    'project_id' => (int) $pid,
                    'total_seconds' => (int) $projectRows->sum('total'),
                ])
                ->values();

            return [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'total_seconds' => (int) $memberRows->sum('total'),
                'entries_count' => (int) $memberRows->sum('entries'),
                'by_day' => $byDay,
                'by_project' => $byProject,
            ];
        });

        $projectIds = $membersData->pluck('by_project')->flatten(1)->pluck('project_id')->unique()->filter();
        $projects = \App\Models\Project::whereIn('id', $projectIds)->get(['id', 'name', 'color'])->keyBy('id');

        $membersData = $membersData->map(function ($data) use ($projects) {
            $data['by_project'] = collect($data['by_project'])->map(function ($p) use ($projects) {
                $proj = $projects->get($p['project_id']);
                $p['project_name'] = $proj?->name;
                $p['project_color'] = $proj?->color;
                return $p;
            });
            return $data;
        });

        return response()->json([
            'team_id' => $team->id,
            'team_name' => $team->name,
            'period' => $period,
            'date_start' => $dateStart->toDateString(),
            'members' => $membersData,
        ]);
    }
}