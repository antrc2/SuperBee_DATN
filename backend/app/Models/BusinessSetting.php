<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessSetting extends Model
{
    protected $table = 'business_settings';

    protected $fillable = [
        'web_id',
        'shop_name',
        'slogan',
        'logo_url',
        'favicon_url',
        'phone_number',
        'email',
        'address',
        'zalo_link',
        'facebook_link',
        'template_name',
        'header_settings',
        'footer_settings',
        'auto_post',
        'auto_transaction',
        'auto_post_interval',
    ];

    protected $casts = [
        'header_settings' => 'array',
        'footer_settings' => 'array',
        'auto_post' => 'boolean', 
        'auto_transaction' => 'boolean',
        'auto_post_interval' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    public function web()
    {
        return $this->belongsTo(Web::class, 'web_id');
    }
}