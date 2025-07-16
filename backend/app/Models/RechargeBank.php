<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RechargeBank extends Model
{
    use HasFactory;
    protected $table = 'recharges_bank'; // Tên bảng khác với convention

    protected $fillable = [
        'wallet_transaction_id', // Usually linked after bank confirmation
        'user_id',
        'web_id',
        'amount',
        'transaction_reference',
        'status',
        'donate_promotion_id',
        "donate_amount"
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
