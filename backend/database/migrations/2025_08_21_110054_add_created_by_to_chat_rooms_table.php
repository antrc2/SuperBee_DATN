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
        Schema::table('chat_rooms', function (Blueprint $table) {
            // Thêm cột created_by, có thể null, là khóa ngoại tới bảng users
            $table->unsignedBigInteger('created_by')->nullable()->after('agent_user_id');

            // Thêm ràng buộc khóa ngoại
            // Khi user bị xóa, giá trị created_by sẽ được set thành NULL
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            // Xóa khóa ngoại trước
            $table->dropForeign(['created_by']);
            // Sau đó xóa cột
            $table->dropColumn('created_by');
        });
    }
};