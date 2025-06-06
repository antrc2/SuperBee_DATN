<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductGameAttribute extends Model
{
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'product_id',
        // 'game_code', // This was commented out in your migration
        'attribute_key',
        'attribute_value',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
