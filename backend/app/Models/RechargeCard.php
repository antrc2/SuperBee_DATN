<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RechargeCard extends Model
{
    use HasFactory;

    protected $table = 'recharges_card'; // Tên bảng khác với convention

    protected $fillable = [
        'wallet_transaction_id', // Might be set after creation
        'user_id',
        'web_id',
        'amount',
        'value',
        'declared_value',
        'telco',
        'serial',
        'code',
        'status',
        'message',
        'sign',
        'donate_promotion_id',
        "donate_amount"
    ];
    protected $hidden = [
        'sign',
    ];
    public function walletTransaction()
    {
        return $this->belongsTo(WalletTransaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function web()
    {
        return $this->belongsTo(Web::class);
    }
}
