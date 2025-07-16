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
    /**
     * Helper function to generate random codes.
     */
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

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // === PHẦN 1: THIẾT LẬP CƠ SỞ DỮ LIỆU ===

        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Xóa dữ liệu cũ để tránh trùng lặp khi chạy lại seeder
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
                'auth.manage-roles'      => 'Quản lý vai trò (tạo/sửa/xóa)',
                'auth.assign-roles'      => 'Gán vai trò cho người dùng',
                'system.view-logs'       => 'Xem nhật ký hệ thống',
                'system.manage-settings' => 'Quản lý cài đặt chung của website',
            ],
            'Quản lý Người dùng' => [
                'users.view'              => 'Xem danh sách người dùng',
                'users.create'            => 'Tạo người dùng mới',
                'users.edit'              => 'Sửa thông tin người dùng',
                'users.delete'            => 'Xóa người dùng',
                'users.manage-status'     => 'Kích hoạt/Vô hiệu hóa người dùng',
                'users.reset-password'    => 'Đặt lại mật khẩu cho người dùng',
                'users.view-team-members' => 'Xem nhân viên trong nhóm của mình',
                'users.assign-task'       => 'Giao việc cho nhân viên',
            ],
            'Quản lý Sản phẩm & Dịch vụ' => [
                'products.view'               => 'Xem danh sách sản phẩm/dịch vụ',
                'products.create'             => 'Tạo sản phẩm/dịch vụ mới',
                'products.edit'               => 'Sửa sản phẩm/dịch vụ',
                'products.delete'             => 'Xóa sản phẩm/dịch vụ',
                'products.manage-categories'  => 'Quản lý danh mục',
                'products.manage-inventory'   => 'Quản lý kho hàng',
                'products.manage-attributes'  => 'Quản lý thuộc tính (màu sắc, kích thước)',
                'products.manage-reviews'     => 'Quản lý đánh giá sản phẩm',
            ],
            'Quản lý Bán hàng & Đơn hàng' => [
                'orders.view-all'         => 'Xem tất cả đơn hàng',
                'orders.view-own'         => 'Chỉ xem đơn hàng do mình tạo/phụ trách',
                'orders.create'           => 'Tạo đơn hàng mới',
                'orders.edit'             => 'Sửa thông tin đơn hàng',
                'orders.delete'           => 'Xóa đơn hàng',
                'orders.update-status'    => 'Cập nhật trạng thái đơn hàng',
                'orders.manage-refunds'   => 'Xử lý yêu cầu đổi trả, hoàn tiền',
                'orders.manage-customers' => 'Quản lý thông tin khách hàng',
            ],
            'Quản lý Hỗ trợ Khách hàng' => [
                'tickets.view-all'      => 'Xem tất cả yêu cầu hỗ trợ (ticket)',
                'tickets.view-own'      => 'Chỉ xem ticket được gán cho mình',
                'tickets.create'        => 'Tạo ticket mới',
                'tickets.reply'         => 'Trả lời, tương tác với ticket',
                'tickets.assign'        => 'Gán ticket cho nhân viên khác',
                'tickets.manage-status' => 'Thay đổi trạng thái ticket',
                'tickets.delete'        => 'Xóa ticket',
                'knowledgebase.manage'  => 'Quản lý trang Trợ giúp/FAQ',
                'chat.access-livechat'  => 'Truy cập và trả lời Live Chat',
            ],
            'Quản lý Tài chính & Kế toán' => [
                'finance.view-dashboard'    => 'Xem dashboard tài chính tổng quan',
                'finance.view-transactions' => 'Xem tất cả giao dịch',
                'finance.create-invoice'    => 'Tạo hóa đơn',
                'finance.manage-payment'    => 'Quản lý các khoản thanh toán',
                'finance.manage-payroll'    => 'Quản lý bảng lương nội bộ',
                'finance.export-report'     => 'Xuất báo cáo tài chính',
            ],
            'Quản lý Marketing & Nội dung' => [
                'content.manage-posts'       => 'Quản lý bài viết blog',
                'content.manage-banners'     => 'Quản lý banner quảng cáo',
                'marketing.manage-campaigns' => 'Quản lý các chiến dịch marketing',
                'marketing.view-analytics'   => 'Xem dữ liệu phân tích marketing',
            ],
            'Quản lý Báo cáo' => [
                'reports.view-sales'            => 'Xem báo cáo doanh thu',
                'reports.view-user-activity'    => 'Xem báo cáo hoạt động người dùng',
                'reports.view-team-performance' => 'Xem báo cáo hiệu suất của nhóm',
                'reports.view-support'          => 'Xem báo cáo của bộ phận hỗ trợ',
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

        // Cấp 1: Quản trị viên tối cao (có mọi quyền)
        $superAdminRole = Role::create(['name' => 'admin', 'description' => 'Quản trị viên tối cao, có mọi quyền hạn.', 'guard_name' => 'api']);
        $superAdminRole->givePermissionTo(Permission::all());
        $this->command->info('Role "super_admin" đã được tạo.');

        // Cấp 2: Quản trị viên nghiệp vụ (full quyền nghiệp vụ, không có quyền hệ thống)
        $businessAdminRole = Role::create(['name' => 'business_admin', 'description' => 'Quản trị viên nghiệp vụ, không có quyền hệ thống.', 'guard_name' => 'api']);
        $businessAdminRole->givePermissionTo(Permission::where('group_name', '!=', 'Quản lý Hệ thống & Phân quyền')->get());
        $this->command->info('Role "business_admin" đã được tạo.');
        
        // Cấp 2.5: Reseller (quyền như admin nhưng bị giới hạn bởi web_id)
        $resellerRole = Role::create(['name' => 'reseller', 'description' => 'Đại lý, có toàn quyền trên website con của mình.', 'guard_name' => 'api']);
        $resellerRole->givePermissionTo(Permission::all());
        $this->command->info('Role "reseller" đã được tạo.');

        // Cấp 3: Trưởng các bộ phận (Managers)
        $salesManagerRole = Role::create(['name' => 'sales_manager', 'description' => 'Trưởng phòng Kinh doanh', 'guard_name' => 'api']);
        $salesManagerRole->givePermissionTo([
            'users.view', 'users.view-team-members', 'users.assign-task',
            'products.view',
            'orders.view-all', 'orders.create', 'orders.edit', 'orders.delete', 'orders.update-status', 'orders.manage-refunds', 'orders.manage-customers',
            'reports.view-sales', 'reports.view-team-performance'
        ]);
        $this->command->info('Role "sales_manager" đã được tạo.');

        $supportManagerRole = Role::create(['name' => 'support_manager', 'description' => 'Trưởng phòng Hỗ trợ khách hàng', 'guard_name' => 'api']);
        $supportManagerRole->givePermissionTo([
            'users.view-team-members', 'users.assign-task',
            'tickets.view-all', 'tickets.create', 'tickets.reply', 'tickets.assign', 'tickets.manage-status', 'tickets.delete',
            'knowledgebase.manage', 'chat.access-livechat', 'reports.view-support'
        ]);
        $this->command->info('Role "support_manager" đã được tạo.');

        // Cấp 4: Nhân viên các bộ phận (Staff)
        $salesStaffRole = Role::create(['name' => 'sales_staff', 'description' => 'Nhân viên Kinh doanh', 'guard_name' => 'api']);
        $salesStaffRole->givePermissionTo(['products.view', 'orders.view-own', 'orders.create', 'orders.edit', 'orders.update-status', 'orders.manage-customers']);
        $this->command->info('Role "sales_staff" đã được tạo.');

        $supportStaffRole = Role::create(['name' => 'support_staff', 'description' => 'Nhân viên Hỗ trợ khách hàng', 'guard_name' => 'api']);
        $supportStaffRole->givePermissionTo(['tickets.view-own', 'tickets.create', 'tickets.reply', 'tickets.manage-status', 'chat.access-livechat']);
        $this->command->info('Role "support_staff" đã được tạo.');

        $accountantRole = Role::create(['name' => 'accountant', 'description' => 'Nhân viên Kế toán', 'guard_name' => 'api']);
        $accountantRole->givePermissionTo(Permission::where('group_name', 'Quản lý Tài chính & Kế toán')->where('name', '!=', 'finance.manage-payroll')->get());
        $this->command->info('Role "accountant" đã được tạo.');

        $contentCreatorRole = Role::create(['name' => 'content_creator', 'description' => 'Nhân viên Nội dung/Marketing', 'guard_name' => 'api']);
        $contentCreatorRole->givePermissionTo(Permission::where('group_name', 'Quản lý Marketing & Nội dung')->get());
        $this->command->info('Role "content_creator" đã được tạo.');

        // Cấp 5: Các vai trò cơ bản khác
        Role::create(['name' => 'user', 'description' => 'Người dùng thông thường của website.', 'guard_name' => 'api']);
        $this->command->info('Role "user" đã được tạo.');

        $partnerRole = Role::create(['name' => 'partner', 'description' => 'Đối tác, chỉ có quyền quản lý sản phẩm của riêng họ.', 'guard_name' => 'api']);
        $partnerRole->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete']);
        $this->command->info('Role "partner" đã được tạo.');


        // === PHẦN 4: TẠO DỮ LIỆU MẪU (WEBS, USERS, WALLETS) ===
        $this->command->info('Bắt đầu tạo dữ liệu mẫu (Webs, Users, Wallets)...');

        // Tạo web
        $mainWeb = Web::create([
            'subdomain' => 'main-site', 'user_id' => null, 'api_key' => "D9BD170B6093FF737C754C8A5070FC97", 'status' => 1, 'is_customized' => true,
        ]);
        $resellerWeb = Web::create([
            'subdomain' => 'reseller-site-' . Str::random(5), 'user_id' => null, 'api_key' => $this->generateCode(32), 'status' => 1, 'is_customized' => false,
        ]);
        $this->command->info('Đã tạo 2 web mẫu.');

        // Tạo các tài khoản mẫu với vai trò tương ứng
        $superAdminUser = User::create(['username' => 'admin', 'email' => 'superadmin@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000001','donate_code'=>$this->generateCode(16)]);
        $superAdminUser->assignRole('admin');
        Wallet::create(["user_id" => $superAdminUser->id, "balance" => "999999999", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Super Admin.');

        $resellerUser = User::create(['username' => 'reseller', 'email' => 'reseller@app.com', 'password' => Hash::make('password'), 'web_id' => $resellerWeb->id, 'status' => 1, 'phone' => '0900000002','donate_code'=>$this->generateCode(16)]);
        $resellerUser->assignRole('reseller');
        Wallet::create(["user_id" => $resellerUser->id, "balance" => "10000000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Reseller.');

        $salesManagerUser = User::create(['username' => 'salesmanager', 'email' => 'salesmanager@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000003','donate_code'=>$this->generateCode(16)]);
        $salesManagerUser->assignRole('sales_manager');
        Wallet::create(["user_id" => $salesManagerUser->id, "balance" => "1000000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Sales Manager.');
        
        $salesStaffUser = User::create(['username' => 'salestaff', 'email' => 'salestaff@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000004','donate_code'=>$this->generateCode(16)]);
        $salesStaffUser->assignRole('sales_staff');
        Wallet::create(["user_id" => $salesStaffUser->id, "balance" => "1000000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Sales Staff.');

        $basicUser = User::create(['username' => 'userHai', 'email' => 'basicuser@app.com', 'password' => Hash::make('password'), 'web_id' => $mainWeb->id, 'status' => 1, 'phone' => '0900000005','donate_code'=>$this->generateCode(16)]);
        $basicUser->assignRole('user');
        Wallet::create(["user_id" => $basicUser->id, "balance" => "50000", "currency" => "VND"]);
        $this->command->info('Đã tạo tài khoản Basic User.');

        // Cập nhật lại user_id cho các web
        $mainWeb->user_id = $superAdminUser->id;
        $mainWeb->save();
        $resellerWeb->user_id = $resellerUser->id;
        $resellerWeb->save();
        $this->command->info('Đã cập nhật chủ sở hữu cho các web.');
        
        $this->command->info('Hoàn tất Seeder!');
    }
}
