<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductDetail extends Model
{
    protected $fillable = ['product_id', 'price', 'web_id'];

    protected $casts = [
        'price' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }
}