<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonatePromotion extends Model
{
    protected $fillable = ['web_id', 'amount', 'start_date', 'end_date'];

    protected $casts = [
        'amount' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }
}