<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'parent_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'start_date',
        'estimated_duration',
        'is_completed',
        'order',
        'recurrence',
        'recurrence_end_date',
        'recurrence_count',
        'depends_on',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'start_date' => 'date',
            'estimated_duration' => 'integer',
            'is_completed' => 'boolean',
            'recurrence_end_date' => 'date',
            'recurrence_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class);
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function dependsOn(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'depends_on');
    }

    public function dependentTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'depends_on');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }
}
