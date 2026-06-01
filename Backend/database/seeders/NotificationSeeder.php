<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $notifications = [
            [
                'type' => 'task_reminder',
                'title' => 'Échéance imminente',
                'message' => 'Une tâche arrive à expiration dans 2 jours.',
                'is_read' => false,
            ],
            [
                'type' => 'team_invite',
                'title' => 'Invitation équipe',
                'message' => 'Vous avez été invité à rejoindre une équipe.',
                'is_read' => false,
            ],
            [
                'type' => 'update',
                'title' => 'Nouvelle fonctionnalité',
                'message' => 'Le mode Kanban est maintenant disponible.',
                'is_read' => true,
            ],
        ];

        foreach ($notifications as $notif) {
            Notification::create([
                'user_id' => $user->id,
                'type' => $notif['type'],
                'title' => $notif['title'],
                'message' => $notif['message'],
                'is_read' => $notif['is_read'],
            ]);
        }
    }
}
