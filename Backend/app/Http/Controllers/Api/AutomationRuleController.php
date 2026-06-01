<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutomationRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AutomationRuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $rules = $request->user()->automationRules()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($rules);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'trigger_type' => ['required', Rule::in([
                'task_status_changed',
                'budget_exceeded',
                'task_overdue',
                'time_entry_added',
                'task_created',
            ])],
            'trigger_config' => ['nullable', 'array'],
            'action_type' => ['required', Rule::in([
                'send_notification',
                'update_task_status',
            ])],
            'action_config' => ['nullable', 'array'],
        ]);

        $rule = $request->user()->automationRules()->create($validated);
        return response()->json($rule, 201);
    }

    public function show(Request $request, AutomationRule $automationRule): JsonResponse
    {
        if ($automationRule->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($automationRule);
    }

    public function update(Request $request, AutomationRule $automationRule): JsonResponse
    {
        if ($automationRule->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'trigger_type' => ['sometimes', 'required', Rule::in([
                'task_status_changed',
                'budget_exceeded',
                'task_overdue',
                'time_entry_added',
                'task_created',
            ])],
            'trigger_config' => ['nullable', 'array'],
            'action_type' => ['sometimes', 'required', Rule::in([
                'send_notification',
                'update_task_status',
            ])],
            'action_config' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ]);

        $automationRule->update($validated);
        return response()->json($automationRule->fresh());
    }

    public function destroy(Request $request, AutomationRule $automationRule): JsonResponse
    {
        if ($automationRule->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $automationRule->delete();
        return response()->json(['message' => 'Règle supprimée']);
    }

    public function toggle(Request $request, AutomationRule $automationRule): JsonResponse
    {
        if ($automationRule->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $automationRule->update(['is_active' => !$automationRule->is_active]);
        return response()->json($automationRule->fresh());
    }
}
