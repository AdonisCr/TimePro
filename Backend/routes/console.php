<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nettoyage quotidien des clés d'idempotence (7 jours de conservation).
Schedule::command('idempotency:prune')->dailyAt('03:15');

// Rappel des tâches dont l'échéance arrive dans les prochaines 24 heures.
Schedule::command('notifications:due-soon')->dailyAt('08:00');
