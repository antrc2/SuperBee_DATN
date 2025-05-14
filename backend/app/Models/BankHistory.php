<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankHistory extends Model
{
    protected $fillable = ['user_id', 'web_id', 'amount'];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }
}