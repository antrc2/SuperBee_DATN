<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status', // Thêm 'status' vào fillable
    ];

    /**
     * Lấy người dùng đã tạo phòng chat.
     *
     *
     */
    /**
     * Lấy tất cả tin nhắn trong phòng chat.
     *
     *
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_room_id');
    }

    /**
     * Lấy tất cả người tham gia trong phòng chat.
     *
     * 
     */
    public function participants()
    {
        return $this->hasMany(ChatRoomParticipant::class, 'chat_room_id');
    }

    /**
     * Lấy tất cả người dùng (khách hàng và agent) trong phòng chat thông qua bảng trung gian.
     *
     * 
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'chat_room_participants', 'chat_room_id', 'user_id')
                    ->withPivot('role', 'joined_at', 'left_at')
                    ->withTimestamps();
    }

    /**
     * Lấy các agent trong phòng chat.
     *
     * 
     */
    public function agents()
    {
        return $this->belongsToMany(User::class, 'chat_room_participants', 'chat_room_id', 'user_id')
                    ->wherePivot('role', 'agent')
                    ->withPivot('joined_at', 'left_at')
                    ->withTimestamps();
    }

    /**
     * Lấy khách hàng trong phòng chat 1-1.
     *
     * 
     */
    public function customer()
    {
        return $this->belongsToMany(User::class, 'chat_room_participants', 'chat_room_id', 'user_id')
                    ->wherePivot('role', 'customer')
                    ->withPivot('joined_at', 'left_at')
                    ->withTimestamps();
    }
}
