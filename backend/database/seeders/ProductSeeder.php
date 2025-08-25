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
        DB::table('categories')->insertGetId([
                'parent_id' => null,
                'name' => 'Khác',
                'slug' => 'khac',
                'image_url' => 'https://picsum.photos/400/300?random='  . 12,
                'status' => 1,
                'created_by' => 1,
                'updated_by' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        $parent_categories = [];
        // $parent_categories[] = 
        // Tạo danh mục cha và con
        
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
        $category_ids = DB::table('categories')->where('id','!=',1)->where('parent_id','!=',null)->pluck('id')->toArray();
        for ($i = 1; $i <= 30; $i++) {
            $product_id = DB::table('products')->insertGetId([
                'category_id' => $category_ids[array_rand($category_ids)],
                'sku' => Str::random(16),
                'import_price' => rand(50000, 100000),
                'price' => rand(100000, 500000),
                'sale' => rand(80000, 450000),
                'status' => 1,
                'web_id' => 1,
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
    }
}
