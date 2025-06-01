<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            "name"=>"Khác",
            "image_url"=>"https://scontent.fhan17-1.fna.fbcdn.net/v/t39.30808-6/487034572_1453794068933197_4817551113423752172_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFc3VQcZmHjlXvivxG-y4EolbigoRBaZpyVuKChEFpmnD3rbIhJJb-okwQF6dR1KkQ1-zXzbnbDVA_A-wYUvzNt&_nc_ohc=b1nfuV4Jop0Q7kNvwGqcZ0y&_nc_oc=AdniPw40lBMor_P5-bNsx8i3kuNHP2EQ2ScWxbtLlDuTS7ovfadf4jy9NzxyS6v1GdA&_nc_zt=23&_nc_ht=scontent.fhan17-1.fna&_nc_gid=V8ooLuqyJhvwOokrkus2Qg&oh=00_AfJ7h-q5kWprRfxMJ5_I8K1SC0FuGIL8psYdjpqgl7BviQ&oe=6834A5CD",
            "status"=>1,
            "created_by"=>1,
            "updated_by"=>1,
        ]);
    }
}
