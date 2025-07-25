<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Web;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * A helper function to generate a random code.
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
     *
     * @return void
     */
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
            'Quản lý Phân quyền' => [
                'roles.view' => 'Xem vai trò',
                'roles.create' => 'Tạo vai trò',
                'roles.edit' => 'Sửa vai trò',
                'roles.delete' => 'Xóa vai trò',
                'permissions.view' => 'Xem quyền hạn',
            ],
            'Quản lý Người dùng' => [
                'users.view' => 'Xem danh sách người dùng',
                'users.create' => 'Tạo người dùng mới',
                'users.edit' => 'Sửa thông tin người dùng',
                'users.delete' => 'Xóa người dùng',
                'profile.view_own' => 'Xem hồ sơ cá nhân',
                'profile.edit_own' => 'Sửa hồ sơ cá nhân',
                                'withdrawals.view' => 'Xem yêu cầu rút tiền',
                'withdrawals.create' => 'Tạo yêu cầu rút tiền',
            ],
            'Quản lý Web con' => [
                'webs.view' => 'Xem danh sách web con',
                'webs.create' => 'Tạo web con',
                'webs.edit' => 'Sửa web con',
                'webs.delete' => 'Xóa web con',
                'business_settings.view' => 'Xem cài đặt web',
                'business_settings.edit' => 'Sửa cài đặt web',
            ],
            'Quản lý Sản phẩm' => [
                'products.view' => 'Xem sản phẩm',
                'products.create' => 'Tạo sản phẩm',
                'products.edit' => 'Sửa sản phẩm',
                'products.delete' => 'Xóa sản phẩm',
            ],
            'Quản lý Đơn hàng' => [
                'orders.view' => 'Xem đơn hàng',
                'orders.create' => 'Tạo đơn hàng',
                'orders.edit' => 'Sửa đơn hàng',
                'orders.delete' => 'Xóa đơn hàng',
            ],
             'Quản lý Tài chính' => [
                'recharges.view' => 'Xem giao dịch nạp tiền',
                'recharges.create' => 'Tạo yêu cầu nạp tiền',
                'recharges.edit' => 'Duyệt/từ chối nạp tiền',
                'withdrawals.view' => 'Xem yêu cầu rút tiền',
                'withdrawals.create' => 'Tạo yêu cầu rút tiền',
                'withdrawals.edit' => 'Duyệt/từ chối rút tiền',
                'transactions.view' => 'Xem lịch sử giao dịch',
                'wallet.view' => 'Xem ví tiền',
            ],
            'Quản lý Nội dung' => [
                'posts.view' => 'Xem bài viết',
                'posts.create' => 'Tạo bài viết',
                'posts.edit' => 'Sửa bài viết',
                'posts.delete' => 'Xóa bài viết',
                'comments.view' => 'Xem bình luận',
                'comments.create' => 'Tạo bình luận',
                'comments.edit' => 'Sửa/duyệt bình luận',
                'comments.delete' => 'Xóa bình luận',
            ],
            'Quản lý Quảng bá' => [
                'banners.view' => 'Xem banner',
                'banners.create' => 'Tạo banner',
                'banners.edit' => 'Sửa banner',
                'banners.delete' => 'Xóa banner',
                'promotions.view' => 'Xem khuyến mãi sản phẩm',
                'promotions.create' => 'Tạo khuyến mãi sản phẩm',
                'promotions.edit' => 'Sửa khuyến mãi sản phẩm',
                'promotions.delete' => 'Xóa khuyến mãi sản phẩm',
                'donate_promotions.view' => 'Xem khuyến mãi nạp thẻ',      
                'donate_promotions.create' => 'Tạo khuyến mãi nạp thẻ',     
                'donate_promotions.edit' => 'Sửa khuyến mãi nạp thẻ',       
                'donate_promotions.delete' => 'Xóa khuyến mãi nạp thẻ',     
                'notifications.view' => 'Xem thông báo',
                'notifications.create' => 'Tạo thông báo',
                'notifications.edit' => 'Sửa thông báo',
                'notifications.delete' => 'Xóa thông báo',
            ],
            'Quản lý Tương tác' => [
                'reviews.create' => 'Tạo đánh giá',
                'reviews.view' => 'Xem đánh giá',
                'reviews.edit' => 'Duyệt/sửa đánh giá',
                'reviews.delete' => 'Xóa đánh giá',
                'product_reports.create' => 'Tạo khiếu nại sản phẩm',
                'product_reports.view' => 'Xem khiếu nại sản phẩm',
                'product_reports.edit' => 'Xử lý khiếu nại sản phẩm',
            ],
             'Hỗ trợ & Báo cáo' => [
                'chat.view' => 'Xem tin nhắn hỗ trợ',
                'chat.create' => 'Bắt đầu chat hỗ trợ',
                'chat.edit' => 'Trả lời/đóng chat',
                'reports.view' => 'Xem báo cáo',
             ],
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

        // Cấp 1: Admin Tổng (Toàn quyền)
        $roleAdminTong = Role::create(['name' => 'admin', 'description' => 'Quản trị viên tối cao, có mọi quyền hạn.', 'guard_name' => 'api']);
        $roleAdminTong->givePermissionTo(Permission::all());

        // Cấp 2: Admin Super (Quản lý cấp cao)
        $roleAdminSuper = Role::create(['name' => 'admin-super', 'description' => 'Quản lý cấp cao, có mọi quyền trừ phân quyền.', 'guard_name' => 'api']);
        $roleAdminSuper->givePermissionTo(Permission::where('group_name', '!=', 'Quản lý Phân quyền')->get());

        // Cấp 3: Reseller (Quản lý Web con)
        $roleReseller = Role::create(['name' => 'reseller', 'description' => 'Quản trị viên của một trang web con.', 'guard_name' => 'api']);
        $roleReseller->givePermissionTo([
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'orders.view', 'orders.edit',
            'business_settings.view', 'business_settings.edit',
            'banners.view', 'banners.create', 'banners.edit', 'banners.delete',
            'promotions.view', 'promotions.create', 'promotions.edit', 'promotions.delete',
            'donate_promotions.view', 'donate_promotions.create', 'donate_promotions.edit', 'donate_promotions.delete', // <-- BỔ SUNG
            'withdrawals.create', 'withdrawals.view',
            'reports.view',
        ]);

        // Cấp 4: Partner (Đối tác bán hàng)
        $rolePartner = Role::create(['name' => 'partner', 'description' => 'Đối tác bán hàng, chỉ quản lý sản phẩm của mình.', 'guard_name' => 'api']);
        $rolePartner->givePermissionTo([
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'withdrawals.create', 'withdrawals.view',
            'product_reports.view',"chat.view"
        ]);
        
        // Cấp 5: User (Người dùng)
        $roleUser = Role::create(['name' => 'user', 'description' => 'Người dùng/khách hàng thông thường.', 'guard_name' => 'api']);
        $roleUser->givePermissionTo([
            'profile.view_own', 'profile.edit_own',
            'orders.create', 'orders.view',
            'wallet.view', 'recharges.create', 'withdrawals.create', 'transactions.view',
            'comments.create', 'reviews.create', 'product_reports.create',
            'promotions.view', 'donate_promotions.view', // User có thể xem danh sách khuyến mãi
        ]);

        // --- Nhóm vai trò nhân viên ---

        // Kế toán
        $roleKeToan = Role::create(['name' => 'ke-toan', 'description' => 'Nhân viên tài chính, duyệt giao dịch.', 'guard_name' => 'api']);
        $roleKeToan->givePermissionTo([
            'recharges.view', 'recharges.edit',
            'withdrawals.view', 'withdrawals.edit',
            'transactions.view',
            'reports.view',"wallet.view","chat.view"
        ]);

        // Nhân viên Hỗ trợ
        $roleHoTro = Role::create(['name' => 'nv-ho-tro', 'description' => 'Nhân viên hỗ trợ, tư vấn khách hàng.', 'guard_name' => 'api']);
        $roleHoTro->givePermissionTo([
            'chat.view', 'chat.create', 'chat.edit',
            'users.view', 'orders.view', 'products.view', 'transactions.view',
            'product_reports.view', 'product_reports.edit',"wallet.view","chat.view",
            'promotions.view', 'donate_promotions.view', // <-- BỔ SUNG: để hỗ trợ khách
        ]);
        
        // Nhân viên Marketing
        $roleMarketing = Role::create(['name' => 'nv-marketing', 'description' => 'Nhân viên marketing và nội dung.', 'guard_name' => 'api']);
        $roleMarketing->givePermissionTo([
            'posts.view', 'posts.create', 'posts.edit', 'posts.delete',
            'comments.view', 'comments.edit', 'comments.delete',
            'promotions.view', 'promotions.create', 'promotions.edit', 'promotions.delete',
            'donate_promotions.view', 'donate_promotions.create', 'donate_promotions.edit', 'donate_promotions.delete', // <-- BỔ SUNG
            'banners.view', 'banners.create', 'banners.edit', 'banners.delete',
            'notifications.view', 'notifications.create', 'notifications.edit', 'notifications.delete',"wallet.view","chat.view"
        ]);

        $this->command->info('Đã tạo và gán quyền cho tất cả các Roles.');

        // === PHẦN 4: TẠO DỮ LIỆU MẪU (WEBS, USERS, WALLETS) ===
        $this->command->info('Bắt đầu tạo dữ liệu mẫu...');

        $mainWeb = Web::create(['subdomain' => 'main-site', 'api_key' => 'D9BD170B6093FF737C754C8A5070FC97', 'status' => 1]);
        $resellerWeb = Web::create(['subdomain' => 'reseller-site', 'api_key' => 'RESELLER-API-KEY-HERE', 'status' => 1]);
        $this->command->info('Đã tạo web mẫu.');

        $userList = [
            ['username' => 'admin', 'role' => 'admin', 'web_id' => $mainWeb->id],
            ['username' => 'adminsuper', 'role' => 'admin-super', 'web_id' => $mainWeb->id],
            ['username' => 'reseller', 'role' => 'reseller', 'web_id' => $resellerWeb->id],
            ['username' => 'partner', 'role' => 'partner', 'web_id' => $resellerWeb->id],
            ['username' => 'user', 'role' => 'user', 'web_id' => $resellerWeb->id],
            ['username' => 'ketoan', 'role' => 'ke-toan', 'web_id' => $mainWeb->id],
            ['username' => 'hotro', 'role' => 'nv-ho-tro', 'web_id' => $mainWeb->id],
            ['username' => 'marketing', 'role' => 'nv-marketing', 'web_id' => $mainWeb->id],
        ];

        foreach ($userList as $userData) {
            $user = User::create([
                'username' => $userData['username'],
                'email' => $userData['username'] . '@app.com',
                'password' => Hash::make('password'),
                'web_id' => $userData['web_id'],
                'status' => 1,
                'phone' => '090000000' . (count(User::all())),
                'donate_code' => $this->generateCode(16),
            ]);

            $user->assignRole($userData['role']);
            
            if (in_array($userData['role'], ['partner', 'reseller'])) {
                $user->assignRole('user');
            }

            Wallet::create([
                "user_id" => $user->id,
                "balance" => "1000000",
                "currency" => "VND"
            ]);

            $this->command->info("Đã tạo tài khoản: {$userData['username']} với vai trò: {$userData['role']}");
        }

        $adminUser = User::where('username', 'admintong')->first();
        if ($adminUser) {
            $mainWeb->user_id = $adminUser->id;
            $mainWeb->save();
        }
        $resellerUser = User::where('username', 'reseller')->first();
        if ($resellerUser) {
            $resellerWeb->user_id = $resellerUser->id;
            $resellerWeb->save();
        }
        $this->command->info('Đã cập nhật chủ sở hữu cho các web.');

        $this->command->info('Hoàn tất Seeder!');
    }
}