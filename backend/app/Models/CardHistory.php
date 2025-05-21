<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardHistory extends Model
{
    protected $fillable = [
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
    ];

    protected $casts = [
        'amount' => 'integer',
        'value' => 'integer',
        'declared_value' => 'integer',
        'status' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }
        public function discount_code(): BelongsTo
    {
        return $this->belongsTo(DiscountCode::class);
    }
}