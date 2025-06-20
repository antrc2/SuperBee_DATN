<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business_setting extends Model
{
    use HasFactory;

    // Đổi tên bảng nếu bạn đã đổi tên từ 'shops' sang 'stores'
    protected $table = 'business_settings';

    protected $fillable = [
        'user_id',
        'shop_name',
        'slogan',
        'logo_url',
        'favicon_url',
        'phone_number',
        'email',
        'address',
        'zalo_link',
        'facebook_link',
        'template_name',      // Thêm vào đây
        'header_settings',    // Thêm vào đây
        'footer_settings',    // Thêm vào đây
    ];

    protected $casts = [
        'header_settings' => 'array', // Tự động chuyển JSON sang array/object
        'footer_settings' => 'array', // Tự động chuyển JSON sang array/object
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function webs()
    {
        return $this->hasMany(Web::class);
    }
}
