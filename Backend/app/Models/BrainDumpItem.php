<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BrainDumpItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'brain_dump_id',
        'text',
        'estimated_minutes',
        'priority',
        'status',
        'task_id',
    ];

    protected function casts(): array
    {
        return [
            'estimated_minutes' => 'integer',
        ];
    }

    public function brainDump(): BelongsTo
    {
        return $this->belongsTo(BrainDump::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
