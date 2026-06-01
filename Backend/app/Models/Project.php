<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_id',
        'name',
        'description',
        'color',
        'status',
        'deadline',
        'time_budget',
        'time_budget_warning',
    ];

    protected $appends = [
        'spent_seconds',
        'budget_usage_percent',
        'budget_status',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'time_budget' => 'integer',
            'time_budget_warning' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function getSpentSecondsAttribute(): int
    {
        return $this->timeEntries()->sum('duration') ?? 0;
    }

    public function getBudgetUsagePercentAttribute(): int
    {
        if (!$this->time_budget || $this->time_budget <= 0) return 0;
        return min(100, (int) round(($this->spent_seconds / $this->time_budget) * 100));
    }

    public function getBudgetStatusAttribute(): string
    {
        if (!$this->time_budget || $this->time_budget <= 0) return 'none';
        if ($this->budget_usage_percent >= 100) return 'exceeded';
        if ($this->budget_usage_percent >= $this->time_budget_warning) return 'warning';
        return 'ok';
    }
}
