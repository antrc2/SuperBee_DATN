<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bảng roles
        Schema::create('roles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('role_name')->nullable();
        });

        // Bảng users (thay cho accounts)
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('username')->nullable();
            $table->text('password')->nullable();
            $table->text('fullname');
            $table->text('email')->nullable();
            $table->text('phone')->nullable();
            $table->text('avatar_url');
            $table->integer('balance')->default(0);
            $table->unsignedBigInteger('role_id')->nullable()->default(1);
            $table->unsignedBigInteger('web_id')->nullable()->default(1);
            $table->unsignedBigInteger('affiliated_by')->nullable();
            $table->integer('status')->nullable()->default(1);
            $table->timestamps();
        });

        // Bảng webs
        Schema::create('webs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('subdomain')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->integer('status')->nullable()->default(1);
            $table->text('api_key')->nullable();
            $table->timestamps();
        });

        // Bảng bank_histories
        Schema::create('bank_histories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->integer('amount')->nullable();
            $table->timestamps();
        });

        // Bảng card_histories
        Schema::create('card_histories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->integer('amount')->nullable();
            $table->integer('value')->nullable();
            $table->integer('declared_value')->nullable();
            $table->text('telco')->nullable();
            $table->text('serial')->nullable();
            $table->text('code')->nullable();
            $table->integer('status')->nullable();
            $table->integer('message')->nullable();
            $table->text('sign')->nullable();
            $table->timestamps();
        });

        // Bảng carts
        Schema::create('carts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->timestamps();
        });

        // Bảng cart_details
        Schema::create('cart_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cart_id');
            $table->unsignedBigInteger('product_detail_id');
            $table->integer('price');
        });

        // Bảng categories
        Schema::create('categories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('name')->nullable();
            $table->text('image_url');
            $table->integer('status')->nullable()->default(1);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });

        // Bảng chats
        Schema::create('chats', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('web_id');
            $table->text('chat_title');
            $table->timestamps();
        });

        // Bảng chat_details
        Schema::create('chat_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('chat_id');
            $table->text('role');
            $table->text('content');
            $table->timestamps();
        });

        // Bảng discount_codes
        Schema::create('discount_codes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('code')->nullable();
            $table->integer('usage_limit')->nullable()->default(-1);
            $table->integer('used_count')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->integer('discount_amount')->nullable();
            $table->integer('min_discount_amount')->nullable();
            $table->integer('max_discount_amount')->nullable();
            $table->unsignedBigInteger('user_id')->nullable()->default(0);
            $table->unsignedBigInteger('web_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamps();
        });

        // Bảng donate_promotions
        Schema::create('donate_promotions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('web_id')->nullable();
            $table->integer('amount')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });

        // Bảng logs
        Schema::create('logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('web_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('status');
            $table->text('type');
            $table->text('message');
            $table->timestamps();
        });

        // Bảng news
        Schema::create('news', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('title');
            $table->text('slug');
            $table->text('description');
            $table->text('content');
            $table->integer('status')->default(1);
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by');
            $table->timestamps();
        });

        // Bảng notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('web_id');
            $table->text('message');
            $table->text('type');
            $table->text('url');
            $table->timestamps();
        });

        // Bảng orders
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->integer('total_price')->nullable();
            $table->unsignedBigInteger('discount_code_id')->nullable();
            $table->timestamps();
        });

        // Bảng order_details
        Schema::create('order_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('product_detail_id')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->integer('price')->nullable();
        });

        // Bảng products
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->text('username')->nullable();
            $table->text('password')->nullable();
            $table->integer('status')->nullable()->default(1);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->timestamps();
        });

        // Bảng product_details
        Schema::create('product_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->integer('price')->nullable();
            $table->unsignedBigInteger('web_id')->nullable();
            $table->timestamps();
        });

        // Bảng product_images
        Schema::create('product_images', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->text('image_url')->nullable();
        });

        // Bảng refresh_tokens
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('refresh_token', 255)->unique();
            $table->boolean('revoked')->default(0);
            $table->timestamp('expires_at');
            $table->string('user_agent', 255)->nullable();
        });

        // Bảng reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('web_id')->nullable();
            $table->text('message')->nullable();
            $table->integer('star')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
        });

        // Bảng tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('web_id');
            $table->text('title');
            $table->integer('status')->default(1);
            $table->timestamps();
        });

        // Bảng ticket_details
        Schema::create('ticket_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('ticket_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('message');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_details');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('refresh_tokens');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_details');
        Schema::dropIfExists('products');
        Schema::dropIfExists('order_details');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('news');
        Schema::dropIfExists('logs');
        Schema::dropIfExists('donate_promotions');
        Schema::dropIfExists('discount_codes');
        Schema::dropIfExists('chat_details');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('cart_details');
        Schema::dropIfForExists('carts');
        Schema::dropIfExists('card_histories');
        Schema::dropIfExists('bank_histories');
        Schema::dropIfExists('webs');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
    }
};