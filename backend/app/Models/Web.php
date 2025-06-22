<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Web extends Model
{
    use HasFactory;

    protected $fillable = [
        'subdomain',
        'user_id',
        'api_key',
        'status',
        'is_customized',
    ];
    public function business_settings()
    {
        return $this->belongsTo(Business_setting::class);
    }
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function rechargeCards()
    {
        return $this->hasMany(RechargeCard::class);
    }

    public function rechargeBanks()
    {
        return $this->hasMany(RechargeBank::class);
    }

    public function donatePromotions()
    {
        return $this->hasMany(DonatePromotion::class);
    }

    public function banners()
    {
        return $this->hasMany(Banner::class);
    }
}
