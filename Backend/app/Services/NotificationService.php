<?php

namespace App\Services;

use App\Http\Controllers\Api\PushNotificationController;
use App\Models\Notification;
use App\Models\Team;
use App\Models\User;

/**
 * Centralise la création des notifications en base et l'envoi push associé.
 *
 * L'envoi push reste "best effort" : une erreur d'envoi ne doit jamais faire
 * échouer l'action métier (invitation, échéance, etc.).
 */
class NotificationService
{
    public static function notify(
        User $user,
        string $type,
        string $title,
        string $message,
        array $data = []
    ): Notification {
        $notification = $user->notifications()->create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        PushNotificationController::sendToUser(
            $user,
            $title,
            $message,
            array_merge($data, ['type' => $type])
        );

        return $notification;
    }

    /**
     * Notifie tous les administrateurs d'une équipe, sauf un utilisateur donné.
     */
    public static function notifyTeamAdmins(
        Team $team,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?int $exceptUserId = null
    ): void {
        $admins = $team->members()
            ->wherePivot('role', 'admin')
            ->get()
            ->when($exceptUserId, fn ($members) => $members->where('id', '!=', $exceptUserId));

        foreach ($admins as $admin) {
            self::notify($admin, $type, $title, $message, $data);
        }
    }
}
