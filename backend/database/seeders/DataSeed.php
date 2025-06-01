<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Web;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductGameAttribute;
use App\Models\ProductCredential;
use App\Models\ProductImage;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\ProductReport;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\RechargeCard; // Corrected if original was RechargeCard
use App\Models\RechargeBank; // Corrected if original was RechargeBank
use App\Models\Withdrawal;
use App\Models\Promotion;
use App\Models\DonatePromotion;
use App\Models\SystemLog;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\ChatRoom;
use App\Models\Message;
use App\Models\Banner;
use App\Models\Affiliate;
use App\Models\RefreshToken;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DataSeed extends Seeder // Renamed from DataSeeder to DataSeed to match class name
{
    public function run(): void
    {
        // --- Core Entities ---
        $this->command->info('Seeding Webs...');
        $web1 = Web::create([
            'subdomain' => 'main-site-' . Str::random(5), // subdomain must be unique
            'user_id' => null, // Web can have a null creator initially
            'api_key' => Str::random(32),
            'status' => 1 // Default active
        ]);
        $web2 = Web::create([
            'subdomain' => 'cool-site-' . Str::random(5), // subdomain must be unique
            'user_id' => null,
            'api_key' => Str::random(32),
            'status' => 1 // Default active
        ]);

        $this->command->info('Seeding Users...');
        $user1 = User::create([
            'username' => 'AdminUser',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg', // Default or specific
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
            'phone' => '0123456789'
        ]);
        $user2 = User::create([
            'username' => 'RegularUser',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg',
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
        ]);
        $user3 = User::create([
            'username' => 'WebCreator',
            'email' => 'creator@example.com',
            'password' => Hash::make('password'),
            'web_id' => $web2->id, // User must belong to a web
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg',
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
        ]);

        // Update web creator
        $web1->update(['user_id' => $user1->id]); // Assign creator to web1
        $web2->update(['user_id' => $user3->id]);

        $this->command->info('Seeding Categories...');
        $category1 = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics-' . Str::random(5), // slug must be unique
            'status' => 1, // Default active
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);
        $category2 = Category::create([
            'name' => 'Books',
            'slug' => 'books-' . Str::random(5), // slug must be unique
            'status' => 1,
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);
        $subCategory1 = Category::create([
            'name' => 'Mobile Phones',
            'slug' => 'mobile-phones-' . Str::random(5), // slug must be unique
            'parent_id' => $category1->id,
            'status' => 1,
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);

        $this->command->info('Seeding Products...');
        $product1 = Product::create([
            'category_id' => $subCategory1->id,
            'sku' => 'PHONE-XYZ-' . Str::random(5), // sku must be unique
            'price' => 700, // Integer as per migration
            'sale' => 650, // Integer, nullable
            'status' => 1, // Default active
            'web_id' => $web1->id,
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);
        $product2 = Product::create([
            'category_id' => $category2->id,
            'sku' => 'BOOK-LVG-' . Str::random(5), // sku must be unique
            'price' => 30, // Integer
            'status' => 1,
            'web_id' => $web1->id,
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);
        $product3 = Product::create([
            'category_id' => $category1->id, // Belongs to Electronics
            'sku' => 'GAMEPC-001-' . Str::random(5), // sku must be unique
            'price' => 2000, // Integer
            'status' => 1,
            'web_id' => $web2->id,
            'created_by' => $user3->id,
            'updated_by' => $user3->id
        ]);

        $this->command->info('Seeding Product Details...');
        ProductGameAttribute::create(['product_id' => $product3->id, 'attribute_key' => 'GPU', 'attribute_value' => 'RTX 4090']);
        ProductGameAttribute::create(['product_id' => $product3->id, 'attribute_key' => 'CPU', 'attribute_value' => 'Intel i9']);

        ProductCredential::create(['product_id' => $product1->id, 'username' => 'product_user_xyz', 'password' => 'secret_xyz_pass']); // product_id is unique
        // For product3, ensure product_id is unique if creating credentials
        // ProductCredential::create(['product_id' => $product3->id, 'username' => 'game_account_pc', 'password' => 'game123pc']);


        ProductImage::create(['product_id' => $product1->id, 'image_url' => '/images/phone.jpg', 'alt_text' => 'Smartphone XYZ image']);
        ProductImage::create(['product_id' => $product2->id, 'image_url' => '/images/book.jpg', 'alt_text' => 'Laravel Guide Book image']);
        ProductImage::create(['product_id' => $product3->id, 'image_url' => '/images/pc.jpg', 'alt_text' => 'Gaming PC image']);


        $this->command->info('Seeding Wallets and Transactions...');
        $wallet1 = Wallet::create(['user_id' => $user1->id, 'balance' => 1000, 'currency' => 'VND']); // user_id is unique
        $wallet2 = Wallet::create(['user_id' => $user2->id, 'balance' => 500, 'currency' => 'VND']);
        $wallet3 = Wallet::create(['user_id' => $user3->id, 'balance' => 200, 'currency' => 'VND']);

        WalletTransaction::create([
            'wallet_id' => $wallet1->id,
            'amount' => 100,
            'type' => 'recharge_bank', // Valid enum
            'status' => 1, // completed
            'related_id' => null,
            'related_type' => null,
        ]);
        $txnForOrder = WalletTransaction::create([
            'wallet_id' => $wallet2->id,
            'amount' => $product2->price, // Positive amount for purchase deduction, or handle logic in app
            'type' => 'purchase', // Valid enum
            'status' => 1, // completed
        ]);


        $this->command->info('Seeding Orders...');
        $order1 = Order::create([
            'user_id' => $user2->id,
            'order_code' => 'ORD-' . Str::uuid()->toString(), // order_code unique
            'total_amount' => $product2->price,
            'wallet_transaction_id' => $txnForOrder->id, // Link to the transaction
            'status' => 1, // 1 = completed
            'promo_code' => null,
            'discount_amount' => 0,
        ]);
        // Update WalletTransaction with related order
        $txnForOrder->update(['related_id' => $order1->id, 'related_type' => Order::class]);


        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $product2->id,
            'unit_price' => $product2->price
        ]);

        $this->command->info('Seeding Reviews and Reports...');
        Review::create(['user_id' => $user2->id, 'web_id' => $web1->id, 'star' => 5]);
        ProductReport::create([
            'user_id' => $user1->id,
            'product_id' => $product2->id,
            'reason' => 'Misleading SKU or category placement.',
            'status' => 0 // pending
        ]);

        $this->command->info('Seeding Carts...');
        $cart1 = Cart::create(['user_id' => $user1->id]); // user_id is unique
        CartItem::create(['cart_id' => $cart1->id, 'product_id' => $product1->id]);
        // If user2 should have a cart
        // $cart2 = Cart::create(['user_id' => $user2->id]);
        // CartItem::create(['cart_id' => $cart2->id, 'product_id' => $product3->id]);


        $this->command->info('Seeding Recharge & Withdrawal...');
        $rc1WalletTx = WalletTransaction::create([
            'wallet_id' => $wallet1->id,
            'type' => 'recharge_card',
            'amount' => 100, // Amount received
            'status' => 1, // Say, it's completed
        ]);
        RechargeCard::create([
            'wallet_transaction_id' => $rc1WalletTx->id,
            'user_id' => $user1->id,
            'web_id' => $web1->id,
            'amount' => 100, // Amount received
            'value' => 100000, // Actual card value e.g. 100k VND card
            'declared_value' => 100000, // What user declared
            'telco' => 'Viettel',
            'serial' => 'VT123456789' . Str::random(3),
            'code' => 'VTCODE987654321' . Str::random(3),
            'status' => 1, // 1 = success
            'message' => 'Card accepted',
            'sign' => Str::random(10), // Placeholder
        ]);
        $rc1WalletTx->update(['related_id' => $rc1WalletTx->id, 'related_type' => RechargeCard::class]); // Self reference or actual RechargeCard ID


        $rb1WalletTx = WalletTransaction::create([
            'wallet_id' => $wallet2->id,
            'type' => 'recharge_bank',
            'amount' => 200,
            'status' => 1, // completed
        ]);
        RechargeBank::create([
            'wallet_transaction_id' => $rb1WalletTx->id,
            'user_id' => $user2->id,
            'web_id' => $web1->id,
            'amount' => 200,
            'transaction_reference' => 'BANKTXN001-' . Str::random(5),
            'status' => 1, // success
        ]);
        $rb1WalletTx->update(['related_id' => $rb1WalletTx->id, 'related_type' => RechargeBank::class]);


        $wd1WalletTx = WalletTransaction::create([
            'wallet_id' => $wallet1->id,
            'type' => 'withdraw',
            'amount' => 50, // Amount to withdraw
            'status' => 0, // pending initially
        ]);
        Withdrawal::create([
            'wallet_transaction_id' => $wd1WalletTx->id,
            'user_id' => $user1->id,
            'amount' => 50,
            'bank_account_number' => '1234567890',
            'bank_name' => 'UserBank',
            'account_holder_name' => 'Admin User',
            'note' => 'Withdrawal request',
            'status' => 0 // pending
        ]);
        // Later, when withdrawal is processed, its status and wallet transaction status would update.
        // $wd1WalletTx->update(['status' => 1, 'related_id' => ID_OF_WITHDRAWAL_RECORD, 'related_type' => Withdrawal::class]);


        $this->command->info('Seeding Promotions...');
        Promotion::create([
            'code' => 'SUMMER25-' . Str::random(4), // code unique
            'description' => '25 off for summer items',
            'discount_value' => 25, // Value
            'min_discount_amount' => 5,
            'max_discount_amount' => 50,
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'usage_limit' => 100,
            'per_user_limit' => 1,
            'status' => 1, // active
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);
        DonatePromotion::create([
            'web_id' => $web1->id,
            'code' => 'DONATE10-' . Str::random(4), // code unique
            'amount' => 10, // Value
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
            'usage_limit' => -1, // unlimited
            'status' => 1, // active
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);

        $this->command->info('Seeding Logs and Posts...');
        SystemLog::create([
            'user_id' => $user1->id,
            'action_type' => 'login_success',
            'target_table' => 'users',
            'target_id' => $user1->id,
            'description' => 'User logged in successfully.',
            'ip_address' => '127.0.0.1'
        ]);
        SystemLog::create([
            'action_type' => 'system_error',
            'description' => 'A critical error occurred in payment gateway.',
            'new_value' => json_encode(['error_code' => 500, 'service' => 'PaymentService']),
            'ip_address' => '127.0.0.1'
        ]);

        $post1 = Post::create([
            'title' => 'My First Blog Post',
            'slug' => 'my-first-blog-post-' . Str::random(5), // slug unique
            'content' => 'This is the content of my first post about Laravel.',
            'category_id' => $category2->id, // Belongs to Books category
            'author_id' => $user2->id,
            'status' => 1, // published
            'image_thumbnail_url' => '/images/posts/first-post.jpg'
        ]);
        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $user1->id,
            'content' => 'Nice post!',
            'status' => 1 // approved
        ]);
        $parentComment = Comment::create([
            'post_id' => $post1->id,
            'user_id' => $user3->id,
            'content' => 'Interesting thoughts on this topic.',
            'status' => 1 // approved
        ]);
        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $user2->id,
            'parent_id' => $parentComment->id,
            'content' => 'Thanks for the feedback!',
            'status' => 1 // approved
        ]);


        $this->command->info('Seeding Notifications, Chats, Banners...');
        Notification::create([
            'user_id' => $user2->id,
            'title' => 'New Post Published',
            'content' => 'A new post titled "' . $post1->title . '" is now live!',
            'link' => '/posts/' . $post1->slug,
            'is_read' => 0 // unread
        ]);

        $chatRoom1 = ChatRoom::create(['name' => 'General Support', 'created_by' => $user1->id]);
        Message::create(['chat_room_id' => $chatRoom1->id, 'sender_id' => $user2->id, 'content' => 'I need help with my recent order.']);
        Message::create(['chat_room_id' => $chatRoom1->id, 'sender_id' => $user1->id, 'content' => 'Sure, what is your order code?']);

        Banner::create([
            'web_id' => $web1->id,
            'title' => 'Summer Sale Banner',
            'image_url' => '/banners/main_summer.jpg',
            'link' => '/promotions/SUMMER25',
            'status' => 1, // active
            'created_by' => $user1->id,
            'updated_by' => $user1->id
        ]);

        $this->command->info('Seeding Affiliates and Refresh Tokens...');
        $affiliateUser = User::create([
            'username' => 'AffiliateMarketer',
            'email' => 'affiliate@example.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg',
            'donate_code' => Str::uuid()->toString(),
            'status' => 1,
        ]);
        Affiliate::create([
            'user_id' => $affiliateUser->id,
            'affiliated_by' => $user1->id, // Referred by user1
            'commission_amount' => 0 // Initial commission
        ]);
        Affiliate::create([
            'user_id' => $user2->id, // user2 is also an affiliate
            'affiliated_by' => null, // Not referred by anyone in this record
            'commission_amount' => 0
        ]);

        RefreshToken::create([
            'user_id' => $user1->id,
            'refresh_token' => Str::random(60), // token unique
            'revoked' => 0, // not revoked
            'expires_at' => now()->addDays(30),
            'user_agent' => 'SeederAgent/1.0'
        ]);

        $this->command->info('Database seeding completed.');
    }
}
