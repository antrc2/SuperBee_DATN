<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscountCode extends Model
{
    protected $fillable = [
        "id",
        'code',
        'usage_limit',
        'used_count',
        'end_date',
        'discount_amount',
        'min_discount_amount',
        'max_discount_amount',
        'user_id',
        'web_id',
        'created_by',
        'updated_by',
        'start_date',
    ];

    protected $casts = [
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'discount_amount' => 'integer',
        'min_discount_amount' => 'integer',
        'max_discount_amount' => 'integer',
        'end_date' => 'datetime',
        'start_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    public function bank(): BelongsTo
    {
        return $this->belongsTo(BankHistory::class);
    }
    public function card(): BelongsTo
    {
        return $this->belongsTo(CardHistory::class);
    }
}
