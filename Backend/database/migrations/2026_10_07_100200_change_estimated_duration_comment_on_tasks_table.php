<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Le comment() n'est pas supporté par SQLite : ignoré silencieusement en test.
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('estimated_duration')->nullable()->comment('Durée estimée en minutes')->change();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('estimated_duration')->nullable()->comment('Durée estimée en heures')->change();
        });
    }
};
