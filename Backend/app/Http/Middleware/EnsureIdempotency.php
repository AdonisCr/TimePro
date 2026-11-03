<?php

namespace App\Http\Middleware;

use App\Models\IdempotencyKey;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Idempotence des requêtes d'écriture.
 *
 * Le client envoie un en-tête `X-Idempotency-Key` (généré une seule fois par
 * action hors ligne). Si la même clé revient :
 *  - la réponse déjà calculée est renvoyée telle quelle (aucun doublon) ;
 *  - ou 409 si le premier envoi est encore en cours (le client réessaiera).
 *
 * Sans en-tête, le comportement est inchangé.
 */
class EnsureIdempotency
{
    private const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    /** Durée au-delà de laquelle une clé « en cours » est considérée comme abandonnée. */
    private const LOCK_MINUTES = 10;

    public function handle(Request $request, Closure $next): Response
    {
        if (!in_array($request->method(), self::MUTATING_METHODS, true)) {
            return $next($request);
        }

        $key = trim((string) $request->header('X-Idempotency-Key', ''));

        // Pas de clé : requête classique.
        if ($key === '') {
            return $next($request);
        }

        if (strlen($key) > 191) {
            return $this->json("La clé d'idempotence est trop longue (191 caractères maximum).", 422);
        }

        $userId = $request->user()?->id;

        // Les routes publiques ne sont pas concernées : pas d'utilisateur,
        // pas de portée fiable pour stocker la réponse.
        if ($userId === null) {
            return $next($request);
        }

        $requestHash = hash(
            'sha256',
            $request->method().'|'.$request->path().'|'.$request->getContent()
        );

        $existing = IdempotencyKey::query()
            ->where('user_id', $userId)
            ->where('key', $key)
            ->first();

        if ($existing !== null) {
            if (!hash_equals($existing->request_hash, $requestHash)) {
                return $this->json(
                    "Cette clé d'idempotence a déjà été utilisée pour une autre requête.",
                    422
                );
            }

            if (!$existing->isCompleted()) {
                // Verrou abandonné (processus interrompu) : on le remplace.
                if ($existing->created_at !== null && $existing->created_at->lt(now()->subMinutes(self::LOCK_MINUTES))) {
                    $existing->delete();
                } else {
                    return $this->json(
                        'Une requête identique est déjà en cours de traitement.',
                        409,
                        ['Retry-After' => '1']
                    );
                }
            } else {
                return $this->replay($existing);
            }
        }

        try {
            $record = IdempotencyKey::create([
                'user_id' => $userId,
                'key' => $key,
                'request_hash' => $requestHash,
            ]);
        } catch (QueryException $exception) {
            // Deux envois simultanés avec la même clé : l'index UNIQUE a
            // tranché. Le second client réessaiera et recevra la réponse.
            if ($this->isUniqueViolation($exception)) {
                return $this->json(
                    'Une requête identique est déjà en cours de traitement.',
                    409,
                    ['Retry-After' => '1']
                );
            }
            throw $exception;
        }

        try {
            $response = $next($request);
        } catch (Throwable $exception) {
            // Rien n'a été mémorisé : une nouvelle tentative est autorisée.
            $record->delete();
            throw $exception;
        }

        try {
            if ($response->getStatusCode() >= 500) {
                // Erreur serveur : on ne fige pas l'échec, le client pourra
                // réessayer plus tard.
                $record->delete();
            } else {
                $this->remember($record, $response);
            }
        } catch (Throwable $exception) {
            // La réponse a déjà été produite : ne jamais la remplacer par une
            // erreur de stockage. On libère simplement la clé.
            $record->delete();
        }

        return $response;
    }

    private function remember(IdempotencyKey $record, Response $response): void
    {
        $content = $response->getContent();
        $contentType = $response->headers->get('Content-Type') ?? 'application/json';

        $record->forceFill([
            'response_status' => $response->getStatusCode(),
            'response_body' => is_string($content) ? $content : null,
            'content_type' => substr($contentType, 0, 120),
        ])->save();
    }

    private function replay(IdempotencyKey $record): Response
    {
        $status = $record->response_status ?? 200;
        $body = $record->response_body;
        $contentType = $record->content_type ?? 'application/json';

        $response = $body === null
            ? response()->noContent($status)
            : response($body, $status);

        return $response
            ->header('Content-Type', $contentType)
            ->header('X-Idempotency-Replayed', 'true');
    }

    private function json(string $message, int $status, array $headers = []): Response
    {
        return response()->json(['message' => $message], $status, $headers);
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? null;
        $driverCode = $exception->errorInfo[1] ?? null;

        // MySQL : 23000 / 1062. SQLite : 23000 / 19.
        return $sqlState === '23000' || $driverCode === 1062 || $driverCode === 19;
    }
}
