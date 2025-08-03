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
        Schema::table('permissions', function (Blueprint $table) {
            // Thêm cột description, có thể null
            $table->string('description')->nullable()->after('name');
            // Thêm cột group_name, có thể null
            $table->string('group_name')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            // Xóa cột khi rollback
            $table->dropColumn('description');
            $table->dropColumn('group_name');
        });
    }
};