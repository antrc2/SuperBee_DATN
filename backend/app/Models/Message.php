<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_room_id',
        'sender_id',
        'content',
        'attachment_url',
    ];

    /**
     * Lấy phòng chat mà tin nhắn thuộc về.
     *
     * 
     */
    public function chatRoom()
    {
        return $this->belongsTo(ChatRoom::class, 'chat_room_id');
    }

    /**
     * Lấy người gửi tin nhắn.
     *
     *
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
