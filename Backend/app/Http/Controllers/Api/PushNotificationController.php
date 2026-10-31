<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PushNotificationController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        // Le frontend envoie { subscription: { endpoint, keys: {...} } }
        $payload = $request->all();
        if (isset($payload['subscription']) && is_array($payload['subscription'])) {
            $payload = array_merge($payload, $payload['subscription']);
        }

        $validated = Validator::make($payload, [
            'endpoint' => 'required|url',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ])->validate();

        PushSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'endpoint' => $validated['endpoint'],
            ],
            [
                'keys' => $validated['keys'],
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
            ]
        );

        return response()->json(['message' => 'Abonné'], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $endpoint = $request->input('endpoint')
            ?? $request->input('subscription.endpoint');

        $query = PushSubscription::where('user_id', $request->user()->id);

        if (! empty($endpoint)) {
            $query->where('endpoint', $endpoint);
        }

        $query->delete();

        return response()->json(['message' => 'Désabonné']);
    }

    /**
     * Envoie une notification push à un utilisateur (best-effort).
     *
     * @return int Nombre de notifications envoyées.
     */
    public static function sendToUser(User $user, string $title, string $body, array $data = []): int
    {
        try {
            $subscriptions = $user->pushSubscriptions()->get();

            if ($subscriptions->isEmpty()) {
                return 0;
            }

            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'data' => $data,
            ], JSON_UNESCAPED_UNICODE);

            // Utilise minishlink/web-push si disponible, sinon stub (log + compteur)
            if (class_exists(\Minishlink\WebPush\WebPush::class)
                && config('services.vapid.public_key')
                && config('services.vapid.private_key')
            ) {
                return self::sendWithWebPush($subscriptions, $payload);
            }

            foreach ($subscriptions as $subscription) {
                Log::info('Push notification (stub)', [
                    'user_id' => $user->id,
                    'endpoint' => $subscription->endpoint,
                    'payload' => $payload,
                ]);
            }

            return $subscriptions->count();
        } catch (\Throwable $e) {
            // Best-effort : ne jamais casser le flux principal
            Log::warning('Échec envoi push notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return 0;
        }
    }

    /**
     * Envoi réel via minishlink/web-push (si installé + VAPID configurées).
     *
     * @param  \Illuminate\Support\Collection  $subscriptions
     */
    private static function sendWithWebPush($subscriptions, string $payload): int
    {
        $sent = 0;
        $webPush = new \Minishlink\WebPush\WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ]);

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification(
                new \Minishlink\WebPush\Subscription([
                    'endpoint' => $subscription->endpoint,
                    'keys' => $subscription->keys,
                ]),
                $payload
            );
        }

        foreach ($webPush->send() as $report) {
            if ($report->isSuccess()) {
                $sent++;

                continue;
            }

            Log::warning('Push notification en échec', ['reason' => $report->getReason()]);

            // Supprime les abonnements expirés/invalides (404/410)
            $status = $report->getResponse() ? $report->getResponse()->getStatusCode() : null;
            if (in_array($status, [404, 410], true) && $report->getEndpoint()) {
                PushSubscription::where('endpoint', $report->getEndpoint())->delete();
            }
        }

        return $sent;
    }
}
