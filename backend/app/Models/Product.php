<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'sku',
        'import_price',
        'description',
        'price',
        'sale',
        'status',
        'web_id',
        'created_by',
        'updated_by',
        'refusal_reason'
    ];

    protected $casts = [
        'import_price' => 'integer',
        'price' => 'integer',
        'sale' => 'integer',
        'status' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function web()
    {
        return $this->belongsTo(Web::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function gameAttributes()
    {
        // Giả sử một product có một bộ game attributes
        return $this->hasMany(ProductGameAttribute::class);
    }

    public function credentials()
    {
        return $this->hasMany(ProductCredential::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reports()
    {
        return $this->hasMany(ProductReport::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
