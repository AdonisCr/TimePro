<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BrainDump;
use App\Models\BrainDumpItem;
use App\Services\DailyPlanBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrainDumpController extends Controller
{
    private const ACCENT_MAP = [
        'à' => 'a', 'á' => 'a', 'â' => 'a', 'ä' => 'a', 'ã' => 'a', 'å' => 'a',
        'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
        'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
        'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'ö' => 'o', 'õ' => 'o',
        'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
        'ý' => 'y', 'ÿ' => 'y', 'ç' => 'c', 'œ' => 'oe', 'æ' => 'ae',
    ];

    /**
     * Règles d'estimation (mots-clés normalisés sans accents, minuscules).
     * Ordre = priorité de correspondance (première règle gagnante).
     */
    private const ESTIMATION_RULES = [
        ['reunion|call|appel|point', 60],
        ['email|mail|repondre|reponse', 15],
        ['rediger|ecrire|rapport|doc|presentation', 90],
        ['appeler|phone|contact', 30],
        ['acheter|commander|courses', 20],
        ['reflechir|penser|analyser|strategie', 45],
        ['payer|facture|banque|impot', 15],
        ['coder|developper|bug|implementer', 120],
    ];

    private const URGENCY_KEYWORDS = 'urgent|asap|avant|deadline|pour demain';

    private const IMPORTANCE_KEYWORDS = 'important|critique';

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['required', 'string', 'max:20000'],
        ]);

        $brainDump = $request->user()->brainDumps()->create([
            'raw_text' => $validated['text'],
        ]);

        $items = collect(preg_split('/\r\n|\r|\n/', $validated['text']))
            ->map(fn ($line) => trim((string) $line))
            ->filter(fn ($line) => $line !== '')
            ->map(fn ($line) => $brainDump->items()->create([
                'text' => mb_substr($line, 0, 500),
                'estimated_minutes' => $this->estimateMinutes($line),
                'priority' => $this->deducePriority($line),
                'status' => 'pending',
            ]));

        return response()->json([
            'id' => $brainDump->id,
            'items' => $items->map(fn (BrainDumpItem $item) => $this->itemResource($item))->values(),
        ], 201);
    }

    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $item = BrainDumpItem::findOrFail($itemId);

        if ($item->brainDump->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'estimated_minutes' => ['sometimes', 'integer', 'min:1', 'max:1440'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high'],
            'status' => ['sometimes', 'string', 'in:pending,accepted,rejected'],
        ]);

        $item->update($validated);

        return response()->json($this->itemResource($item->fresh()));
    }

    public function confirm(Request $request, int $brainDumpId): JsonResponse
    {
        $brainDump = BrainDump::findOrFail($brainDumpId);

        if ($brainDump->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $items = $brainDump->items()
            ->whereIn('status', ['pending', 'accepted'])
            ->get();

        $tasks = $items->map(function (BrainDumpItem $item) use ($request) {
            $task = $request->user()->tasks()->create([
                'title' => $item->text,
                'estimated_duration' => $item->estimated_minutes,
                'priority' => $item->priority,
                'status' => 'todo',
            ]);

            $item->update([
                'status' => 'converted',
                'task_id' => $task->id,
            ]);

            return $task;
        });

        $plan = app(DailyPlanBuilder::class)->build($request->user());

        return response()->json([
            'tasks' => $tasks,
            'plan' => $plan,
        ]);
    }

    public function planningToday(Request $request): JsonResponse
    {
        $plan = app(DailyPlanBuilder::class)->build($request->user());

        return response()->json($plan);
    }

    private function itemResource(BrainDumpItem $item): array
    {
        return [
            'id' => $item->id,
            'text' => $item->text,
            'estimated_minutes' => $item->estimated_minutes,
            'priority' => $item->priority,
            'status' => $item->status,
        ];
    }

    private function estimateMinutes(string $text): int
    {
        $normalized = $this->normalize($text);

        foreach (self::ESTIMATION_RULES as [$pattern, $minutes]) {
            if (preg_match('/(?:'.$pattern.')/u', $normalized)) {
                return $minutes;
            }
        }

        return 30;
    }

    private function deducePriority(string $text): string
    {
        $normalized = $this->normalize($text);

        if (preg_match('/(?:'.self::URGENCY_KEYWORDS.')/u', $normalized)
            || preg_match('/(?:'.self::IMPORTANCE_KEYWORDS.')/u', $normalized)) {
            return 'high';
        }

        return 'medium';
    }

    private function normalize(string $value): string
    {
        $value = mb_strtolower($value, 'UTF-8');

        return strtr($value, self::ACCENT_MAP);
    }
}
