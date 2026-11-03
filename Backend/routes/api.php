<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TimeEntryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PushNotificationController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\AutomationRuleController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\PublicApiController;
use App\Http\Controllers\Api\SocialiteAuthController;
use App\Http\Controllers\Api\BrainDumpController;
use App\Http\Controllers\Api\FocusController;

// ── Routes publiques avec rate limiting ──────────────────────

// OAuth Providers (doit être AVANT /auth/{provider} pour ne pas être shadowé)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/providers', [SocialiteAuthController::class, 'getProviders']);
    Route::delete('/auth/providers/{provider}', [SocialiteAuthController::class, 'unlinkProvider']);
});

// OAuth Social Login (Google/Facebook)
// Le token n'est jamais transmis dans l'URL : la callback redirige avec un
// code à usage unique, échangé ensuite contre un token.
Route::get('/auth/{provider}', [SocialiteAuthController::class, 'redirect'])
    ->middleware('throttle:10,1');
Route::get('/auth/{provider}/callback', [SocialiteAuthController::class, 'callback'])
    ->middleware('throttle:10,1');
Route::post('/auth/oauth/exchange', [SocialiteAuthController::class, 'exchange'])
    ->middleware('throttle:10,1');

// Max 10 tentatives d'inscription par minute par IP
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:10,1');

// Max 5 tentatives de connexion par minute par IP
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

// Max 3 demandes de reset par minute par IP
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:3,1')
    ->name('password.email');

// Réinitialisation du mot de passe
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:5,1')
    ->name('password.reset');

// Vérification email (lien signé)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');

// Renvoi de l'email de vérification : accessible SANS token, sinon un compte
// non vérifié ne peut jamais sortir de la boucle. Limité par IP et par email.
Route::post('/email/resend', [AuthController::class, 'resendVerification'])
    ->middleware('throttle:3,1')
    ->name('verification.send');

// ── Routes protégées ─────────────────────────────────────────
// `idempotent` s'applique uniquement aux requêtes qui portent l'en-tête
// X-Idempotency-Key ; les autres passent sans changement.
Route::middleware(['auth:sanctum', 'idempotent'])->group(function () {

    Route::get('/user', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/user/avatar', [AuthController::class, 'updateAvatar']);
    Route::delete('/user/avatar', [AuthController::class, 'deleteAvatar']);
    Route::post('/user/password', [AuthController::class, 'updatePassword']);

    // User Preferences
    Route::get('/preferences', [UserPreferenceController::class, 'index']);
    Route::put('/preferences', [UserPreferenceController::class, 'update']);
    Route::post('/preferences', [UserPreferenceController::class, 'store']);

    // Labels
    Route::apiResource('labels', LabelController::class);
    Route::post('/labels/{label}/assign', [LabelController::class, 'assign']);
    Route::delete('/labels/{label}/remove', [LabelController::class, 'remove']);

    // Automation Rules
    Route::apiResource('automation-rules', AutomationRuleController::class);
    Route::patch('/automation-rules/{automation_rule}/toggle', [AutomationRuleController::class, 'toggle']);

    // Projects CRUD
    Route::apiResource('projects', ProjectController::class);

    // Tasks CRUD
    Route::post('/tasks/reorder', [TaskController::class, 'reorder']);
    Route::apiResource('tasks', TaskController::class);

    // Time Entries CRUD
    Route::get('/time-entries/stats', [TimeEntryController::class, 'stats']);
    Route::apiResource('time-entries', TimeEntryController::class);

    // Focus Sessions (Bloc C)
    Route::post('/focus/sessions', [FocusController::class, 'store']);
    Route::patch('/focus/sessions/{session}/stop', [FocusController::class, 'stop']);
    Route::get('/focus/sessions/today', [FocusController::class, 'todaySessions']);
    Route::get('/focus/report/today', [FocusController::class, 'dailyReport']);

    // Push notifications (abonnement Web Push) — AVANT /notifications/{notification}
    Route::post('/notifications/subscribe', [PushNotificationController::class, 'subscribe']);
    Route::delete('/notifications/subscribe', [PushNotificationController::class, 'unsubscribe']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Teams
    Route::get('/teams/my', [TeamController::class, 'myTeams']);
    Route::apiResource('teams', TeamController::class);
    Route::get('/teams/{team}/workload', [TeamController::class, 'workload']);
    Route::post('/teams/{team}/members', [TeamController::class, 'addMember']);
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember']);
    Route::patch('/teams/{team}/members/{user}', [TeamController::class, 'updateMemberRole']);

    // Task Comments
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::patch('/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy']);
});

// ── Brain Dump & Planning du jour ─────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::post('/brain-dump', [BrainDumpController::class, 'store']);
    Route::put('/brain-dump/items/{itemId}', [BrainDumpController::class, 'updateItem']);
    Route::post('/brain-dump/{brainDumpId}/confirm', [BrainDumpController::class, 'confirm']);
    Route::get('/planning/today', [BrainDumpController::class, 'planningToday']);
});

// Invitations (publique + protégée)
Route::get('/invitations/{token}', [InvitationController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept']);
});

// ── API Publique (données partagées) ─────────────────────────
Route::middleware('throttle:100,1')->group(function () {
    // Documentation API
    Route::get('/public/docs', [PublicApiController::class, 'docs']);
    
    // Planning public
    Route::get('/public/planning/{userId}', [PublicApiController::class, 'getPlanning']);
    
    // Statistiques publiques
    Route::get('/public/stats/{userId}', [PublicApiController::class, 'getStats']);
    
    // Projets publics
    Route::get('/public/projects/{userId}', [PublicApiController::class, 'getProjects']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status'      => 'ok',
        'server_time' => now()->toDateTimeString(),
    ]);
});