<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'refresh_token', // Usually generated
        'revoked',       // Usually updated, not set on creation
        'expires_at',    // Usually set on creation
        'user_agent',
    ];
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
