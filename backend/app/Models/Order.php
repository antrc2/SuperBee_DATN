<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_code', // Often auto-generated
        'total_amount',
        'wallet_transaction_id', // This might be set after order creation/payment
        'status',
        'promo_code',
        'discount_amount',
        'bill_url'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function walletTransaction()
    {
        return $this->belongsTo(WalletTransaction::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
    public function promotion()
    {
        // belongsTo: khóa ngoại promo_code trong orders, tham chiếu đến cột code ở bảng promotions
        return $this->belongsTo(Promotion::class, 'promo_code', 'code');
    }
    public function queue(){
        return $this->hasOne(OrderQueue::class);
    }
}
