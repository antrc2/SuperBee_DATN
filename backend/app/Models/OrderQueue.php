<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderQueue extends Model
{
   use HasFactory;

    protected $fillable = [
        'order_item_id',
        'amount',
        'recieved_at',
        'status',
    ];
    public function order_item()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
