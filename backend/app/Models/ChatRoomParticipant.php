<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatRoomParticipant extends Model
{
    use HasFactory;

    /**
     * Tên bảng liên kết với Model này.
     * @var string
     */
    protected $table = 'chat_room_participants';

    /**
     * Các thuộc tính có thể được gán hàng loạt.
     * @var array<int, string>
     */
    protected $fillable = [
        'chat_room_id',
        'user_id',
        'role',
        'joined_at',
        'left_at',
    ];

    /**
     * Các thuộc tính nên được chuyển đổi sang kiểu dữ liệu cụ thể.
     * @var array<string, string>
     */
    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    /**
     * Lấy phòng chat mà người tham gia thuộc về.
     *
     * @return BelongsTo
     */
    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class, 'chat_room_id');
    }

     public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
