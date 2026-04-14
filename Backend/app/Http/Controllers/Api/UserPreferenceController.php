<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserPreferenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $preferences = $request->user()->preferences;
        
        if (!$preferences) {
            $preferences = $request->user()->preferences()->create([]);
        }
        
        return response()->json($preferences);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'timezone' => ['nullable', 'string', 'max:50'],
            'work_start_time' => ['nullable', 'date_format:H:i'],
            'work_end_time' => ['nullable', 'date_format:H:i'],
            'peak_productivity_hours' => ['nullable', 'in:morning,afternoon,evening,night'],
            'task_duration_preference' => ['nullable', 'in:short,medium,long,very_long'],
            'work_style' => ['nullable', 'in:pomodoro,continuous'],
            'has_recurring_tasks' => ['nullable', 'boolean'],
            'goals' => ['nullable', 'array'],
            'daily_time_dedication' => ['nullable', 'string', 'max:50'],
            'planning_style' => ['nullable', 'in:strict,flexible'],
            'receive_reminders' => ['nullable', 'boolean'],
            'unplanned_tasks_handling' => ['nullable', 'in:immediate,defer,ignore'],
            'works_in_team' => ['nullable', 'boolean'],
            'needs_to_share' => ['nullable', 'boolean'],
            'use_labels' => ['nullable', 'boolean'],
            'interface_preference' => ['nullable', 'in:visual,list'],
            'dark_mode' => ['nullable', 'boolean'],
            'personal_development_goals' => ['nullable', 'array'],
            'personal_dev_time' => ['nullable', 'string', 'max:50'],
            'habits_to_develop' => ['nullable', 'array'],
            'productivity_challenges' => ['nullable', 'array'],
            'has_routines' => ['nullable', 'boolean'],
            'life_priorities' => ['nullable', 'array'],
            'success_definition' => ['nullable', 'string'],
            'main_time_challenge' => ['nullable', 'string'],
            'app_expectations' => ['nullable', 'string'],
            'has_hobbies_to_plan' => ['nullable', 'boolean'],
            'other_tools_used' => ['nullable', 'array'],
            'specific_constraints' => ['nullable', 'string'],
            'onboarding_completed' => ['nullable', 'boolean'],
        ]);

        $preferences = $request->user()->preferences()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        if ($request->onboarding_completed) {
            $request->user()->preferences()->update(['onboarding_completed' => true]);
        }

        return response()->json([
            'message' => 'Preferences sauvegardees',
            'preferences' => $request->user()->fresh()->preferences,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        return $this->store($request);
    }
}