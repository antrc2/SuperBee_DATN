<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public static function generateCode(int $length = 8): string
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
        DB::table("users")->insert([
            "username"=>"admin",
            "password"=>Hash::make('SuperBee'),
            "fullname"=>"Nguyễn Ngọc An",
            "email"=>"antrc2gamer@gmail.com",
            "phone"=>"0838411897",
            "avatar_url"=>"https://scontent.fhan17-1.fna.fbcdn.net/v/t39.30808-6/487034572_1453794068933197_4817551113423752172_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFc3VQcZmHjlXvivxG-y4EolbigoRBaZpyVuKChEFpmnD3rbIhJJb-okwQF6dR1KkQ1-zXzbnbDVA_A-wYUvzNt&_nc_ohc=YqIzChykyRkQ7kNvwH6NYby&_nc_oc=Admh-EiJVQQCZym8lbBQ0qfTW1ZJMdkM44McC-rMGVeg34jACl10zeh1lM5gw8z0AXc&_nc_zt=23&_nc_ht=scontent.fhan17-1.fna&_nc_gid=xM_TttloRDojmOauvJsqyg&oh=00_AfI1UCr3ybyraQ917X0bWgmEdkicdjRs_2Vnd8lQhsT5NQ&oe=682A520D",
            "balance"=>0,
            "role_id"=>4,
            "web_id"=>1,
            "donate_code"=>$this->generateCode(8),
            "affiliated_by"=>null
            
        ]);
    }
}
