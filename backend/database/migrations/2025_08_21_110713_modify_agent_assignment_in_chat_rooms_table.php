<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            // 1. Xóa cột cũ agent_user_id (nếu nó có khóa ngoại, phải xóa khóa ngoại trước)
            // Giả sử tên khóa ngoại là chat_rooms_agent_user_id_foreign
            $table->dropForeign(['agent_user_id']);
            $table->dropColumn('agent_user_id');

            // 2. Thêm cột mới agent_id
            $table->unsignedBigInteger('agent_id')->nullable()->after('status');

            // 3. Thêm ràng buộc khóa ngoại cho cột mới
            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            // Làm ngược lại quy trình
            $table->dropForeign(['agent_id']);
            $table->dropColumn('agent_id');

            $table->unsignedBigInteger('agent_user_id')->nullable();
            $table->foreign('agent_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};