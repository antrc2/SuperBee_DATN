<?php

namespace Database\Seeders;

use App\Models\Categorypost;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    function generate_sku($length = 20)
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $code;
    }
    public function run(): void
    {
        DB::table('categories')->insert([
            [
                'parent_id' => null,
                'name' => 'Liên quân',
                'slug' => 'lien-quan',
                'image_url' => "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/07/THUMB.jpg",
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => 1,
                'name' => 'Acc giá rẻ',
                'slug' => 'acc-gia-re',
                'image_url' => "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBiy_MiUoYgYFn4YaZgVEPlQLWwGcC8cFnhg&s",
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => null,
                'name' => 'Free Fire',
                'slug' => 'free-fire',
                'image_url' => "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl8ChEz5aiEtyp5HkGleh0-J3JH8tUGCF3Hw&s",
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => 2,
                'name' => 'Acc nhiều skin súng',
                'slug' => 'acc-nhieu-skin-sung',
                'image_url' => "https://cdn-media.sforum.vn/storage/app/media/acc-ff-mien-phi-1.jpg",
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'parent_id' => 2,
                'name' => 'Acc rank cao',
                'slug' => 'acc-rank-cao',
                'image_url' => "https://vnesports.net/assets/img_blog/images/rank-huyen-thoai-la-rank-cao-cap-trong-game.jpg",
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        DB::table('products')->insert([
            [
                'category_id' => 2,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 100000,
                'sale' => 90000,
                'status' => 1,
                'web_id' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 80000,
                'sale' => 75000,
                'status' => 1,
                'web_id' => 1,
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 4,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 120000,
                'sale' => null,
                'status' => 1,
                'web_id' => 2,
                'created_by' => 1,
                'updated_by' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 4,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 150000,
                'sale' => 140000,
                'status' => 0,
                'web_id' => 1,
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 5,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 200000,
                'sale' => 190000,
                'status' => 1,
                'web_id' => 2,
                'created_by' => 3,
                'updated_by' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 5,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 110000,
                'sale' => 105000,
                'status' => 1,
                'web_id' => 2,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 90000,
                'sale' => 85000,
                'status' => 1,
                'web_id' => 1,
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 5,
                'sku' => $this->generate_sku(16),
                'import_price' => 50000,
                'price' => 130000,
                'sale' => null,
                'status' => 1,
                'web_id' => 1,
                'created_by' => 3,
                'updated_by' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        DB::table('product_game_attributes')->insert([
            ['product_id' => 1, 'attribute_key' => 'rank', 'attribute_value' => 'Challenger'],
            ['product_id' => 1, 'attribute_key' => 'num_champions', 'attribute_value' => '150'],
            ['product_id' => 2, 'attribute_key' => 'level', 'attribute_value' => '75'],
            ['product_id' => 2, 'attribute_key' => 'skin_count', 'attribute_value' => '25'],
            ['product_id' => 3, 'attribute_key' => 'adventure_rank', 'attribute_value' => '50'],
            ['product_id' => 3, 'attribute_key' => 'characters', 'attribute_value' => '30'],
            ['product_id' => 4, 'attribute_key' => 'rank', 'attribute_value' => 'Diamond'],
            ['product_id' => 5, 'attribute_key' => 'adventure_rank', 'attribute_value' => '70'],
            ['product_id' => 6, 'attribute_key' => 'level', 'attribute_value' => '45'],
            ['product_id' => 7, 'attribute_key' => 'skin_count', 'attribute_value' => '10'],
            ['product_id' => 8, 'attribute_key' => 'rank', 'attribute_value' => 'Platinum'],
        ]);
        DB::table('product_credentials')->insert([
            ['product_id' => 1, 'username' => 'user1@example.com', 'password' => 'password1'],
            ['product_id' => 2, 'username' => 'user2@example.com', 'password' => 'password2'],
            ['product_id' => 3, 'username' => 'user3@example.com', 'password' => 'password3'],
            ['product_id' => 4, 'username' => 'user4@example.com', 'password' => 'password4'],
            ['product_id' => 5, 'username' => 'user5@example.com', 'password' => 'password5'],
            ['product_id' => 6, 'username' => 'user6@example.com', 'password' => 'password6'],
            ['product_id' => 7, 'username' => 'user7@example.com', 'password' => 'password7'],
            ['product_id' => 8, 'username' => 'user8@example.com', 'password' => 'password8'],
        ]);
        DB::table('product_images')->insert([
            // Liên Minh Huyền Thoại
            ['product_id' => 1, 'image_url' => 'https://dybedu.com.vn/hinh-nen-lien-minh-4k/1.jpg', 'alt_text' => 'Master Yi trong Liên Minh Huyền Thoại'],
            ['product_id' => 1, 'image_url' => 'https://dybedu.com.vn/hinh-nen-lien-minh-4k/2.jpg', 'alt_text' => 'Annie trong Liên Minh Huyền Thoại'],
            ['product_id' => 1, 'image_url' => 'https://dybedu.com.vn/hinh-nen-lien-minh-4k/3.jpg', 'alt_text' => 'Lux trong Liên Minh Huyền Thoại'],
            ['product_id' => 1, 'image_url' => 'https://dybedu.com.vn/hinh-nen-lien-minh-4k/4.jpg', 'alt_text' => 'Yasuo trong Liên Minh Huyền Thoại'],
            ['product_id' => 1, 'image_url' => 'https://dybedu.com.vn/hinh-nen-lien-minh-4k/5.jpg', 'alt_text' => 'Zed trong Liên Minh Huyền Thoại'],

            // Free Fire
            ['product_id' => 2, 'image_url' => 'https://xaydungso.vn/blog/tai-ngay-1000-hinh-anh-nhan-vat-free-fire-dep-nhat-danh-cho-fan-cua-game-ff-vi-cb.html/1.jpg', 'alt_text' => 'Nhân vật Free Fire 1'],
            ['product_id' => 2, 'image_url' => 'https://xaydungso.vn/blog/tai-ngay-1000-hinh-anh-nhan-vat-free-fire-dep-nhat-danh-cho-fan-cua-game-ff-vi-cb.html/2.jpg', 'alt_text' => 'Nhân vật Free Fire 2'],
            ['product_id' => 2, 'image_url' => 'https://xaydungso.vn/blog/tai-ngay-1000-hinh-anh-nhan-vat-free-fire-dep-nhat-danh-cho-fan-cua-game-ff-vi-cb.html/3.jpg', 'alt_text' => 'Nhân vật Free Fire 3'],
            ['product_id' => 2, 'image_url' => 'https://xaydungso.vn/blog/tai-ngay-1000-hinh-anh-nhan-vat-free-fire-dep-nhat-danh-cho-fan-cua-game-ff-vi-cb.html/4.jpg', 'alt_text' => 'Nhân vật Free Fire 4'],
            ['product_id' => 2, 'image_url' => 'https://xaydungso.vn/blog/tai-ngay-1000-hinh-anh-nhan-vat-free-fire-dep-nhat-danh-cho-fan-cua-game-ff-vi-cb.html/5.jpg', 'alt_text' => 'Nhân vật Free Fire 5'],

            // Genshin Impact
            ['product_id' => 3, 'image_url' => 'https://cipershop.com/san-pham/mo-hinh-ganyu-trong-genshin-impact-figure-ganyu-anime.html/1.jpg', 'alt_text' => 'Mô hình Ganyu trong Genshin Impact'],
            ['product_id' => 3, 'image_url' => 'https://cipershop.com/san-pham/mo-hinh-ganyu-trong-genshin-impact-figure-ganyu-anime.html/2.jpg', 'alt_text' => 'Mô hình Ganyu trong Genshin Impact'],
            ['product_id' => 3, 'image_url' => 'https://cipershop.com/san-pham/mo-hinh-ganyu-trong-genshin-impact-figure-ganyu-anime.html/3.jpg', 'alt_text' => 'Mô hình Ganyu trong Genshin Impact'],
            ['product_id' => 3, 'image_url' => 'https://cipershop.com/san-pham/mo-hinh-ganyu-trong-genshin-impact-figure-ganyu-anime.html/4.jpg', 'alt_text' => 'Mô hình Ganyu trong Genshin Impact'],
            ['product_id' => 3, 'image_url' => 'https://cipershop.com/san-pham/mo-hinh-ganyu-trong-genshin-impact-figure-ganyu-anime.html/5.jpg', 'alt_text' => 'Mô hình Ganyu trong Genshin Impact'],

            // Game nhập vai
            ['product_id' => 4, 'image_url' => 'https://didongviet.vn/dchannel/game-nhap-vai-mobile/1.jpg', 'alt_text' => 'Thiên Nữ Mobile'],
            ['product_id' => 4, 'image_url' => 'https://didongviet.vn/dchannel/game-nhap-vai-mobile/2.jpg', 'alt_text' => 'Thiên Nữ Mobile'],
            ['product_id' => 4, 'image_url' => 'https://didongviet.vn/dchannel/game-nhap-vai-mobile/3.jpg', 'alt_text' => 'Thiên Nữ Mobile'],
            ['product_id' => 4, 'image_url' => 'https://didongviet.vn/dchannel/game-nhap-vai-mobile/4.jpg', 'alt_text' => 'Thiên Nữ Mobile'],
            ['product_id' => 4, 'image_url' => 'https://didongviet.vn/dchannel/game-nhap-vai-mobile/5.jpg', 'alt_text' => 'Thiên Nữ Mobile'],

            // Sản phẩm 5
            ['product_id' => 5, 'image_url' => 'https://example.com/images/product5_1.jpg', 'alt_text' => 'Ảnh sản phẩm 5 - 1'],
            ['product_id' => 5, 'image_url' => 'https://example.com/images/product5_2.jpg', 'alt_text' => 'Ảnh sản phẩm 5 - 2'],
            ['product_id' => 5, 'image_url' => 'https://example.com/images/product5_3.jpg', 'alt_text' => 'Ảnh sản phẩm 5 - 3'],

            // Sản phẩm 6
            ['product_id' => 6, 'image_url' => 'https://example.com/images/product6_1.jpg', 'alt_text' => 'Ảnh sản phẩm 6 - 1'],
            ['product_id' => 6, 'image_url' => 'https://example.com/images/product6_2.jpg', 'alt_text' => 'Ảnh sản phẩm 6 - 2'],
            ['product_id' => 6, 'image_url' => 'https://example.com/images/product6_3.jpg', 'alt_text' => 'Ảnh sản phẩm 6 - 3'],

            // Sản phẩm 7
            ['product_id' => 7, 'image_url' => 'https://example.com/images/product7_1.jpg', 'alt_text' => 'Ảnh sản phẩm 7 - 1'],
            ['product_id' => 7, 'image_url' => 'https://example.com/images/product7_2.jpg', 'alt_text' => 'Ảnh sản phẩm 7 - 2'],
            ['product_id' => 7, 'image_url' => 'https://example.com/images/product7_3.jpg', 'alt_text' => 'Ảnh sản phẩm 7 - 3'],

            // Sản phẩm 8
            ['product_id' => 8, 'image_url' => 'https://example.com/images/product8_1.jpg', 'alt_text' => 'Ảnh sản phẩm 8 - 1'],
            ['product_id' => 8, 'image_url' => 'https://example.com/images/product8_2.jpg', 'alt_text' => 'Ảnh sản phẩm 8 - 2'],
            ['product_id' => 8, 'image_url' => 'https://example.com/images/product8_3.jpg', 'alt_text' => 'Ảnh sản phẩm 8 - 3'],
        ]);

        $categories = [
            [
                'name' => 'Tin tức Game',
                'description' => 'Cập nhật các tin tức mới nhất về game, sự kiện và giải đấu.',
            ],
            [
                'name' => 'Hướng dẫn & Mẹo chơi',
                'description' => 'Các bài viết hướng dẫn chi tiết, mẹo và chiến thuật giúp người chơi nâng cao kỹ năng.',
            ],
            [
                'name' => 'Review & Đánh giá',
                'description' => 'Đánh giá chuyên sâu về các tựa game, nhân vật, trang bị và trải nghiệm chơi game.',
            ],
            [
                'name' => 'Cộng đồng & Văn hóa Game',
                'description' => 'Khám phá những câu chuyện, phỏng vấn và xu hướng trong cộng đồng game thủ.',
            ],
            [
                'name' => 'Ưu đãi Website',
                'description' => 'Thông tin về các chương trình khuyến mãi, giảm giá và cập nhật dịch vụ trên website.',
            ],
            [
                'name' => 'Phân tích Meta',
                'description' => 'Phân tích xu hướng meta game và các thay đổi quan trọng trong lối chơi.',
            ],
            [
                'name' => 'Giải đấu Esports',
                'description' => 'Tổng hợp tin tức, lịch thi đấu và kết quả các giải đấu Esports lớn nhỏ.',
            ],
        ];

        foreach ($categories as $categoryData) {
            Categorypost::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']), // Tự động tạo slug từ tên
                'description' => $categoryData['description'],
            ]);
        }
    }
}
