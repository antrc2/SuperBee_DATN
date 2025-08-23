<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id(); // Khóa chính tự tăng cho bảng employees

            // Liên kết 1-1 với bảng users, đây là cột quan trọng nhất
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('employee_code')->unique()->comment('Mã nhân viên, ví dụ: NV001');
            $table->string('job_title')->comment('Chức vụ, ví dụ: Kế toán viên, Nhân viên Hỗ trợ');
            $table->string('department')->nullable()->comment('Phòng ban, ví dụ: Tài chính, Chăm sóc Khách hàng');
            $table->date('start_date')->comment('Ngày vào làm');
            $table->enum('status', ['active', 'on_leave', 'terminated'])->default('active')->comment('Trạng thái làm việc');
            
            // Tùy chọn: Để xây dựng cây tổ chức, lưu ID của người quản lý
            $table->unsignedBigInteger('manager_id')->nullable()->comment('ID của người quản lý (trỏ đến chính bảng employees)');
            
            $table->timestamps(); // created_at và updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};