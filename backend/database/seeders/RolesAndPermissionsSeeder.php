<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Web;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission; // Though not used yet, good to have for future

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        Role::create(['name' => 'admin']);
        $this->command->info('Role "admin" created.');

        Role::create(['name' => 'user']);
        $this->command->info('Role "user" created.');

        $user = User::all();
        foreach ($user as $u) {
            $u->assignRole('user');
            $this->command->info('gán quyền user', $u->username);
        }

        $web1 = Web::find('1');
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'web_id' => $web1->id,
            'avatar_url' => 'https://cdn2.fptshop.com.vn/unsafe/800x0/avatar_anime_nam_cute_18_a74be9502d.jpg', // Default or specific
            'donate_code' => Str::uuid()->toString(),
            'status' => 1, // Active
            'phone' => '0123456789'
        ]);
        $admin->assignRole('admin');
        $this->command->info('gán quyền admin');
    }
}
