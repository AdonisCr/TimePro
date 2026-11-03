<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'endpoint_hash',
        'keys',
        'user_agent',
    ];

    protected $hidden = [
        'endpoint_hash',
    ];

    protected $casts = [
        'keys' => 'array',
    ];

    protected static function booted(): void
    {
        // Empreinte stable de l'endpoint : permet un index UNIQUE compatible
        // MySQL (un endpoint est un TEXT trop long pour un index complet).
        static::saving(function (PushSubscription $subscription) {
            $subscription->endpoint_hash = hash('sha256', (string) $subscription->endpoint);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
