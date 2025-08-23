<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_dispute_id_to_chat_rooms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->unsignedBigInteger('dispute_id')->nullable()->after('id');
            // Thêm foreign key nếu muốn
            // $table->foreign('dispute_id')->references('id')->on('disputes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->dropColumn('dispute_id');
        });
    }
};