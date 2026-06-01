<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->bigInteger('time_budget')->nullable()->after('deadline')->comment('Budget en secondes');
            $table->integer('time_budget_warning')->default(80)->after('time_budget')->comment('Seuil d\'alerte en %');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['time_budget', 'time_budget_warning']);
        });
    }
};
