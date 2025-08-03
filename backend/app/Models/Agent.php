<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Agent extends Model
{
    use HasFactory;

    /**
     * Tên bảng liên kết với Model này.
     * @var string
     */
    protected $table = 'agents';

    /**
     * Các thuộc tính có thể được gán hàng loạt.
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'current_chats_count',
        'max_chats_limit',
        'average_rating',
        'total_ratings_count',
        'last_active_at',
        'web_id',
    ];

    /**
     * Các thuộc tính nên được chuyển đổi sang kiểu dữ liệu cụ thể.
     * @var array<string, string>
     */
    protected $casts = [
        'last_active_at' => 'datetime',
        'average_rating' => 'decimal:2', // Đảm bảo average_rating là số thập phân với 2 chữ số
    ];

    /**
     * Lấy thông tin người dùng liên kết với agent này.
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Lấy các phòng chat mà agent này tham gia.
     *
     * @return BelongsToMany
     */
    public function chatRooms(): BelongsToMany
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_room_participants', 'user_id', 'chat_room_id')
                    ->wherePivot('role', 'agent') // Chỉ lấy các phòng chat mà user này là agent
                    ->withPivot('joined_at', 'left_at')
                    ->withTimestamps();
    }
}
