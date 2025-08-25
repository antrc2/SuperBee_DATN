<?php
// File: app/Models/Employee.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_code',
        'job_title',
        'department',
        'start_date',
        'status',
        'manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
    ];

    /**
     * Mối quan hệ: Một Employee thuộc về một User.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * SỬA LẠI: Định nghĩa lại mối quan hệ để lấy thông tin gán vị trí (assignment).
     * Logic: Một Employee có một AgentAssignment, liên kết trực tiếp qua cột `user_id` ở cả hai bảng.
     */
    public function agentAssignment()
    {
        return $this->hasOne(AgentAssignment::class, 'user_id', 'user_id');
    }

    /**
     * Mối quan hệ với Manager (tự tham chiếu)
     */
    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    /**
     * Mối quan hệ với nhân viên dưới quyền
     */
    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }
}