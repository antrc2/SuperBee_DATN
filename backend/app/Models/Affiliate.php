<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Affiliate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'affiliated_by',
        'commission_amount', // This is often calculated, not directly filled
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function referrer() // Alias for affiliatedBy
    {
        return $this->belongsTo(User::class, 'affiliated_by');
    }

    public function affiliatedBy()
    {
        return $this->belongsTo(User::class, 'affiliated_by');
    }
}
