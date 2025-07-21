<?php

// FILE: database/seeders/RolesAndPermissionsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Web;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RolesAndPermissionsSeeder extends Seeder
{
    private function generateCode(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $max)];
        }
        return $code;
    }

    public function run(): void
    {
        // === PHẦN 1: THIẾT LẬP CƠ SỞ DỮ LIỆU ===
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Permission::truncate();
        Role::truncate();
        Web::truncate();
        User::truncate();
        Wallet::truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $this->command->info('Đã xóa dữ liệu cũ trong các bảng liên quan.');


        // === PHẦN 2: ĐỊNH NGHĨA VÀ TẠO TẤT CẢ CÁC QUYỀN (PERMISSIONS) ===
        $this->command->info('Bắt đầu tạo Permissions...');
        
        $permissionsByGroup = [
            'Quản lý Hệ thống & Phân quyền' => [
                'system.manage-settings' => 'Quản lý cài đặt chung của website',
                'system.view-logs'       => 'Xem nhật ký hệ thống',
                'roles.manage'           => 'Quản lý vai trò (tạo/sửa/xóa)',
                'roles.assign'           => 'Gán vai trò và quyền cho người dùng',
            ],
            'Quản lý Người dùng' => [
                'users.manage'         => 'Quản lý người dùng (bao gồm tất cả quyền con)',
                'users.view'           => 'Xem danh sách người dùng',
                'users.create'         => 'Tạo người dùng mới',
                'users.edit'           => 'Sửa thông tin người dùng',
                'users.delete'         => 'Xóa người dùng',
                'users.manage-status'  => 'Kích hoạt/Vô hiệu hóa người dùng',
                'users.reset-password' => 'Đặt lại mật khẩu cho người dùng',
            ],
            'Quản lý Sản phẩm & Dịch vụ' => [
                'products.manage'            => 'Quản lý sản phẩm (bao gồm tất cả quyền con)',
                'products.view'              => 'Xem danh sách sản phẩm/dịch vụ',
                'products.create'            => 'Tạo sản phẩm/dịch vụ mới',
                'products.edit'              => 'Sửa sản phẩm/dịch vụ',
                'products.delete'            => 'Xóa sản phẩm/dịch vụ',
                'products.approve'           => 'Duyệt (chấp nhận/từ chối) sản phẩm',
                'categories.manage'          => 'Quản lý danh mục sản phẩm',
            ],
            'Quản lý Bán hàng & Đơn hàng' => [
                'orders.manage'        => 'Quản lý đơn hàng (bao gồm tất cả quyền con)',
                'orders.view-all'      => 'Xem tất cả đơn hàng',
                'orders.view-own'      => 'Chỉ xem đơn hàng của bản thân',
                'orders.create'        => 'Tạo đơn hàng mới',
                'orders.edit'          => 'Sửa thông tin đơn hàng',
                'orders.delete'        => 'Xóa đơn hàng',
                'orders.update-status' => 'Cập nhật trạng thái đơn hàng',
            ],
            'Quản lý Nội dung & Bài viết' => [
                'posts.manage'         => 'Quản lý bài viết (bao gồm tất cả quyền con)',
                'posts.view'           => 'Xem danh sách bài viết',
                'posts.create'         => 'Tạo bài viết mới',
                'posts.edit'           => 'Sửa bài viết',
                'posts.delete'         => 'Xóa bài viết',
                'posts.publish'        => 'Xuất bản/Hủy xuất bản bài viết',
                'post-categories.manage' => 'Quản lý danh mục bài viết',
                'banners.manage'       => 'Quản lý banner (bao gồm tất cả quyền con)',
                'banners.view'         => 'Xem danh sách banner',
                'banners.create'       => 'Tạo banner mới',
                'banners.edit'         => 'Sửa banner',
                'banners.delete'       => 'Xóa banner',
            ],
            'Quản lý Mã giảm giá' => [
                'discounts.manage' => 'Quản lý toàn bộ mã giảm giá',
                'discounts.view'   => 'Xem danh sách mã giảm giá',
                'discounts.create' => 'Tạo mã giảm giá mới',
                'discounts.edit'   => 'Sửa mã giảm giá',
                'discounts.delete' => 'Xóa mã giảm giá',
            ],
            'Quản lý Rút tiền' => [
                'withdrawals.manage'      => 'Quản lý toàn bộ yêu cầu rút tiền',
                'withdrawals.view-all'    => 'Xem tất cả yêu cầu rút tiền',
                'withdrawals.approve'     => 'Duyệt yêu cầu rút tiền',
                'withdrawals.reject'      => 'Từ chối yêu cầu rút tiền',
                'withdrawals.create'      => 'Tạo yêu cầu rút tiền (cho bản thân)',
                'withdrawals.view-own'    => 'Xem lịch sử rút tiền của bản thân',
            ],
            'Quản lý Tiếp thị liên kết (Affiliate)' => [
                'affiliates.manage'       => 'Quản lý toàn bộ hệ thống affiliate',
                'affiliates.view-all'     => 'Xem tất cả các đối tác affiliate',
                'affiliates.view-history' => 'Xem lịch sử hoa hồng của tất cả đối tác',
                'affiliates.view-own-history' => 'Xem lịch sử hoa hồng của bản thân',
            ],
            'Quản lý Tương tác người dùng' => [
                'reviews.create'           => 'Tạo đánh giá cho sản phẩm',
                'reviews.manage'           => 'Quản lý (duyệt/xóa) đánh giá',
                'product-reports.create'   => 'Tạo báo cáo lỗi cho sản phẩm',
                'product-reports.manage'   => 'Quản lý (xem/xử lý) báo cáo lỗi',
            ],
            'Quản lý Báo cáo' => [
                'reports.manage'         => 'Quản lý báo cáo (bao gồm tất cả quyền con)',
                'reports.view-sales'     => 'Xem báo cáo doanh thu',
                'reports.view-user-activity' => 'Xem báo cáo hoạt động người dùng',
            ]
        ];

        foreach ($permissionsByGroup as $group => $permissions) {
            foreach ($permissions as $permissionName => $description) {
                Permission::create([
                    'name' => $permissionName,
                    'description' => $description,
                    'group_name' => $group,
                    'guard_name' => 'api',
                ]);
            }
        }
        $this->command->info('Đã tạo tất cả Permissions chi tiết.');


        // === PHẦN 3: TẠO CÁC VAI TRÒ (ROLES) VÀ GÁN QUYỀN TƯƠNG ỨNG ===
        $this->command->info('Bắt đầu tạo Roles và gán Permissions...');

        // Cấp 1: Admin (Tối cao, có mọi quyền)
        $adminRole = Role::create(['name' => 'admin', 'description' => 'Quản trị viên tối cao, có mọi quyền hạn.', 'guard_name' => 'api']);
        $adminRole->givePermissionTo(Permission::all());
        $this->command->info('Role "admin" đã được tạo.');

        // Cấp 2: Super Admin (Quản trị viên cấp cao)
        $superAdminRole = Role::create(['name' => 'super-admin', 'description' => 'Quản trị viên cấp cao, có gần như toàn bộ quyền trừ quản lý phân quyền.', 'guard_name' => 'api']);
        $permissionsForSuperAdmin = Permission::where('group_name', '!=', 'Quản lý Hệ thống & Phân quyền')->pluck('name');
        $superAdminRole->givePermissionTo($permissionsForSuperAdmin);
        $this->command->info('Role "super-admin" đã được tạo.');

        // Cấp 3: Partner (Đối tác bán hàng)
        $partnerRole = Role::create(['name' => 'partner', 'description' => 'Đối tác bán sản phẩm trên nền tảng.', 'guard_name' => 'api']);
        $partnerRole->givePermissionTo([
            'products.create',
            'products.edit',
            'products.delete',
            'discounts.create',
            'discounts.edit',
        ]);
        $this->command->info('Role "partner" đã được tạo.');

        // Cấp 4: Affiliate (Đối tác tiếp thị liên kết)
        $affiliateRole = Role::create(['name' => 'affiliate', 'description' => 'Đối tác tiếp thị liên kết, nhận hoa hồng.', 'guard_name' => 'api']);
        $affiliateRole->givePermissionTo([
            'affiliates.view-own-history',
        ]);
        $this->command->info('Role "affiliate" đã được tạo.');

        // Cấp 5: Nhân viên Kinh doanh (Sales Staff)
        $salesStaffRole = Role::create(['name' => 'sales_staff', 'description' => 'Nhân viên Kinh doanh', 'guard_name' => 'api']);
        $salesStaffRole->givePermissionTo(['products.view', 'orders.view-all', 'orders.edit', 'orders.update-status']);
        $this->command->info('Role "sales_staff" đã được tạo.');

        // Cấp 6: Nhân viên Nội dung (Content Creator)
        $contentCreatorRole = Role::create(['name' => 'content_creator', 'description' => 'Nhân viên Nội dung/Marketing', 'guard_name' => 'api']);
        $contentCreatorRole->givePermissionTo(['posts.manage', 'banners.manage', 'discounts.view']);
        $this->command->info('Role "content_creator" đã được tạo.');

        // Cấp 7: Người dùng thông thường (User)
        $userRole = Role::create(['name' => 'user', 'description' => 'Người dùng thông thường của website.', 'guard_name' => 'api']);
        $userRole->givePermissionTo([
            'orders.view-own',
            'withdrawals.create',
            'withdrawals.view-own',
            'discounts.create',
            'reviews.create',
            'product-reports.create',
        ]);
        $this->command->info('Role "user" đã được tạo.');


        // === PHẦN 4: TẠO DỮ LIỆU MẪU (WEBS, USERS, WALLETS) ===
        $this->command->info('Bắt đầu tạo dữ liệu mẫu...');

        $mainWeb = Web::create(['subdomain' => 'main-site', 'user_id' => null, 'api_key' => "D9BD170B6093FF737C754C8A5070FC97", 'status' => 1, 'is_customized' => true]);
        $Web = Web::create(['subdomain' => 'sub-site', 'user_id' => null, 'api_key' => "D9BD170B6093FF737C754C8A50703333", 'status' => 1, 'is_customized' => true]);
        $this->command->info('Đã tạo web mẫu.');

        // Tài khoản Admin Tối cao
        $adminUser = User::create(['username' => 'admin', 'email' => 'admin@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000001', 'donate_code' => $this->generateCode(16)]);
        $adminUser->assignRole('admin');
        Wallet::create(["user_id" => $adminUser->id, "balance" => "999999999", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Admin.');

        // Tài khoản Super Admin
        $superAdminUser = User::create(['username' => 'superadmin', 'email' => 'superadmin@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000002', 'donate_code' => $this->generateCode(16)]);
        $superAdminUser->assignRole('super-admin', 'user');
        Wallet::create(["user_id" => $superAdminUser->id, "balance" => "10000000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Super Admin.');

        // Tài khoản Partner
        $partnerUser = User::create(['username' => 'partner', 'email' => 'partner@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000003', 'donate_code' => $this->generateCode(16)]);
        $partnerUser->assignRole('partner', 'user');
        Wallet::create(["user_id" => $partnerUser->id, "balance" => "1000000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Partner.');

        // Tài khoản Affiliate
        $affiliateUser = User::create(['username' => 'affiliate', 'email' => 'affiliate@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000004', 'donate_code' => $this->generateCode(16)]);
        $affiliateUser->assignRole('affiliate', 'user');
        Wallet::create(["user_id" => $affiliateUser->id, "balance" => "200000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Affiliate.');

        // Tài khoản User cơ bản
        $basicUser = User::create(['username' => 'user', 'email' => 'user@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000005', 'donate_code' => $this->generateCode(16)]);
        $basicUser->assignRole('user');
        Wallet::create(["user_id" => $basicUser->id, "balance" => "50000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Basic User.');


        // Cập nhật lại chủ sở hữu cho web chính
        $mainWeb->user_id = $adminUser->id;
        $mainWeb->save();
        $this->command->info('Đã cập nhật chủ sở hữu cho web.');

        $this->command->info('Hoàn tất Seeder!');
    }
}