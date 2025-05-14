<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // users
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
            $table->foreign('affiliated_by')->references('id')->on('users')->onDelete('set null');
        });

        // webs
        // Schema::table('webs', function (Blueprint $table) {
        //     $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        // });

        // bank_histories
        Schema::table('bank_histories', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // card_histories
        Schema::table('card_histories', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // carts
        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // cart_details
        Schema::table('cart_details', function (Blueprint $table) {
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('product_detail_id')->references('id')->on('product_details')->onDelete('cascade');
        });

        // categories
        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // chats
        Schema::table('chats', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
        });

        // chat_details
        Schema::table('chat_details', function (Blueprint $table) {
            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
        });

        // discount_codes
        Schema::table('discount_codes', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        // donate_promotions
        Schema::table('donate_promotions', function (Blueprint $table) {
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // logs
        Schema::table('logs', function (Blueprint $table) {
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // news
        Schema::table('news', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('cascade');
        });

        // notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
        });

        // orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
            $table->foreign('discount_code_id')->references('id')->on('discount_codes')->onDelete('set null');
        });

        // order_details
        Schema::table('order_details', function (Blueprint $table) {
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            $table->foreign('product_detail_id')->references('id')->on('product_details')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // products
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // product_details
        Schema::table('product_details', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // product_images
        Schema::table('product_images', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
        });

        // refresh_tokens
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // reviews
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        // tickets
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
        });

        // ticket_details
        Schema::table('ticket_details', function (Blueprint $table) {
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['web_id']);
            $table->dropForeign(['affiliated_by']);
        });

        Schema::table('webs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('bank_histories', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('card_histories', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('cart_details', function (Blueprint $table) {
            $table->dropForeign(['cart_id']);
            $table->dropForeign(['product_detail_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('chat_details', function (Blueprint $table) {
            $table->dropForeign(['chat_id']);
        });

        Schema::table('discount_codes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('donate_promotions', function (Blueprint $table) {
            $table->dropForeign(['web_id']);
        });

        Schema::table('logs', function (Blueprint $table) {
            $table->dropForeign(['web_id']);
            $table->dropForeign(['user_id']);
        });

        Schema::table('news', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
            $table->dropForeign(['discount_code_id']);
        });

        Schema::table('order_details', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['product_detail_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('product_details', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('ticket_details', function (Blueprint $table) {
            $table->dropForeign(['ticket_id']);
            $table->dropForeign(['user_id']);
        });
    }
};