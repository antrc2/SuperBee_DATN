<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // web_id in users is not nullable, so 'set null' is not appropriate.
            // Consider making web_id nullable in users table if 'set null' is desired.
            // Or use 'restrict' or 'cascade' if web_id must always exist.
            // Based on comment "Nếu web bị xóa, user vẫn tồn tại", 'web_id' should be nullable.
            // Assuming for now 'restrict' is safer if 'web_id' remains non-nullable as per schema.
            // If you make users.web_id nullable, you can revert to onDelete('set null').
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('restrict');
        });

        Schema::table('webs', function (Blueprint $table) {
            // user_id in webs IS nullable. onDelete('cascade') means if the user is deleted, their web is also deleted.
            // This seems to align with "Nếu user tạo web bị xóa, web cũng bị xóa".
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('cascade');
            // created_by in categories is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            // updated_by in categories is not nullable.
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
            // created_by in products is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            // updated_by in products is not nullable.
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('product_game_attributes', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('product_credentials', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
        });

        Schema::table('product_reports', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        // Schema::table('general_complaints', function (Blueprint $table) {
        // Table 'general_complaints' is not created in the provided schema migration's up() method.
        // });

        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict');
            // wallet_transaction_id in orders is not nullable.
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('restrict');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict');
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->foreign('wallet_id')->references('id')->on('wallets')->onDelete('cascade');
        });

        Schema::table('recharges_card', function (Blueprint $table) {
            // wallet_transaction_id in recharges_card IS nullable.
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // web_id in recharges_card IS nullable.
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        Schema::table('recharges_bank', function (Blueprint $table) {
            // wallet_transaction_id in recharges_bank is not nullable.
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('restrict');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // web_id in recharges_bank is not nullable.
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('restrict');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            // wallet_transaction_id in withdrawals IS nullable.
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('promotions', function (Blueprint $table) {
            // created_by in promotions is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            // updated_by in promotions is not nullable.
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('domate_promotions', function (Blueprint $table) {
            // web_id in domate_promotions IS nullable.
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
            // created_by in domate_promotions is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            // updated_by in domate_promotions is not nullable.
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('promotion_usages', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // promotion_id in promotion_usages IS nullable.
            $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('set null');
            // domate_promotion_id in promotion_usages IS nullable.
            $table->foreign('domate_promotion_id')->references('id')->on('domate_promotions')->onDelete('set null');
            // related_order_id in promotion_usages IS nullable.
            $table->foreign('related_order_id')->references('id')->on('orders')->onDelete('set null');
            // related_wallet_txn_id in promotion_usages IS nullable.
            $table->foreign('related_wallet_txn_id')->references('id')->on('wallet_transactions')->onDelete('set null');
        });

        Schema::table('system_logs', function (Blueprint $table) {
            // user_id in system_logs IS nullable.
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('posts', function (Blueprint $table) {
            // category_id in posts IS nullable.
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            // user_id in comments IS nullable.
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('chat_rooms', function (Blueprint $table) {
            // created_by in chat_rooms is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreign('chat_room_id')->references('id')->on('chat_rooms')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('banners', function (Blueprint $table) {
            // created_by in banners is not nullable.
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            // updated_by in banners is not nullable.
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('restrict');
        });

        Schema::table('affiliates', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            // affiliated_by in affiliates IS nullable.
            $table->foreign('affiliated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['web_id']);
        });

        Schema::table('webs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['web_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('product_game_attributes', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('product_credentials', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('product_reports', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['cart_id']);
            $table->dropForeign(['product_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['wallet_transaction_id']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['product_id']);
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropForeign(['wallet_id']);
        });

        Schema::table('recharges_card', function (Blueprint $table) {
            $table->dropForeign(['wallet_transaction_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('recharges_bank', function (Blueprint $table) {
            $table->dropForeign(['wallet_transaction_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['web_id']);
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropForeign(['wallet_transaction_id']);
            $table->dropForeign(['user_id']);
        });

        Schema::table('promotions', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('domate_promotions', function (Blueprint $table) {
            $table->dropForeign(['web_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('promotion_usages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['promotion_id']);
            $table->dropForeign(['domate_promotion_id']);
            $table->dropForeign(['related_order_id']);
            $table->dropForeign(['related_wallet_txn_id']);
        });

        Schema::table('system_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropForeign(['author_id']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['parent_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['chat_room_id']);
            $table->dropForeign(['sender_id']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('affiliates', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['affiliated_by']);
        });

        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
    }
};
