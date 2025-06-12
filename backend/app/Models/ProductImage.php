<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;
public $timestamps = false;
    protected $fillable = [
        'product_id',
        'image_url',
        // 'is_primary', // This was commented out
        'alt_text',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
