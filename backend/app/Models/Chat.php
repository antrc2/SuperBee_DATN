<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{
    protected $fillable = ['user_id', 'web_id', 'chat_title'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function web(): BelongsTo
    {
        return $this->belongsTo(Web::class);
    }

    public function chatDetails(): HasMany
    {
        return $this->hasMany(ChatDetail::class);
    }
}