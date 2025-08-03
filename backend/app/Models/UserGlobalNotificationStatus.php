<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGlobalNotificationStatus extends Model
{
    use HasFactory;

    // Tắt timestamps mặc định vì bảng này chỉ có read_at
    public $timestamps = false;
    protected $table = 'user_global_notification_status';
    protected $fillable = [
        'user_id',
        'global_notification_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    // Định nghĩa khóa chính kép
    protected $primaryKey = ['user_id', 'global_notification_id'];
    public $incrementing = false; // Tắt auto-increment cho khóa chính kép

    /**
     * Get the user that read the notification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the global notification that was read.
     */
    public function globalNotification()
    {
        return $this->belongsTo(GlobalNotification::class, 'global_notification_id');
    }
}