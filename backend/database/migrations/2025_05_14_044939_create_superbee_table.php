<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Bảng users (Tài khoản người dùng)
        // 'accounts' đổi tên thành 'users' theo chuẩn Laravel và đã có trong code của bạn.
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username', 255); // Đặt độ dài cụ thể cho string
            $table->string('password', 255); // Đặt độ dài cụ thể
            $table->string('email', 255); // Đặt độ dài cụ thể
            // Cho kích hoạt tài khoản
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verification_token')->nullable();
            $table->timestamp('email_verification_expires_at')->nullable();
            // Nhưng với JWT token, việc lưu token reset vào bảng users tiện hơn để liên kết trực tiếp.
            $table->string('password_reset_token')->nullable();
            $table->string('phone', 20)->nullable(); // Có thể null
            $table->string('avatar_url')->default('https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg');
            $table->string('donate_code');
            $table->unsignedBigInteger('web_id');
            $table->integer('status')->default(0); // Mặc định k hoạt động

            $table->timestamp('password_reset_expires_at')->nullable();
            $table->timestamps();
            $table->unique(['username', 'email', 'web_id']);
        });

        // Bảng webs (Các Web con)
        Schema::create('webs', function (Blueprint $table) {
            $table->id();
            $table->string('subdomain', 255)->unique(); // Đặt độ dài cụ thể
            $table->unsignedBigInteger('user_id')->nullable(); // Người tạo/quản lý web con, không thể null
            $table->string('api_key', 255); // API Key bắt buộc
            $table->integer('status')->default(0); // Mặc định k hoạt động
            $table->boolean('is_customized')->default(false); // Mặc định chưa tùy chỉnh
            $table->timestamps();
        });
        // cấu hình các thông số của web 
        Schema::create('business_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('shop_name');
            $table->string('slogan')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('zalo_link')->nullable();
            $table->string('facebook_link')->nullable();
            $table->string('template_name')->default('default');
            $table->json('header_settings')->nullable();
            $table->json('footer_settings')->nullable();
            $table->timestamps();
        });
        Schema::table('webs', function (Blueprint $table) {
            // Thêm cột business_settings_id
            $table->unsignedBigInteger('business_settings_id')->nullable()->after('is_customized'); // hoặc vị trí nào bạn muốn

            // Định nghĩa khóa ngoại
            $table->foreign('business_settings_id')
                ->references('id')
                ->on('business_settings')
                ->onDelete('cascade');
        });
        // Bảng categories (Danh mục của web mẹ)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable(); // Có thể là danh mục gốc
            $table->string('name', 255); // Đặt độ dài cụ thể
            $table->string('slug', 255)->unique(); // Slug phải duy nhất, không null
            $table->text('image_url')->nullable();
            $table->integer('status')->default(1); // Mặc định hoạt động
            $table->unsignedBigInteger('created_by'); // Có thể null nếu hệ thống tự tạo
            $table->unsignedBigInteger('updated_by'); // Có thể null
            $table->timestamps();
        });
        Schema::create('categories_post', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Tên category, phải là duy nhất
            $table->string('slug')->unique(); // Slug cho URL thân thiện, cũng phải duy nhất
            $table->text('description')->nullable(); // Mô tả ngắn về category
            $table->timestamps(); // created_at và updated_at
        });

        // Bảng products
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');    // Sản phẩm phải thuộc một danh mục
            $table->string('sku', 50)->unique();           // SKU duy nhất
            $table->integer('import_price');             // giá nhập
            $table->integer('price');
            $table->integer('sale')->nullable();
            $table->integer('status')->default(0);         // Trạng thái (mặc định = 1: hoạt động)
            $table->unsignedBigInteger('web_id');          // Sản phẩm thuộc web con nào
            $table->unsignedBigInteger('created_by'); // Người tạo (có thể null)
            $table->unsignedBigInteger('updated_by'); // Người cập nhật (có thể null)
            $table->timestamps();
        });

        // Bảng product_game_attributes (EAV cho thông tin riêng theo game)
        Schema::create('product_game_attributes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');      // Khóa liên kết tới products
            // $table->string('game_code', 50);               // Mã game (ví dụ: 'lol', 'ff', ...)
            $table->string('attribute_key', 100);          // Tên thuộc tính (ví dụ: 'rank', 'num_champions', ...)
            $table->string('attribute_value', 255);        // Giá trị tương ứng (luôn lưu dạng chuỗi)
            // $table->timestamps();

            // Để sau sẽ thêm unique ['product_id','game_code','attribute_key']
        });

        // Bảng product_credentials
        Schema::create('product_credentials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->unique(); // Mỗi sản phẩm chỉ có 1 bộ credentials duy nhất
            $table->string('username', 255);       // Email đăng nhập
            $table->string('password', 255);    // Mật khẩu (hãy mã hóa ở tầng ứng dụng)
            // $table->string('login_method', 50); // Ví dụ: 'email', 'facebook', 'garenan', 'google', ...
            // $table->timestamps();
        });

        // Bảng product_images
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');   // Ảnh thuộc về sản phẩm nào
            $table->string('image_url', 255);           // Đường dẫn ảnh
            // $table->boolean('is_primary')->default(false); // Ảnh chính hay không
            $table->string('alt_text', 255)->nullable(); // Văn bản thay thế (alt)
            // $table->timestamps();
        });

        // Bảng reviews (Đánh giá của người dùng về độ tin cậy của web)
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Ai đánh giá
            $table->unsignedBigInteger('web_id'); // Đánh giá web nào
            $table->integer('star'); // Số sao (1-5), không null
            $table->timestamps();
        });

        // Bảng product_reports (Khiếu nại sản phẩm)
        Schema::create('product_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Ai khiếu nại
            $table->unsignedBigInteger('product_id'); // Khiếu nại sản phẩm nào
            $table->text('reason'); // Lý do không null
            $table->integer('status')->default(0); // Mặc định chờ xử lý (0: pending, 1: resolved, 2: rejected)
            $table->timestamps();
        });

        // Bảng carts (Giỏ hàng)
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique(); // Mỗi user chỉ có 1 giỏ hàng duy nhất
            $table->timestamps();
        });

        // Bảng cart_items (Chi tiết giỏ hàng)
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id'); // Thuộc giỏ hàng nào
            $table->integer('status')->default(0); // Người dùng muốn mua sản phẩm nào. 0: Chưa muốn. 1: Đang muốn mua
            $table->unsignedBigInteger('product_id'); // Sản phẩm trong giỏ
            $table->timestamps();
        });

        // Bảng orders (Đơn hàng)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');               // Ai đặt hàng
            $table->string('order_code', 50)->unique();          // Mã đơn hàng duy nhất
            $table->decimal('total_amount', 15, 0)->nullable();              // Tổng tiền (sau khi trừ khuyến mãi, nếu có)
            // $table->integer('total_amount');
            $table->unsignedBigInteger('wallet_transaction_id'); // ID giao dịch ví (nếu có)
            // $table->string('payment_method', 50)->nullable();    // Phương thức thanh toán (ví, bank, card, ...)
            $table->integer('status')->default(0);               // Trạng thái đơn: 0 = pending, 1 = completed, 2 = cancelled
            // $table->unsignedBigInteger('promotion_id')->nullable();
            // // Thông tin mã khuyến mãi (nếu khách dùng coupon/code)
            $table->string('promo_code', 50)->nullable();        // Lưu mã khuyến mãi (nếu có)
            $table->decimal('discount_amount', 15, 0)->nullable(); // Số tiền giảm tương ứng (nếu có)

            $table->timestamps();
        });

        // Bảng order_items (Chi tiết đơn hàng)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');   // Thuộc đơn hàng nào
            $table->unsignedBigInteger('product_id'); // Sản phẩm trong đơn hàng
            $table->decimal('unit_price', 15, 0);     // Giá tại thời điểm đặt hàng
            $table->timestamps();
        });

        // Bảng wallets (Ví người dùng)
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique(); // Mỗi user có 1 ví duy nhất
            $table->decimal('balance', 15, 0)->default(0.00); // Số dư mặc định 0
            $table->string('currency', 10)->default('VND'); // Đơn vị tiền tệ
            $table->timestamps();
        });

        // Bảng wallet_transactions (Lịch sử giao dịch ví)
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_id'); // Giao dịch thuộc ví nào
            $table->enum('type', ['recharge_card', 'recharge_bank', 'purchase', 'withdraw', 'commission', 'refund',    "sell"]);
            //                     Nạp card         Nạp bank        Mua hàng     Rút         Hoa hồng      Hoàn tiền   Bán acc
            $table->decimal('amount', 15, 0); // Số tiền giao dịch, không null
            $table->unsignedBigInteger('related_id')->nullable(); // ID của giao dịch liên quan (nạp thẻ, bank, đơn hàng, rút tiền...)
            $table->string('related_type', 255)->nullable(); // Loại model liên quan (e.g., App\Models\RechargeCard)
            $table->integer('status')->default(1); // Trạng thái giao dịch (0: pending, 1: completed, 2: failed)
            // $table->text('description')->nullable(); // Mô tả giao dịch
            $table->timestamps(); // Đổi thành timestamps() để có created_at và updated_at
        });

        // Bảng recharges_card (Nạp bằng thẻ cào)
        Schema::create('recharges_card', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_transaction_id')->nullable(); // Liên kết với giao dịch ví, có thể null nếu giao dịch chưa được tạo hoàn chỉnh
            $table->unsignedBigInteger('user_id'); // Ai nạp thẻ
            $table->unsignedBigInteger('web_id')->nullable(); // Nạp cho web nào (nếu có web con)
            $table->integer('amount'); // Số tiền bạn nhận về (VND)
            $table->integer('value'); // Giá trị thực của thẻ
            $table->integer('declared_value'); // Giá trị khai báo (ví dụ 50k, 100k)
            $table->string('telco', 50); // Nhà mạng
            $table->string('serial', 50); // Serial thẻ
            $table->string('code', 50); // Mã thẻ

            $table->integer('status');
            /// status = 1 ==> thẻ đúng
            /// status = 2 ==> thẻ sai mệnh giá
            /// status = 3 ==> thẻ lỗi
            /// status = 99 ==> thẻ chờ xử lý

            $table->text('message'); // Thông báo lỗi/thành công từ hệ thống nạp thẻ
            $table->text('sign'); // Chữ ký (nếu có cho API)
            $table->unsignedBigInteger("donate_promotion_id")->nullable();
            $table->timestamps();
        });

        // Bảng recharges_bank (Nạp bằng ngân hàng / chuyển khoản)
        Schema::create('recharges_bank', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_transaction_id'); // Liên kết với giao dịch ví
            $table->unsignedBigInteger('user_id'); // Ai nạp tiền
            $table->unsignedBigInteger('web_id'); // Nạp cho web nào
            $table->decimal('amount', 15, 0); // Số tiền nạp
            // $table->string('bank_account_number', 50); // Số tài khoản ngân hàng của người nạp
            // $table->string('bank_name', 100); // Tên ngân hàng của người nạp
            $table->string('transaction_reference', 100)->nullable(); // Mã giao dịch của ngân hàng (có thể null nếu chưa có)
            $table->integer('status')->default(1); // Trạng thái (0: pending, 1: success, 2: failed)
            $table->unsignedBigInteger("donate_promotion_id")->nullable();
            $table->timestamps();
        });

        // Bảng withdrawals (Rút tiền)
        Schema::create('withdraws', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_transaction_id')->nullable(); // Liên kết với giao dịch ví
            $table->unsignedBigInteger('user_id'); // Ai rút tiền
            $table->decimal('amount', 15, 0); // Số tiền rút
            $table->string('bank_account_number', 50); // Số tài khoản nhận
            $table->string('bank_name', 100); // Tên ngân hàng nhận
            // $table->string('account_holder_name', 255)->nullable(); // Tên chủ tài khoản (nên có)
            $table->string("withdraw_code", 16)->unique();
            $table->text('note')->nullable(); // Ghi chú thêm
            $table->integer('status')->default(0); // Trạng thái (0: pending, 1: completed, 2: rejected)
            $table->timestamps();
        });

        // Bảng promotions (Mã khuyến mãi cho sản phẩm)
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->integer("user_id")->default(-1);
            $table->string('code', 50)->unique(); // Mã khuyến mãi duy nhất
            $table->text('description')->nullable(); // Mô tả khuyến mãi
            // $table->enum('discount_type', ['percentage', 'fixed_amount']); // Loại giảm giá
            $table->decimal('discount_value', 15, 0); // Giá trị giảm giá
            $table->integer('min_discount_amount')->nullable();
            $table->integer('max_discount_amount')->nullable();
            $table->timestamp('start_date'); // Ngày bắt đầu
            $table->timestamp('end_date'); // Ngày kết thúc
            $table->integer('usage_limit')->nullable()->default(-1); // Giới hạn số lần sử dụng tổng cộng. -1 nghĩa là k giới hạn
            $table->integer('per_user_limit')->default(-1); // Giới hạn mỗi người dùng. -1 nghĩa là k giới hạn
            $table->integer('total_used')->default(0); // Tổng số lần đã sử dụng
            $table->integer('status')->default(1); // Trạng thái
            $table->unsignedBigInteger('created_by'); // Ai tạo
            $table->unsignedBigInteger('updated_by'); // Ai cập nhật
            $table->timestamps();
        });

        // Bảng domate_promotions (Mã khuyến mãi cho nạp thẻ/ngân hàng)
        Schema::create('donate_promotions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('web_id')->nullable(); // Thuộc web nào (có thể là khuyến mãi chung cho toàn hệ thống)
            // $table->string('code', 50)->unique(); // Mã khuyến mãi duy nhất
            // $table->text('description')->nullable(); // Thêm mô tả
            // $table->enum('promotion_type', ['percentage', 'fixed_amount']); // Loại khuyến mãi
            $table->decimal('amount', 15, 0); // Giá trị khuyến mãi
            $table->timestamp('start_date'); // Ngày bắt đầu
            $table->timestamp('end_date'); // Ngày kết thúc
            // $table->integer('usage_limit')->nullable()->default(-1); // Giới hạn số lần sử dụng tổng cộng. -1 nghĩa là k giới hạn
            // $table->integer('per_user_limit')->default(-1); // Giới hạn mỗi người dùng. -1 nghĩa là k giới hạn
            // $table->integer('total_used')->default(0); // Tổng số lần đã sử dụng
            $table->integer('status')->default(1); // Trạng thái
            $table->unsignedBigInteger('created_by'); // Ai tạo
            $table->unsignedBigInteger('updated_by'); // Ai cập nhật
            $table->timestamps();
        });

        // // Bảng promotion_usages (Lịch sử sử dụng mã khuyến mãi)
        // Schema::create('promotion_usages', function (Blueprint $table) {
        //     $table->id();
        //     $table->unsignedBigInteger('user_id'); // (Đổi từ 'account_id' thành 'user_id' để thống nhất)
        //     $table->unsignedBigInteger('promotion_id')->nullable(); // ID của promotion nếu áp dụng cho sản phẩm
        //     $table->unsignedBigInteger('domate_promotion_id')->nullable(); // ID của domate_promotion nếu áp dụng cho nạp thẻ
        //     $table->timestamp('used_at')->useCurrent(); // Thời gian sử dụng, mặc định là thời gian hiện tại
        //     $table->decimal('amount_discounted', 15, 0); // Số tiền
        //     $table->unsignedBigInteger('related_order_id')->nullable(); // Liên kết với đơn hàng nếu áp dụng cho đơn hàng
        //     $table->unsignedBigInteger('related_wallet_txn_id')->nullable(); // Liên kết với giao dịch ví nếu áp dụng cho nạp tiền
        //     // Bạn có thể thêm các trường `created_at`, `updated_at` nếu cần theo dõi thời gian tạo/cập nhật bản ghi này.
        // });

        // Bảng system_logs (Ghi log hệ thống)
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // Người dùng thực hiện hành động (null nếu là hệ thống hoặc khách)
            $table->string('action_type', 50); // Loại hành động (login, logout, create_product, update_order, error, etc.)
            $table->string('target_table', 50)->nullable(); // Bảng bị ảnh hưởng (users, products, orders, etc. - nullable nếu là log không liên quan đến một bảng cụ thể)
            $table->unsignedBigInteger('target_id')->nullable(); // ID của bản ghi bị ảnh hưởng (nullable)
            $table->text('description')->nullable(); // Mô tả chi tiết hành động hoặc lỗi (có thể null nếu chỉ là action_type)
            $table->text('old_value')->nullable(); // Giá trị cũ (cho các hành động update)
            $table->text('new_value')->nullable(); // Giá trị mới (cho các hành động update)
            $table->string('ip_address', 45)->nullable(); // Địa chỉ IP (có thể null nếu không lấy được)
            $table->text('user_agent')->nullable(); // Thông tin trình duyệt/thiết bị (có thể null)
            $table->timestamps(); // Đổi từ `timestamp('created_at')` thành `timestamps()` để có cả `updated_at`
        });

        // Bảng posts (Bài viết)
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255); // Tiêu đề bài viết
            $table->string('slug', 255)->unique(); // Slug duy nhất
            $table->longText('content'); // Sử dụng longText cho nội dung dài
            $table->unsignedBigInteger('category_id')->nullable(); // Bài viết có thể không thuộc danh mục nào
            $table->unsignedBigInteger('author_id'); // Tác giả bài viết
            $table->integer('status')->default(0); // Trạng thái (0: draft, 1: published, 2: archived)
            $table->string('image_thumbnail_url', 255)->nullable(); // Thêm ảnh thumbnail
            $table->timestamps();
        });

        // Bảng comments (Bình luận)
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_id'); // Bình luận cho bài viết nào
            $table->unsignedBigInteger('user_id')->nullable(); // Ai bình luận (có thể là khách vãng lai)
            $table->unsignedBigInteger('parent_id')->nullable(); // Bình luận trả lời bình luận nào
            $table->text('content'); // Nội dung bình luận
            $table->integer('status')->default(0); // Trạng thái (0: pending, 1: approved, 2: spam)
            $table->timestamps();
        });

        // Bảng notifications (Thông báo)
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // Thông báo gửi cho ai
            $table->string('title', 255); // Tiêu đề thông báo
            $table->text('content'); // Nội dung thông báo
            $table->string('link', 255)->nullable(); // Link liên quan (nếu có)
            $table->boolean('is_read')->default(0); // Đã đọc hay chưa
            $table->timestamps();
        });

        // Bảng chat_rooms (Phòng chat)
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id(); // Corresponds to BIGINT PRIMARY KEY AUTO_INCREMENT
            $table->string('name')->nullable()->comment('Optional name for group chats, null for 1-1 chats');
            $table->enum('status', ['open', 'assigned', 'pending_assignment', 'closed', 'archived'])->default('open')->comment('Status of the chat room');
            $table->timestamps(); // Adds created_at and updated_at
        });

        // Bảng messages (Nội dung tin nhắn)
        Schema::create('messages', function (Blueprint $table) {
            $table->id(); // Corresponds to BIGINT PRIMARY KEY AUTO_INCREMENT
            $table->unsignedBigInteger('chat_room_id'); // Foreign key to chat_rooms
            $table->unsignedBigInteger('sender_id');    // Foreign key to users
            $table->text('content')->nullable()->comment('Message content');
            $table->string('attachment_url')->nullable()->comment('URL of any attached file');
            $table->timestamps(); // Adds created_at and updated_at

            // Foreign key constraints
            // $table->foreign('chat_room_id')->references('id')->on('chat_rooms')->onDelete('cascade');
            // $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Bảng agents (Thông tin nhân viên tư vấn)
        Schema::create('agents', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary(); // Foreign key to users.id, also primary key
            $table->enum('status', ['online', 'offline', 'available', 'busy', 'away'])->default('offline')->comment('Agent status');
            $table->integer('current_chats_count')->default(0)->comment('Number of active chats');
            $table->integer('max_chats_limit')->default(5)->comment('Maximum concurrent chats an agent can handle');
            $table->decimal('average_rating', 3, 2)->nullable()->comment('Average rating of the agent');
            $table->integer('total_ratings_count')->default(0)->comment('Total number of ratings received');
            $table->timestamp('last_active_at')->nullable()->comment('Last active timestamp');
            $table->unsignedBigInteger('web_id')->nullable()->comment('ID of the website or channel this agent belongs to');
            $table->timestamps(); // Adds created_at and updated_at

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Bảng chat_room_participants (Thành viên trong phòng chat)
        // Bảng này sẽ liệt kê tất cả các user tham gia vào một phòng chat, bao gồm cả khách hàng và nhân viên tư vấn được gán.
        Schema::create('chat_room_participants', function (Blueprint $table) {
            $table->id(); // Corresponds to BIGINT PRIMARY KEY AUTO_INCREMENT
            $table->unsignedBigInteger('chat_room_id');
            $table->string('user_id'); // Can be a guest, customer, or agent
            $table->enum('role', ['customer', 'agent'])->comment('Role specifically for this chat room (customer or agent)');
            $table->timestamp('joined_at')->useCurrent()->comment('Time user joined the room');
            $table->timestamp('left_at')->nullable()->comment('Time user left the room (for group chats or end of session)');
            $table->timestamps(); // Adds created_at and updated_at
            $table->unsignedBigInteger('last_read_message_id')->nullable()->comment('ID of the last message read by this participant'); // New column
            $table->foreign('last_read_message_id')->references('id')->on('messages')->onDelete('set null');
            // Unique constraint to ensure a user has only one role in a specific chat room at a time
            $table->unique(['chat_room_id', 'user_id']);
            // Foreign key constraints
            $table->foreign('chat_room_id')->references('id')->on('chat_rooms')->onDelete('cascade');

        });
        // Bảng banners (Banner tiêu đề)
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('web_id');
            $table->string('title', 255)->nullable(); // Tiêu đề banner (có thể null nếu chỉ là ảnh)
            $table->string('image_url', 255); // Đường dẫn ảnh banner
            $table->string('link', 255)->nullable(); // Link khi click vào banner
            $table->integer('status')->default(1); // Trạng thái
            $table->unsignedBigInteger('created_by'); // Ai tạo
            $table->unsignedBigInteger('updated_by'); // Ai cập nhật
            $table->timestamps();
        });
        // Bảng affiliates
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('affiliated_by')->nullable();
            // $table->decimal('commission_amount', 15, 0)->default(0.00); // Số tiền hoa hồng
            $table->timestamps();
        });

        // Bảng lịch sử affiliate
        Schema::create("affiliate_histories", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('affiliate_id'); // id của bảng affiliate
            $table->decimal('commission_amount', 15, 0); // Số tiền hoa hồng nhận được của mỗi đơn hàng
            $table->unsignedBigInteger('order_id');
            $table->timestamps();
        });

        // Bảng refresh_tokens (Cho xác thực API)
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id'); // Thuộc về user nào
            $table->string('refresh_token', 255)->unique(); // Token duy nhất
            $table->boolean('revoked')->default(0); // Đã bị thu hồi chưa
            $table->timestamp('expires_at'); // Thời gian hết hạn
            $table->string('user_agent', 255)->nullable(); // Thông tin user agent
            $table->timestamps(); // Thêm timestamps để quản lý tốt hơn
        });
    }

    public function down(): void
    {
        // Then drop tables
        Schema::dropIfExists('refresh_tokens');
        Schema::dropIfExists('affiliates');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('chat_rooms');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('business_settings');
        // Schema::dropIfExists('promotion_usages');
        Schema::dropIfExists('domate_promotions');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('withdraws');
        Schema::dropIfExists('recharges_bank');
        Schema::dropIfExists('recharges_card');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::table('webs', function (Blueprint $table) {
            // Hủy bỏ khóa ngoại trước khi xóa cột
            $table->dropForeign(['business_settings_id']);
            $table->dropColumn('business_settings_id');
        });
        // Schema::dropIfExists('general_complaints'); // Bảng mới
        Schema::dropIfExists('product_reports');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_credentials');
        Schema::dropIfExists('product_game_attributes');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories_post');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('webs');
        Schema::dropIfExists('users');
    }
};
