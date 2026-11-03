<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Protège les données métier :
     *  - supprimer un projet ne supprime plus ses tâches ni son historique de temps ;
     *  - supprimer une tâche ne supprime plus son historique de temps ni ses sous-tâches ;
     *  - ajoute les contraintes d'unicité et les index manquants.
     *
     * SQLite ne sait pas modifier une clé étrangère existante : sur ce moteur
     * (utilisé par les tests) les règles sont appliquées dans les contrôleurs.
     */
    public function up(): void
    {
        $supportsAlterForeign = in_array(DB::getDriverName(), ['mysql', 'pgsql', 'sqlsrv'], true);

        if ($supportsAlterForeign) {
            $this->replaceCascadesByNullOnDelete();
        }

        $this->addUserPreferencesUnique();
        $this->addPushSubscriptionUnique();
        $this->addInvitationUnique();
        $this->addIndexes();
    }

    public function down(): void
    {
        $supportsAlterForeign = in_array(DB::getDriverName(), ['mysql', 'pgsql', 'sqlsrv'], true);

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'is_read']);
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->dropIndex(['start_time']);
        });

        Schema::table('team_invitations', function (Blueprint $table) {
            $table->dropUnique(['team_id', 'email', 'accepted_at']);
        });

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'endpoint_hash']);
            $table->dropColumn('endpoint_hash');
        });

        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });

        if ($supportsAlterForeign) {
            $this->restoreCascades();
        }
    }

    private function replaceCascadesByNullOnDelete(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['depends_on']);
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->dropForeign(['task_id']);
            $table->dropForeign(['project_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->nullOnDelete();
            $table->foreign('parent_id')->references('id')->on('tasks')->nullOnDelete();
            $table->foreign('depends_on')->references('id')->on('tasks')->nullOnDelete();
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->foreign('task_id')->references('id')->on('tasks')->nullOnDelete();
            $table->foreign('project_id')->references('id')->on('projects')->nullOnDelete();
        });
    }

    private function restoreCascades(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['depends_on']);
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->dropForeign(['task_id']);
            $table->dropForeign(['project_id']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->foreign('parent_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->foreign('depends_on')->references('id')->on('tasks')->cascadeOnDelete();
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->foreign('task_id')->references('id')->on('tasks')->cascadeOnDelete();
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }

    private function addUserPreferencesUnique(): void
    {
        // Garde la ligne la plus récente par utilisateur avant d'imposer
        // l'unicité (au cas où des doublons existent déjà).
        $duplicates = DB::table('user_preferences')
            ->select('user_id', DB::raw('MAX(id) as keep_id'))
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('user_preferences')
                ->where('user_id', $duplicate->user_id)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();
        }

        Schema::table('user_preferences', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    private function addPushSubscriptionUnique(): void
    {
        // Un endpoint peut dépasser la taille maximale d'un index MySQL :
        // on stocke un empreinte SHA-256 pour l'unicité.
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->string('endpoint_hash', 64)->nullable()->after('endpoint');
        });

        DB::table('push_subscriptions')
            ->select('id', 'endpoint')
            ->orderBy('id')
            ->each(function ($row) {
                DB::table('push_subscriptions')
                    ->where('id', $row->id)
                    ->update(['endpoint_hash' => hash('sha256', $row->endpoint)]);
            });

        $duplicates = DB::table('push_subscriptions')
            ->select('user_id', 'endpoint_hash', DB::raw('MAX(id) as keep_id'))
            ->whereNotNull('endpoint_hash')
            ->groupBy('user_id', 'endpoint_hash')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            DB::table('push_subscriptions')
                ->where('user_id', $duplicate->user_id)
                ->where('endpoint_hash', $duplicate->endpoint_hash)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();
        }

        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->unique(['user_id', 'endpoint_hash']);
        });
    }

    private function addInvitationUnique(): void
    {
        // MySQL autorise plusieurs NULL : cette contrainte couvre surtout les
        // invitations acceptées. L'unicité des invitations en attente reste
        // garantie par TeamController::invite().
        Schema::table('team_invitations', function (Blueprint $table) {
            $table->unique(['team_id', 'email', 'accepted_at']);
        });
    }

    private function addIndexes(): void
    {
        Schema::table('time_entries', function (Blueprint $table) {
            $table->index('start_time');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read']);
        });
    }
};
