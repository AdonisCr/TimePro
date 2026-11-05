<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Index composites pour les écrans qui filtrent par utilisateur puis par
     * statut ou par date. Sans eux, MySQL parcourt toutes les lignes de
     * l'utilisateur avant de filtrer.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'tasks_user_id_status_index');
            $table->index(['user_id', 'due_date'], 'tasks_user_id_due_date_index');
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->index(['user_id', 'start_time'], 'time_entries_user_id_start_time_index');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('tasks_user_id_status_index');
            $table->dropIndex('tasks_user_id_due_date_index');
        });

        Schema::table('time_entries', function (Blueprint $table) {
            $table->dropIndex('time_entries_user_id_start_time_index');
        });
    }
};
