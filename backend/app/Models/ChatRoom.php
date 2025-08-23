<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'status',
        'agent_id',
        'created_by',
        'dispute_id', // <-- THÊM DÒNG NÀY
    ];

    /**
     * Lấy tất cả tin nhắn trong phòng chat.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_room_id');
    }

    /**
     * Lấy tin nhắn mới nhất của phòng chat.
     */
    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'chat_room_id')->latestOfMany();
    }

    /**
     * Lấy tất cả người dùng tham gia phòng chat.
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'chat_room_participants', 'chat_room_id', 'user_id')
                    ->withPivot('role', 'joined_at', 'left_at')
                    ->withTimestamps();
    }

    /**
     * Lấy "vị trí/slot" (Agent) được gán cho phòng chat này.
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    /**
     * Lấy khách hàng trong phòng chat.
     */
    public function customer()
    {
        return $this->belongsToMany(User::class, 'chat_room_participants', 'chat_room_id', 'user_id')
                    ->wherePivot('role', 'customer');
    }

    /**
     * Lấy người dùng đã tạo phòng chat.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
