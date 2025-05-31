<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Định nghĩa các Foreign Key (Sau khi tất cả các bảng đã được tạo)
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null'); // Nếu web bị xóa, user vẫn tồn tại
        });

        Schema::table('webs', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Nếu user tạo web bị xóa, web cũng bị xóa
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('cascade'); // Xóa danh mục cha thì danh mục con cũng bị xóa
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict'); // Không cho xóa category nếu có sản phẩm
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade'); // Xóa web thì sản phẩm cũng bị xóa
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('product_credentials', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade'); // Xóa sản phẩm thì credentials cũng bị xóa
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade'); // Xóa sản phẩm thì ảnh cũng bị xóa
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('cascade');
        });

        Schema::table('product_reports', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('general_complaints', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null'); // Nếu user bị xóa, khiếu nại vẫn giữ lại nhưng không có người gửi
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Xóa user thì giỏ hàng cũng bị xóa
        });

        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade'); // Xóa giỏ hàng thì item cũng bị xóa
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade'); // Xóa sản phẩm thì item trong giỏ cũng xóa
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict'); // Không cho xóa user nếu có đơn hàng
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null'); // Nếu giao dịch ví bị xóa, đơn hàng vẫn tồn tại
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade'); // Xóa đơn hàng thì chi tiết cũng bị xóa
            $table->foreign('product_id')->references('id')->on('products')->onDelete('restrict'); // Không cho xóa sản phẩm nếu có trong đơn hàng
        });

        Schema::table('wallets', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Xóa user thì ví cũng bị xóa
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->foreign('wallet_id')->references('id')->on('wallets')->onDelete('cascade'); // Xóa ví thì giao dịch cũng bị xóa
            // related_id và related_type cần được xử lý thủ công hoặc dùng polymorphic relationship trong model
        });

        Schema::table('recharges_card', function (Blueprint $table) {
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        Schema::table('recharges_bank', function (Blueprint $table) {
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->foreign('wallet_transaction_id')->references('id')->on('wallet_transactions')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('promotions', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('domate_promotions', function (Blueprint $table) {
            $table->foreign('web_id')->references('id')->on('webs')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('promotion_usages', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('set null');
            $table->foreign('domate_promotion_id')->references('id')->on('domate_promotions')->onDelete('set null');
            $table->foreign('related_order_id')->references('id')->on('orders')->onDelete('set null');
            $table->foreign('related_wallet_txn_id')->references('id')->on('wallet_transactions')->onDelete('set null');
        });

        Schema::table('system_logs', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('restrict'); // Không cho xóa tác giả nếu có bài viết
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade'); // Xóa bài viết thì bình luận cũng xóa
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade'); // Xóa bình luận cha thì con cũng xóa
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('chat_rooms', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreign('chat_room_id')->references('id')->on('chat_rooms')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('restrict'); // Không cho xóa người gửi nếu có tin nhắn
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('affiliates', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('affiliated_by')->references('id')->on('users')->onDelete('set null'); // Nếu người giới thiệu bị xóa, quan hệ vẫn còn nhưng không có người giới thiệu
        });

        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Drop foreign keys first to avoid errors
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
        Schema::table('product_credentials', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
        });
        Schema::table('product_images', function (Blueprint                   $table) {
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
        Schema::table('general_complaints', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
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
