<?php
// File: app/Models/AgentAssignment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'user_id',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /**
     * Quan hệ với Agent (vị trí)
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Quan hệ với User (nhân viên)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ với Employee (thông tin mở rộng của nhân viên)
     */
    public function employee()
    {
        return $this->hasOneThrough(
            Employee::class,
            User::class,
            'id',      // Foreign key on users table
            'user_id', // Foreign key on employees table
            'user_id', // Local key on agent_assignments table
            'id'       // Local key on users table
        );
    }
}