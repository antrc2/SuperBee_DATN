<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCredential extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'username',
        'password', // Ensure this is encrypted/decrypted at application level if sensitive
        // 'login_method', // This was commented out
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
