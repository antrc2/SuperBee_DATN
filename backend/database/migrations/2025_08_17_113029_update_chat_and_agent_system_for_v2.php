<?php

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
        // === THAY ĐỔI 1: Nâng cấp bảng `agents` ===
        Schema::table('agents', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('user_id')->comment('Tên hiển thị của vị trí, ví dụ: Hỗ trợ viên Ca Sáng');
            // THÊM LẠI CỘT 'TYPE' ĐỂ PHÂN LOẠI SLOT CHO HỆ THỐNG
            $table->string('type')->nullable()->after('display_name')->index()->comment('Loại vị trí: support, complaint');
        });

        // === THAY ĐỔI 2: Nâng cấp bảng `chat_rooms` ===
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->string('type')->default('support')->after('name')->index()->comment('Loại chat: support, dispute, internal');
        });

        // === THAY ĐỔI 3: Tạo bảng mới `agent_assignments` ===
        Schema::create('agent_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique()->comment('ID của nhân viên thực tế từ bảng users');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unsignedBigInteger('agent_id')->unique()->comment('ID của vị trí hỗ trợ từ bảng agents');
            $table->foreign('agent_id')->references('user_id')->on('agents')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_assignments');

        if (Schema::hasColumn('chat_rooms', 'type')) {
            Schema::table('chat_rooms', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }

        // Cập nhật lại hàm down để xóa cả 2 cột
        if (Schema::hasColumns('agents', ['display_name', 'type'])) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropColumn(['display_name', 'type']);
            });
        }
    }
};