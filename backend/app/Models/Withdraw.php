<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdraw extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_transaction_id', // Usually linked after processing
        'user_id',
        'amount',
        'bank_account_number',
        'bank_name',
        // 'account_holder_name',
        "add_description",
        'note',
        'status',
    ];

    public function walletTransaction()
    {
        return $this->belongsTo(WalletTransaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
