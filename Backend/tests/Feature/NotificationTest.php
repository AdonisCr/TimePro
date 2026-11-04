<?php

namespace Tests\Feature;

use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
    }

    public function test_une_invitation_a_un_membre_existant_cree_une_notification(): void
    {
        $admin = User::factory()->create();
        $invitee = User::factory()->create(['email' => 'invite@example.com']);

        Sanctum::actingAs($admin);
        $teamId = $this->postJson('/api/teams', ['name' => 'Équipe test'])
            ->assertCreated()
            ->json('id');

        $this->postJson('/api/teams/' . $teamId . '/members', ['email' => 'invite@example.com'])
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $invitee->id,
            'type' => 'team_invitation',
        ]);

        Sanctum::actingAs($invitee);
        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJson(['unread_count' => 1]);
    }

    public function test_accepter_une_invitation_notifie_les_administrateurs(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create(['email' => 'membre@example.com']);

        Sanctum::actingAs($admin);
        $teamId = $this->postJson('/api/teams', ['name' => 'Équipe test'])
            ->assertCreated()
            ->json('id');

        $invitation = TeamInvitation::create([
            'team_id' => $teamId,
            'email' => 'membre@example.com',
            'token' => TeamInvitation::generateToken(),
            'invited_by' => $admin->id,
            'role' => 'member',
            'expires_at' => now()->addDays(7),
        ]);

        Sanctum::actingAs($member);
        $this->postJson('/api/invitations/' . $invitation->token . '/accept')
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'team_member_joined',
        ]);

        // La personne qui rejoint ne se notifie pas elle-même.
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $member->id,
            'type' => 'team_member_joined',
        ]);
    }

    public function test_la_commande_d_echeance_cree_une_notification_sans_doublon(): void
    {
        $user = User::factory()->create();
        $user->tasks()->create([
            'title' => 'Rendre le rapport',
            'due_date' => now()->addHours(12),
        ]);

        Artisan::call('notifications:due-soon');
        Artisan::call('notifications:due-soon');

        $this->assertSame(1, $user->notifications()->where('type', 'task_due')->count());
    }

    public function test_les_rappels_d_echeance_respectent_le_reglage_desactive(): void
    {
        $user = User::factory()->create();
        $user->preferences()->create(['receive_reminders' => false]);
        $user->tasks()->create([
            'title' => 'Tâche sans rappel',
            'due_date' => now()->addHours(12),
        ]);

        Artisan::call('notifications:due-soon');

        $this->assertSame(0, $user->notifications()->count());
    }

    public function test_un_utilisateur_ne_peut_pas_marquer_la_notification_d_un_autre(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $notification = $owner->notifications()->create([
            'type' => 'task_due',
            'title' => 'Échéance',
            'message' => 'Message',
        ]);

        Sanctum::actingAs($other);
        $this->patchJson('/api/notifications/' . $notification->id . '/read')
            ->assertForbidden();

        $this->assertFalse($notification->fresh()->is_read);
    }
}
