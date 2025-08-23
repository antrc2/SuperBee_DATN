<?php
// File: database/migrations/YYYY_MM_DD_HHMMSS_refactor_agent_system_to_v3.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        // === 1. Xóa các bảng cũ để đảm bảo làm sạch ===
        // Luôn xóa bảng có khóa ngoại trỏ đến bảng khác trước
        Schema::dropIfExists('agent_assignments');
        Schema::dropIfExists('agents');

        // === 2. Tạo lại bảng `agents` với cấu trúc đúng ===
        // Bảng này giờ đây định nghĩa các "vị trí" (slot), không còn liên quan trực tiếp đến user_id làm khóa chính.
        Schema::create('agents', function (Blueprint $table) {
            $table->id(); // Khóa chính tự tăng
            $table->string('display_name')->comment('Tên hiển thị của vị trí, ví dụ: Hỗ trợ viên Ca Sáng');
            $table->enum('type', ['support', 'complaint'])->comment('Loại vị trí: support, complaint')->index();
            $table->foreignId('web_id')->default(1)->constrained()->onDelete('cascade')->comment('ID của website');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // === 3. Tạo lại bảng `agent_assignments` ===
        // Bảng này dùng để gán một nhân viên (user_id) vào một vị trí (agent_id).
        Schema::create('agent_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->unique()->constrained()->onDelete('cascade')->comment('ID của vị trí hỗ trợ từ bảng agents');
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade')->comment('ID của nhân viên thực tế từ bảng users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
        });

        // === 4. Cập nhật bảng `chat_rooms` để tương thích ===
        Schema::table('chat_rooms', function (Blueprint $table) {
            // Chỉ thêm cột nếu nó chưa tồn tại để tránh lỗi khi chạy lại migrate
            if (!Schema::hasColumn('chat_rooms', 'agent_user_id')) {
                // onDelete('set null') nghĩa là nếu user bị xóa, cột này sẽ tự động set thành NULL.
                $table->foreignId('agent_user_id')->nullable()->after('status')->constrained('users')->onDelete('set null')->comment('ID của nhân viên đang xử lý');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        // Thực hiện các hành động ngược lại để có thể rollback
        Schema::table('chat_rooms', function (Blueprint $table) {
            if (Schema::hasColumn('chat_rooms', 'agent_user_id')) {
                // Phải xóa khóa ngoại trước khi xóa cột
                $table->dropForeign(['agent_user_id']);
                $table->dropColumn('agent_user_id');
            }
        });

        Schema::dropIfExists('agent_assignments');
        Schema::dropIfExists('agents');
    }
};
