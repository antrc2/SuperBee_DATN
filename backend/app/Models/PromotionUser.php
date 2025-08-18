<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionUser extends Model
{
    use HasFactory;


    protected $fillable = [
        'user_id',
        "promotion_id"
        
    ];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function promotions(){
        return $this->belongsTo(Promotion::class);
    }
}
