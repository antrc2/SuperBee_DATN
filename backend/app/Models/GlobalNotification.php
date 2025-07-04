<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlobalNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'content',
        'published_at',
        'expires_at',
        "link"
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the users who have read this global notification.
     */
    public function usersReadStatus()
    {
        return $this->hasMany(UserGlobalNotificationStatus::class, 'global_notification_id');
    }

    /**
     * Scope a query to only include active global notifications.
     */
    public function scopeActive($query)
    {
        return $query->where('published_at', '<=', now())
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }
}