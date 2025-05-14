<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('roles')->insert([
    [
        'role_name' => 'user',
    ],
    [
        'role_name' => 'partner',
    ],
    [
        'role_name' => 'reseller',
    ],
    [
        'role_name' => 'admin',
    ],
]);

    }
}
