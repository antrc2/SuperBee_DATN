<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = ["username, password, fullname, email, phone, avatar_url, balance, role_id, web_id, affiliated_by, status, created_at, updated_at"];
}
