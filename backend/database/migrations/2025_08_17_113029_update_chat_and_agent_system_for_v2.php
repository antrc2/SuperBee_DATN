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
        // Bổ sung cột để biến bảng agents thành bảng quản lý "Vị trí/Slot Hỗ trợ"
        Schema::table('agents', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('user_id')->comment('Tên hiển thị của vị trí, ví dụ: Hỗ trợ viên Ca Sáng');
            $table->string('type')->nullable()->after('display_name')->index()->comment('Loại vị trí, tương ứng với Role của nhân viên, ví dụ: nv-ho-tro');
        });

        // === THAY ĐỔI 2: Nâng cấp bảng `chat_rooms` ===
        // Bổ sung cột để phân loại các cuộc trò chuyện
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->string('type')->default('support')->after('name')->index()->comment('Loại chat: support, dispute, internal');
        });

        // === THAY ĐỔI 3: Tạo bảng mới `agent_assignments` ===
        // Bảng trung gian để phân công nhân viên thực tế vào các "Vị trí Hỗ trợ"
        Schema::create('agent_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique()->comment('ID của nhân viên thực tế từ bảng users');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unsignedBigInteger('agent_id')->unique()->comment('ID của vị trí hỗ trợ từ bảng agents');
            // Foreign key trỏ đến cột `user_id` trong bảng `agents` vì cột này là Primary Key
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
        // Thực hiện theo thứ tự ngược lại để đảm bảo không lỗi khóa ngoại

        // Xóa bảng `agent_assignments`
        Schema::dropIfExists('agent_assignments');

        // Xóa cột trong bảng `chat_rooms`
        if (Schema::hasColumn('chat_rooms', 'type')) {
            Schema::table('chat_rooms', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }

        // Xóa các cột trong bảng `agents`
        if (Schema::hasColumns('agents', ['display_name', 'type'])) {
            Schema::table('agents', function (Blueprint $table) {
                $table->dropColumn(['display_name', 'type']);
            });
        }
    }
};