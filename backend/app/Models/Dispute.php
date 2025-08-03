<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'order_item_id',
        'dispute_type',
        'description',
        'attachments',
        'status',
        'resolution',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // Tự động chuyển đổi cột 'attachments' từ JSON trong DB thành array trong PHP
        'attachments' => 'array', 
    ];

    /**
     * Lấy thông tin người dùng đã tạo khiếu nại.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy thông tin item trong đơn hàng bị khiếu nại.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}