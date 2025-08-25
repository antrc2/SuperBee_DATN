<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;


    protected $fillable = [
        "promotion_user_id",
        'code',
        'description',
        // 'discount_type', // This was commented out
        'discount_value',
        'min_discount_amount',
        'max_discount_amount',
        'start_date',
        'end_date',
        'usage_limit',
        'per_user_limit',
        'total_used', // This is usually incremented, not directly filled
        'status',
        'created_by',
        'updated_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    public function orders()
    {
        return $this->hasMany(\App\Models\Order::class, 'promo_code', 'code');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function promotion_user(){
        return $this->hasMany(PromotionUser::class);
    }
}
