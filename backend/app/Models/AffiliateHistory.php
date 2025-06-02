<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'affiliate_id',
        'commission_amount',
        'order_id',
    ];

    public function affiliate()
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
