<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Informations de base
            $table->string('timezone', 50)->default('Europe/Paris');
            $table->time('work_start_time')->nullable();
            $table->time('work_end_time')->nullable();
            
            // Habitudes de productivite
            $table->enum('peak_productivity_hours', ['morning', 'afternoon', 'evening', 'night'])->nullable();
            $table->enum('task_duration_preference', ['short', 'medium', 'long', 'very_long'])->nullable();
            $table->enum('work_style', ['pomodoro', 'continuous'])->nullable();
            
            // Taches recurrentes
            $table->boolean('has_recurring_tasks')->default(false);
            $table->json('goals')->nullable(); // ["finish_project", "improve_productivity", etc.]
            $table->string('daily_time_dedication')->nullable(); // "1-2h", "3-4h", etc.
            
            // Preferences de planification
            $table->enum('planning_style', ['strict', 'flexible'])->default('flexible');
            $table->boolean('receive_reminders')->default(true);
            $table->enum('unplanned_tasks_handling', ['immediate', 'defer', 'ignore'])->default('defer');
            
            // Collaboration
            $table->boolean('works_in_team')->default(false);
            $table->boolean('needs_to_share')->default(false);
            
            // Preferences personnelles
            $table->boolean('use_labels')->default(true);
            $table->enum('interface_preference', ['visual', 'list'])->default('list');
            $table->boolean('dark_mode')->default(false);
            
            // Developpement personnel
            $table->json('personal_development_goals')->nullable();
            $table->string('personal_dev_time')->nullable();
            $table->json('habits_to_develop')->nullable();
            $table->json('productivity_challenges')->nullable(); // ["prioritize", "concentrate", etc.]
            $table->boolean('has_routines')->default(false);
            $table->json('life_priorities')->nullable();
            $table->text('success_definition')->nullable();
            
            // Feedback
            $table->text('main_time_challenge')->nullable();
            $table->text('app_expectations')->nullable();
            
            // Optionnel
            $table->boolean('has_hobbies_to_plan')->default(false);
            $table->json('other_tools_used')->nullable();
            $table->text('specific_constraints')->nullable();
            
            // Profil complete (questionnaire fait ou non)
            $table->boolean('onboarding_completed')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};