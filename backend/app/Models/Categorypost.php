<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorypost extends Model
{
    use HasFactory;

    protected $table = 'categories_post';
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    // Nếu bạn muốn định nghĩa mối quan hệ với các bài viết (Posts)
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}