<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->enum('focus_method', ['pomodoro', 'deep_work', 'flowtime', 'fifty_two_seventeen', 'timebox'])
                ->default('pomodoro')
                ->after('work_style');
        });
    }

    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn('focus_method');
        });
    }
};
