<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Web;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AccountCTV extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Role::create(['name' => 'admin']);
        $this->command->info('Role "admin" created.');

        Role::create(['name' => 'user']);
        $this->command->info('Role "user" created.');

        Role::create(['name' => 'partner']);
        $this->command->info('Role "partner" created.');

        Role::create(['name' => 'reseller']);
        $this->command->info('Role "reseller" created.');
        // Tạo web
        $web1 = Web::create([
            'subdomain' => '' . Str::random(5),
            'user_id' => null,
            'api_key' => Str::random(16),
            'status' => 1,
            'is_customized' => true,
        ]);
        $web2 = Web::create([
            'subdomain' => '' . Str::random(5),
            'user_id' => null,
            'api_key' => Str::random(16),
            'status' => 1,
            'is_customized' => false,
        ]);
        $user1 = User::create([
            'username' => 'userHai',
            'email' => 'userHai@gmail.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg', // Default or specific
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
            'phone' => '0123456789'
        ]);
        $user1->assignRole('user');
        $this->command->info('gán quyền user');

        $user2 = User::create([
            'username' => 'partner',
            'email' => 'partner@gmail.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg',
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
        ]);
        $user2->assignRole('partner');
        $this->command->info('gán quyền partner');

        $user3 = User::create([
            'username' => 'reseller',
            'email' => 'reseller@gmail.com',
            'password' => Hash::make('password'),
            'web_id' => $web2->id, // User must belong to a web
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg',
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
        ]);
        $user3->assignRole('reseller');
        $this->command->info('gán quyền reseller');

        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg', // Default or specific
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
            'phone' => '0123456789'
        ]);
        $admin->assignRole('admin');
        $this->command->info('gán quyền admin');
        $web1->user_id = $admin->id;
        $web2->user_id = $user1->id;
        $web1->save();
        $web2->save();
        Wallet::create([
            "user_id" => $user1->id,
            "balance" => "0",
            "currency" => "VND"
        ]);
        Wallet::create([
            "user_id" => $user2->id,
            "balance" => "0",
            "currency" => "VND"
        ]);
        Wallet::create([
            "user_id" => $user3->id,
            "balance" => "0",
            "currency" => "VND"
        ]);
        Wallet::create([
            "user_id" => $admin->id,
            "balance" => "0",
            "currency" => "VND"
        ]);
    }
}
