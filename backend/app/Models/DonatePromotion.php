<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonatePromotion extends Model
{
    use HasFactory;
    protected $table = 'donate_promotions'; // Tên bảng khác với convention

    protected $fillable = [
        'web_id',
        // 'code',
        // 'description', // This was commented out
        // 'promotion_type', // This was commented out
        'amount',
        'start_date',
        'end_date',
        'usage_limit',
        'per_user_limit',
        // 'total_used', // This is usually incremented
        'status',
        'created_by',
        'updated_by',
    ];


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
}
