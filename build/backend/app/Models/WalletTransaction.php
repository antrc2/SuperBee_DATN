<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'related_id',
        'related_type',
        'status',
        // 'description', // This was commented out
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }

    public function rechargeCard()
    {
        return $this->hasOne(RechargeCard::class);
    }

    public function rechargeBank()
    {
        return $this->hasOne(RechargeBank::class);
    }

    public function withdraw()
    {
        return $this->hasOne(Withdraw::class);
    }
}
