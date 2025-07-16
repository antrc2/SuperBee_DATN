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
   // Tạo danh mục cha và con
        $parent_categories = [];
        for ($i = 1; $i <= 7; $i++) {
            $parent_categories[] = DB::table('categories')->insertGetId([
                'parent_id' => null,
                'name' => 'Danh mục cha ' . $i,
                'slug' => 'danh-muc-cha-' . $i,
                'image_url' => 'https://picsum.photos/400/300?random='  . $i,
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        for ($i = 1; $i <= 10; $i++) {
            DB::table('categories')->insert([
                'parent_id' => $parent_categories[array_rand($parent_categories)],
                'name' => 'Danh mục con ' . $i,
                'slug' => 'danh-muc-con-' . $i,
                'image_url' => 'https://picsum.photos/400/300?random='  . $i,
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Tạo sản phẩm
        $category_ids = DB::table('categories')->pluck('id')->toArray();
        for ($i = 1; $i <= 30; $i++) {
            $product_id = DB::table('products')->insertGetId([
                'category_id' => $category_ids[array_rand($category_ids)],
                'sku' => Str::random(16),
                'import_price' => rand(50000, 100000),
                'price' => rand(100000, 500000),
                'sale' => rand(80000, 450000),
                'status' => rand(0, 1),
                'web_id' => rand(1, 2),
                'created_by' => rand(1, 3),
                'updated_by' => rand(1, 3),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Tạo thuộc tính game cho sản phẩm
            DB::table('product_game_attributes')->insert([
                ['product_id' => $product_id, 'attribute_key' => 'rank', 'attribute_value' => ['Vàng', 'Bạch kim', 'Kim cương', 'Cao thủ'][array_rand(['Vàng', 'Bạch kim', 'Kim cương', 'Cao thủ'])]],
                ['product_id' => $product_id, 'attribute_key' => 'tướng', 'attribute_value' => rand(50, 150)],
                ['product_id' => $product_id, 'attribute_key' => 'trang_phục', 'attribute_value' => rand(20, 200)],
                ['product_id' => $product_id, 'attribute_key' => 'ngọc', 'attribute_value' => rand(60, 90)],
            ]);

            // Tạo thông tin đăng nhập cho sản phẩm
            DB::table('product_credentials')->insert([
                'product_id' => $product_id,
                'username' => 'user' . $product_id . '@example.com',
                'password' => 'password' . $product_id,
            ]);

            // Tạo hình ảnh cho sản phẩm
            for ($j = 1; $j <= 5; $j++) {
                DB::table('product_images')->insert([
                    'product_id' => $product_id,
                    'image_url' => 'https://picsum.photos/400/300?random=' . $product_id . $j,
                    'alt_text' => 'Ảnh sản phẩm ' . $product_id . ' - ' . $j,
                ]);
            }
        }

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
