<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'timezone',
        'work_start_time',
        'work_end_time',
        'peak_productivity_hours',
        'task_duration_preference',
        'work_style',
        'has_recurring_tasks',
        'goals',
        'daily_time_dedication',
        'planning_style',
        'receive_reminders',
        'unplanned_tasks_handling',
        'works_in_team',
        'needs_to_share',
        'use_labels',
        'interface_preference',
        'dark_mode',
        'personal_development_goals',
        'personal_dev_time',
        'habits_to_develop',
        'productivity_challenges',
        'has_routines',
        'life_priorities',
        'success_definition',
        'main_time_challenge',
        'app_expectations',
        'has_hobbies_to_plan',
        'other_tools_used',
        'specific_constraints',
        'onboarding_completed',
    ];

    protected function casts(): array
    {
        return [
            'goals' => 'array',
            'personal_development_goals' => 'array',
            'habits_to_develop' => 'array',
            'productivity_challenges' => 'array',
            'life_priorities' => 'array',
            'other_tools_used' => 'array',
            'has_recurring_tasks' => 'boolean',
            'receive_reminders' => 'boolean',
            'works_in_team' => 'boolean',
            'needs_to_share' => 'boolean',
            'use_labels' => 'boolean',
            'dark_mode' => 'boolean',
            'has_routines' => 'boolean',
            'has_hobbies_to_plan' => 'boolean',
            'onboarding_completed' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}