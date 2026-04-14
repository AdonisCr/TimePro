<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teams = $request->user()
            ->teamMembers()
            ->with(['owner', 'members', 'projects'])
            ->get()
            ->pluck('team');

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

        $team->load('owner', 'members', 'projects.tasks', 'projects.tasks.timeEntries');
        return response()->json($team);
    }

    public function update(Request $request, Team $team): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->role !== 'admin') {
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
        
        if (!$member || $member->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['nullable', Rule::in(['admin', 'member', 'viewer'])],
        ]);

        $user = User::where('email', $validated['email'])->first();
        
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $existingMember = $team->members()->where('user_id', $user->id)->first();
        
        if ($existingMember) {
            return response()->json(['message' => 'Utilisateur déjà membre'], 400);
        }

        TeamMember::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'role' => $validated['role'] ?? 'member',
        ]);

        $team->load('members');
        return response()->json($team);
    }

    public function removeMember(Request $request, Team $team, User $user): JsonResponse
    {
        $member = $team->members()->where('user_id', $request->user()->id)->first();
        
        if (!$member || $member->role !== 'admin') {
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
        
        if (!$member || $member->role !== 'admin') {
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
        $memberships = $request->user()->teamMembers()->with('team.owner')->get();
        return response()->json($memberships);
    }
}