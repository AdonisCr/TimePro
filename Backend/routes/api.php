<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TimeEntryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TaskCommentController;

// ── Routes publiques avec rate limiting ──────────────────────

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

// ── Routes protégées ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'me']);

    Route::post('/email/resend', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:3,1')
        ->name('verification.send');

    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'updatePassword']);

    // User Preferences
    Route::get('/preferences', [UserPreferenceController::class, 'index']);
    Route::put('/preferences', [UserPreferenceController::class, 'update']);
    Route::post('/preferences', [UserPreferenceController::class, 'store']);

    // Labels
    Route::apiResource('labels', LabelController::class);
    Route::post('/labels/{label}/assign', [LabelController::class, 'assign']);
    Route::delete('/labels/{label}/remove', [LabelController::class, 'remove']);

    // Projects CRUD
    Route::apiResource('projects', ProjectController::class);

    // Tasks CRUD
    Route::post('/tasks/reorder', [TaskController::class, 'reorder']);
    Route::apiResource('tasks', TaskController::class);

    // Time Entries CRUD
    Route::get('/time-entries/stats', [TimeEntryController::class, 'stats']);
    Route::apiResource('time-entries', TimeEntryController::class);

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
    Route::post('/teams/{team}/members', [TeamController::class, 'addMember']);
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember']);
    Route::patch('/teams/{team}/members/{user}', [TeamController::class, 'updateMemberRole']);

    // Task Comments
    Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
    Route::patch('/comments/{comment}', [TaskCommentController::class, 'update']);
    Route::delete('/comments/{comment}', [TaskCommentController::class, 'destroy']);
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status'      => 'ok',
        'server_time' => now()->toDateTimeString(),
    ]);
});