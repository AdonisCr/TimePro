<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function show(string $token): JsonResponse
    {
        $invitation = TeamInvitation::where('token', $token)
            ->with(['team', 'inviter'])
            ->first();

        if (!$invitation || $invitation->isExpired() || $invitation->isAccepted()) {
            return response()->json(['message' => 'Invitation invalide ou expirée'], 404);
        }

        return response()->json([
            'team_name' => $invitation->team->name,
            'invited_by' => $invitation->inviter->name,
            'email' => $invitation->email,
            'token' => $invitation->token,
        ]);
    }

    public function accept(Request $request, string $token): JsonResponse
    {
        $invitation = TeamInvitation::where('token', $token)->first();

        if (!$invitation || $invitation->isExpired() || $invitation->isAccepted()) {
            return response()->json(['message' => 'Invitation invalide ou expirée'], 404);
        }

        $user = $request->user();

        if (strtolower($user->email) !== strtolower($invitation->email)) {
            return response()->json(['message' => 'Cette invitation ne correspond pas à votre email'], 403);
        }

        $existingMember = $invitation->team->members()->where('user_id', $user->id)->first();
        if ($existingMember) {
            $invitation->update(['accepted_at' => now()]);
            return response()->json(['message' => 'Vous êtes déjà membre de cette équipe']);
        }

        TeamMember::create([
            'team_id' => $invitation->team_id,
            'user_id' => $user->id,
            'role' => $invitation->role,
        ]);

        $invitation->update(['accepted_at' => now()]);

        return response()->json([
            'message' => 'Invitation acceptée',
            'team_name' => $invitation->team->name,
        ]);
    }
}
