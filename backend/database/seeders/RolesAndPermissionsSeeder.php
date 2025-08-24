<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\AgentAssignment;
use App\Models\Business_setting;
use App\Models\Employee;
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
     * Hàm tiện ích để tạo mã ngẫu nhiên.
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
     * Chạy seeder để khởi tạo dữ liệu cho CSDL.
     *
     * @return void
     */
    public function run(): void
    {
        // =========================================================================
        // PHẦN 1: DỌN DẸP VÀ CHUẨN BỊ CƠ SỞ DỮ LIỆU
        // Mục đích: Xóa toàn bộ dữ liệu cũ để đảm bảo một môi trường sạch sẽ,
        // tránh xung đột dữ liệu khi chạy lại seeder.
        // =========================================================================
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Permission::truncate();
        Role::truncate();
        Web::truncate();
        User::truncate();
        Wallet::truncate();
        Employee::truncate();
        Agent::truncate();
        AgentAssignment::truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $this->command->info('Đã xóa dữ liệu cũ trong các bảng liên quan.');

        // =========================================================================
        // PHẦN 2: ĐỊNH NGHĨA VÀ TẠO TẤT CẢ CÁC QUYỀN HẠN (PERMISSIONS)
        // Mục đích: Xây dựng danh sách tất cả các hành động chi tiết mà một
        // người dùng có thể thực hiện trong hệ thống. Đây là nền tảng của
        // hệ thống phân quyền.
        // =========================================================================
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
                'employees.view' => 'Xem danh sách nhân viên',
                'employees.create' => 'Tạo nhân viên mới',
                'employees.edit' => 'Sửa thông tin nhân viên',
                'employees.delete' => 'Vô hiệu hóa nhân viên',
                'profile.view_own' => 'Xem hồ sơ cá nhân',
                'profile.edit_own' => 'Sửa hồ sơ cá nhân',
            ],
            // ... (Các nhóm quyền khác giữ nguyên)
            'Quản lý Web con' => [
                'webs.view' => 'Xem danh sách web con',
                'webs.create' => 'Tạo web con',
                'webs.edit' => 'Sửa web con',
                'webs.delete' => 'Xóa web con',
                'business_settings.view' => 'Xem cài đặt web',
                'business_settings.edit' => 'Sửa cài đặt web',
            ],
            'Quản lý Danh mục' => [
                'categories.view' => 'Xem danh mục sản phẩm',
                'categories.create' => 'Tạo danh mục sản phẩm',
                'categories.edit' => 'Sửa danh mục sản phẩm',
                'categories.delete' => 'Xóa danh mục sản phẩm',
                'post_categories.view' => 'Xem danh mục bài viết',
                'post_categories.create' => 'Tạo danh mục bài viết',
                'post_categories.edit' => 'Sửa danh mục bài viết',
                'post_categories.delete' => 'Xóa danh mục bài viết',
            ],
            'Quản lý Sản phẩm' => [
                'products.view' => 'Xem sản phẩm',
                'products.create' => 'Tạo sản phẩm',
                'products.edit' => 'Sửa sản phẩm',
                'products.delete' => 'Xóa sản phẩm',
                'products.approve' => 'Duyệt/Từ chối sản phẩm',
            ],
            'Quản lý Đơn hàng' => [
                'orders.view' => 'Xem đơn hàng',
                'orders.create' => 'Tạo đơn hàng',
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

        // =========================================================================
        // PHẦN 3: TẠO CÁC VAI TRÒ (ROLES) VÀ GÁN QUYỀN
        // Mục đích: Nhóm các quyền hạn đã tạo thành các vai trò cụ thể,
        // tương ứng với các nhóm người dùng trong thực tế (Admin, Nhân viên, Khách hàng).
        // =========================================================================
        $this->command->info('Bắt đầu tạo Roles và gán Permissions...');

        // Cấp 1: Super Admin (Toàn quyền)
        $roleSuperAdmin = Role::create(['name' => 'admin-super', 'description' => 'Quản trị viên tối cao, có mọi quyền hạn.', 'guard_name' => 'api']);
        $roleSuperAdmin->givePermissionTo(Permission::all());

        // Cấp 2: Admin (Quản lý vận hành)
        $roleAdmin = Role::create(['name' => 'admin', 'description' => 'Quản lý cấp cao, có quyền quản lý nhân viên và vai trò cấp dưới.', 'guard_name' => 'api']);
        $roleAdmin->givePermissionTo(Permission::all());
        
        // Định nghĩa các quyền cơ bản của người dùng
        $userPermissions = [
            'profile.view_own', 'profile.edit_own', 'orders.create', 'orders.view', 'wallet.view', 'recharges.create', 'withdrawals.create', 'withdrawals.view', 'transactions.view', 'comments.create', 'reviews.create', 'product_reports.create', 'promotions.view', 'donate_promotions.view', 'chat.create','chat.view',
        ];

        // Cấp 3: Reseller (Đại lý)
        $roleReseller = Role::create(['name' => 'reseller', 'description' => 'Đại lý (bao gồm quyền người dùng).', 'guard_name' => 'api']);
        $resellerPermissions = array_unique(array_merge($userPermissions, [ 'users.view', 'users.create', 'categories.view', 'categories.create', 'categories.edit', 'categories.delete', 'products.view', 'products.create', 'products.edit', 'products.delete', 'products.approve', 'business_settings.view', 'business_settings.edit', 'banners.view', 'banners.create', 'banners.edit', 'banners.delete', 'promotions.create', 'promotions.edit', 'promotions.delete', 'donate_promotions.create', 'donate_promotions.edit', 'donate_promotions.delete', 'reports.view', ]));
        $roleReseller->givePermissionTo($resellerPermissions);

        // Cấp 4: Partner (Đối tác)
        $rolePartner = Role::create(['name' => 'partner', 'description' => 'Đối tác (bao gồm quyền người dùng).', 'guard_name' => 'api']);
        $partnerPermissions = array_unique(array_merge($userPermissions, [ 'products.view', 'products.create', 'products.edit', 'products.delete', 'product_reports.view', 'reports.view', ]));
        $rolePartner->givePermissionTo($partnerPermissions);

        // Cấp 5: User (Người dùng)
        $roleUser = Role::create(['name' => 'user', 'description' => 'Người dùng/khách hàng thông thường.', 'guard_name' => 'api']);
        $roleUser->givePermissionTo($userPermissions);

        // --- Nhóm vai trò nhân viên ---
        $roleKeToan = Role::create(['name' => 'ke-toan', 'description' => 'Nhân viên tài chính, duyệt giao dịch.', 'guard_name' => 'api']);
        $roleKeToan->givePermissionTo([ 'recharges.view', 'recharges.edit', 'withdrawals.view', 'withdrawals.edit', 'transactions.view', 'reports.view', 'wallet.view', "chat.view" ]);
        
        // Vai trò Nhân viên Hỗ trợ - vai trò quan trọng cho logic Agent
        $roleHoTro = Role::create(['name' => 'nv-ho-tro', 'description' => 'Nhân viên hỗ trợ, tư vấn khách hàng.', 'guard_name' => 'api']);
        $roleHoTro->givePermissionTo([ 'chat.view', 'chat.create', 'chat.edit', 'users.view', 'orders.view', 'products.view', 'transactions.view', 'product_reports.view', 'product_reports.edit', 'wallet.view', 'promotions.view', 'donate_promotions.view', ]);
        
        $roleMarketing = Role::create(['name' => 'nv-marketing', 'description' => 'Nhân viên marketing và nội dung.', 'guard_name' => 'api']);
        $roleMarketing->givePermissionTo([ 'posts.view', 'posts.create', 'posts.edit', 'posts.delete', 'post_categories.view', 'post_categories.create', 'post_categories.edit', 'post_categories.delete', 'comments.view', 'comments.edit', 'comments.delete', 'promotions.view', 'promotions.create', 'promotions.edit', 'promotions.delete', 'donate_promotions.view', 'donate_promotions.create', 'donate_promotions.edit', 'donate_promotions.delete', 'banners.view', 'banners.create', 'banners.edit', 'banners.delete', 'wallet.view', 'chat.view' ]);
        
        $roleStaffBase = Role::create(['name' => 'staff-nhan-vien', 'description' => 'Nhân viên cơ bản với quyền tùy chỉnh.', 'guard_name' => 'api']);
        $this->command->info('Đã tạo và gán quyền cho tất cả các Roles.');

   // =========================================================================
        // PHẦN 4: TẠO DỮ LIỆU MẪU
        // =========================================================================
        $this->command->info('Bắt đầu tạo dữ liệu mẫu...');
        $mainWeb = Web::create(['subdomain' => 'main-site', 'api_key' => 'D9BD170B6093FF737C754C8A5070FC97', 'status' => 1]);
        $this->command->info('Đã tạo web mẫu.');
        
        // === THÊM MỚI: TẠO CÁC VỊ TRÍ AGENT MẪU (SLOTS) ===
        $this->command->info('Bắt đầu tạo các vị trí Agent mẫu...');
        DB::table('agents')->insert([
            ['display_name' => 'Hỗ trợ viên 1', 'type' => 'support', 'web_id' => $mainWeb->id, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['display_name' => 'Hỗ trợ viên 2', 'type' => 'support', 'web_id' => $mainWeb->id, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['display_name' => 'Hỗ trợ viên 3', 'type' => 'support', 'web_id' => $mainWeb->id, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['display_name' => 'Nhân viên xử lý khiếu nại 1', 'type' => 'complaint', 'web_id' => $mainWeb->id, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['display_name' => 'Nhân viên xử lý khiếu nại 2', 'type' => 'complaint', 'web_id' => $mainWeb->id, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);
        $this->command->info('Đã tạo 5 vị trí Agent mẫu.');

        // Danh sách người dùng mẫu cần tạo
        $userList = [
            ['username' => 'superadmin', 'role' => 'admin-super', 'is_employee' => false],
            ['username' => 'admin', 'role' => 'admin', 'is_employee' => false],
            ['username' => 'reseller', 'role' => 'reseller', 'is_employee' => false],
            ['username' => 'partner', 'role' => 'partner', 'is_employee' => false],
            ['username' => 'user', 'role' => 'user', 'is_employee' => false],
            ['username' => 'ketoan', 'role' => 'ke-toan', 'is_employee' => true, 'job_title' => 'Kế toán viên', 'department' => 'Tài chính'],
            ['username' => 'hotro', 'role' => 'nv-ho-tro', 'is_employee' => true, 'job_title' => 'Nhân viên Hỗ trợ', 'department' => 'Chăm sóc Khách hàng'],
            ['username' => 'khieunai', 'role' => 'nv-ho-tro', 'is_employee' => true, 'job_title' => 'Chuyên viên Khiếu nại', 'department' => 'Chăm sóc Khách hàng'],
            ['username' => 'marketing', 'role' => 'nv-marketing', 'is_employee' => true, 'job_title' => 'Nhân viên Marketing', 'department' => 'Marketing'],
        ];

        $createdUsers = [];

        // Vòng lặp để tạo các tài khoản người dùng và dữ liệu liên quan.
        foreach ($userList as $userData) {
            $user = User::create([
                'username' => $userData['username'],
                'email' => $userData['username'] . "@superbee.site",
                'password' => Hash::make('password'),
                'web_id' => $mainWeb->id,
                'status' => 1,
                'phone' => '090000000' . (count(User::all())),
                'donate_code' => $this->generateCode(16),
            ]);

            $user->assignRole($userData['role']);
            Wallet::create([ "user_id" => $user->id, "balance" => "1000000", "currency" => "VND" ]);
            $createdUsers[$userData['username']] = $user;

            if ($userData['is_employee']) {
                Employee::create([
                    'user_id' => $user->id,
                    'employee_code' => 'NV' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'job_title' => $userData['job_title'],
                    'department' => $userData['department'],
                    'start_date' => now()->subDays(rand(10, 300))->toDateString(),
                    'status' => 'active',
                ]);
                $this->command->info("Đã tạo nhân viên: {$userData['username']}");
                // === XÓA BỎ LOGIC CŨ TẠI ĐÂY ===
            } else {
                $this->command->info("Đã tạo tài khoản: {$userData['username']} với vai trò: {$userData['role']}");
            }
        }
        
        // Gán web chính cho superadmin
        $superAdminUser = $createdUsers['superadmin'];
        if ($superAdminUser) {
            $mainWeb->user_id = $superAdminUser->id;
            $mainWeb->save();
        }
        $this->command->info('Đã cập nhật chủ sở hữu cho web chính.');
        
        // === THÊM MỚI: TỰ ĐỘNG GÁN NHÂN VIÊN MẪU VÀO VỊ TRÍ TRỐNG ===
        $this->command->info('Bắt đầu gán nhân viên mẫu vào vị trí...');
        $hotroUser = $createdUsers['hotro'] ?? null;
        $khieunaiUser = $createdUsers['khieunai'] ?? null;

        // Tìm vị trí support đầu tiên còn trống
        $firstSupportAgent = DB::table('agents')->where('type', 'support')->whereNotIn('id', function($query) {
            $query->select('agent_id')->from('agent_assignments');
        })->orderBy('id')->first();

        // Tìm vị trí complaint đầu tiên còn trống
        $firstComplaintAgent = DB::table('agents')->where('type', 'complaint')->whereNotIn('id', function($query) {
            $query->select('agent_id')->from('agent_assignments');
        })->orderBy('id')->first();

        if ($hotroUser && $firstSupportAgent) {
            DB::table('agent_assignments')->insert([
                'agent_id' => $firstSupportAgent->id,
                'user_id' => $hotroUser->id,
                'assigned_at' => now(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->command->info("Đã gán nhân viên 'hotro' vào vị trí: " . $firstSupportAgent->display_name);
        }

        if ($khieunaiUser && $firstComplaintAgent) {
            DB::table('agent_assignments')->insert([
                'agent_id' => $firstComplaintAgent->id,
                'user_id' => $khieunaiUser->id,
                'assigned_at' => now(), 'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->command->info("Đã gán nhân viên 'khieunai' vào vị trí: " . $firstComplaintAgent->display_name);
        }

        // --- TẠO BUSINESS SETTINGS ---
        // ... (Giữ nguyên phần tạo business settings)
        $shopname = "SuperBee";
        Business_setting::create(
            [
                "web_id"=>$mainWeb->id,
                "shop_name"=>$shopname,
                "slogan"=>"{$shopname} – Nơi mua bán tài khoản game Liên Quân, Free Fire, Roblox… chất lượng Premium, giá tốt nhất, bảo hành 24h và hỗ trợ 24/7 qua Zalo/Facebook. Giao dịch an toàn, nhận nick ngay!",
                "logo_url"=>"https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/SuperBee-nobackground.png",
                "favicon_url"=>"https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/SuperBee.png",
                "phone_number"=>"(+84) 838 411 897",
                "email"=>"support@superbee.site",
                "address"=>"Thôn Vĩnh Ninh - Xã Đại Thanh - Thành phố Hà Nội",
                "zalo_link"=> "",
                "facebook_link"=>"https://www.facebook.com/superbee.site",
                "template_name"=>"default",
            ]
        );
        $this->command->info('Đã tạo Business Settings cho web chính.');
        $this->command->info('Hoàn tất Seeder!');
    }
}
