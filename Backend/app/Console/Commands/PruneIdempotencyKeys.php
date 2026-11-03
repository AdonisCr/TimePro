<?php

namespace App\Console\Commands;

use App\Models\IdempotencyKey;
use Illuminate\Console\Command;

class PruneIdempotencyKeys extends Command
{
    protected $signature = 'idempotency:prune {--days=7 : Âge minimum avant suppression}';

    protected $description = 'Supprime les clés d\'idempotence trop anciennes.';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));

        $deleted = IdempotencyKey::query()
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        $this->info("{$deleted} clé(s) d'idempotence supprimée(s).");

        return self::SUCCESS;
    }
}
