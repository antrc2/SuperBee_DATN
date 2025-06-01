<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WebSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table("webs")->insert([
            "subdomain"=>"admin",
            "user_id"=>1,
            'status'=>1,
            "api_key"=>strtoupper("71e64b1737eaed631b75c53e73fa3b4a484a05a7384d10eced611c643eda9e32"),
        ]);
    }
}
