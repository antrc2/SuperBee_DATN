<?php
// File: app/Models/Agent.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    use HasFactory;

    protected $fillable = [
        'display_name',
        'type',
        'web_id',
        'status',
    ];

    /**
     * SỬA LẠI: Giữ lại một tên quan hệ duy nhất và nhất quán là `assignment`
     * Một vị trí (Agent) có một phân công (AgentAssignment).
     */
    public function assignment()
    {
        return $this->hasOne(AgentAssignment::class, 'agent_id');
    }

    /**
     * Lấy nhân viên hiện tại được phân công cho vị trí này thông qua assignment.
     */
    public function assignedUser()
    {
        return $this->hasOneThrough(
            User::class,
            AgentAssignment::class,
            'agent_id', // Khóa ngoại trên bảng agent_assignments
            'id',       // Khóa ngoại trên bảng users
            'id',       // Khóa chính trên bảng agents
            'user_id'   // Khóa chính trên bảng agent_assignments
        );
    }

    /**
     * Mối quan hệ với Website.
     */
    public function web()
    {
        return $this->belongsTo(Web::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes - Được dọn dẹp và sửa lại cho đúng
    |--------------------------------------------------------------------------
    */

    /**
     * Scope: Lấy theo loại (support/complaint)
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Lọc các vị trí đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Lọc các vị trí còn trống (chưa có assignment)
     * SỬA LẠI: Dùng đúng tên quan hệ 'assignment'
     */
    public function scopeAvailable($query)
    {
        return $query->whereDoesntHave('assignment');
    }

    /**
     * Scope: Lọc các vị trí đã có người
     * SỬA LẠI: Dùng đúng tên quan hệ 'assignment'
     */
    public function scopeAssigned($query)
    {
        return $query->whereHas('assignment');
    }
}