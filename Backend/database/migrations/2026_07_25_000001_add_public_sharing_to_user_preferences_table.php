<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->boolean('public_planning')->default(false)->after('onboarding_completed');
            $table->boolean('public_stats')->default(false)->after('public_planning');
            $table->boolean('public_projects')->default(false)->after('public_stats');
        });
    }

    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'public_planning',
                'public_stats',
                'public_projects',
            ]);
        });
    }
};
