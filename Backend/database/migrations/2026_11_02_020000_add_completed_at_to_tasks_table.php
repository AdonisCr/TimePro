<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute la vraie date de complétion d'une tâche.
     *
     * `updated_at` change à chaque modification (renommage, priorité, etc.) :
     * il ne permet pas de savoir quand une tâche a réellement été terminée.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('is_completed');
        });

        // Reprend l'historique existant : pour les tâches déjà terminées, on
        // utilise la dernière mise à jour comme meilleure approximation.
        DB::table('tasks')
            ->where(function ($query) {
                $query->where('status', 'done')->orWhere('is_completed', true);
            })
            ->update(['completed_at' => DB::raw('updated_at')]);
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });
    }
};
