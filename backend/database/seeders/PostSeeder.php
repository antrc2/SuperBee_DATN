<?php

namespace Database\Seeders;

use App\Models\Categorypost;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        // Seed danh mục bài viết
        $categories = [
            [
                'id' => 1,
                'name' => 'Hướng dẫn',
                'description' => 'Cập nhật các tin tức mới nhất về game, sự kiện và giải đấu.',
            ],
            // [
            //     'name' => 'Tin tức Game',
            //     'description' => 'Cập nhật các tin tức mới nhất về game, sự kiện và giải đấu.',
            // ],
            // [
            //     'name' => 'Hướng dẫn & Mẹo chơi',
            //     'description' => 'Các bài viết hướng dẫn chi tiết, mẹo và chiến thuật giúp người chơi nâng cao kỹ năng.',
            // ],
            // [
            //     'name' => 'Review & Đánh giá',
            //     'description' => 'Đánh giá chuyên sâu về các tựa game, nhân vật, trang bị và trải nghiệm chơi game.',
            // ],
            // [
            //     'name' => 'Cộng đồng & Văn hóa Game',
            //     'description' => 'Khám phá những câu chuyện, phỏng vấn và xu hướng trong cộng đồng game thủ.',
            // ],
            // [
            //     'name' => 'Ưu đãi Website',
            //     'description' => 'Thông tin về các chương trình khuyến mãi, giảm giá và cập nhật dịch vụ trên website.',
            // ],
            // [
            //     'name' => 'Phân tích Meta',
            //     'description' => 'Phân tích xu hướng meta game và các thay đổi quan trọng trong lối chơi.',
            // ],
            // [
            //     'name' => 'Giải đấu Esports',
            //     'description' => 'Tổng hợp tin tức, lịch thi đấu và kết quả các giải đấu Esports lớn nhỏ.',
            // ],
        ];

        foreach ($categories as $categoryData) {
            Categorypost::create([
                'id' => $categoryData['id'] ?? null,
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'description' => $categoryData['description'],
            ]);
        }

        // Seed bài viết mẫu
        $posts = [
            [
                'id' => 1,
                'title' => 'Hướng dẫn mua hàng',
                'slug' => 'huong-dan-mua-hang',
                'content' => 'Hướng dẫn mua hàng hiệu quả trên website của chúng tôi.',
                'description' => 'Chi tiết cách mua hàng và các mẹo hữu ích.',
                'category_id' => 1,
                'author_id' => 1,
                'status' => 1,
                'image_thumbnail_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'title' => 'Hướng dẫn nạp thẻ',
                'slug' => 'huong-dan-nap-the',
                'content' => 'Hướng dẫn nạp thẻ.',
                'description' => 'Hướng dẫn nạp thẻ.',
                'category_id' => 1,
                'author_id' => 1,
                'status' => 1,
                'image_thumbnail_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($posts as $postData) {
            DB::table('posts')->insert($postData);
        }
    }
}
