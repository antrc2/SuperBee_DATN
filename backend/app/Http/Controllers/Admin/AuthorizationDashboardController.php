<?php

// FILE: app/Http/Controllers/Admin/AuthorizationDashboardController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;


class AuthorizationDashboardController extends Controller
{
    public function index()
    {
        try {
            $roleCount = Role::where('guard_name', 'api')->count();
            $permissionCount = Permission::where('guard_name', 'api')->count();

            // Lấy các user có vai trò không phải là 'user' cơ bản, hoặc có quyền trực tiếp
            // [THAY ĐỔI] Loại bỏ các tài khoản có vai trò 'admin-super' và 'admin' khỏi danh sách này
            $powerUsers = User::whereHas('roles', function ($query) {
                $query->whereNotIn('name', ['user', 'admin-super', 'admin']); 
            })
            ->orWhereHas('permissions')
            // Thêm một điều kiện whereDoesntHave để chắc chắn loại bỏ admin và superadmin ngay cả khi họ có quyền trực tiếp
            ->whereDoesntHave('roles', function ($query) {
                $query->whereIn('name', ['admin-super', 'admin']);
            })
            ->with('roles:id,name,description')
            ->select('id', 'username', 'email', 'avatar_url')
            ->orderBy('id')
            ->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'stats' => [
                        'role_count' => $roleCount,
                        'permission_count' => $permissionCount,
                        'power_user_count' => $powerUsers->count(),
                    ],
                    'power_users' => $powerUsers,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi tải dữ liệu tổng quan.'], 500);
        }
    }

    public function getUserDetails($id)
    {
        try {
            $user = User::findOrFail($id);
            $allRoles = Role::where('guard_name', 'api')->select('id', 'name', 'description')->get();
            
            // Lọc bỏ nhóm quyền 'Quản lý Phân quyền' khi lấy danh sách để gán trực tiếp.
            $allPermissions = Permission::where('guard_name', 'api')
                ->where('group_name', '!=', 'Quản lý Phân quyền')
                ->orderBy('group_name')->get()->groupBy('group_name');
            
            return response()->json([
                'status' => true,
                'data' => [
                    'user' => $user->only(['id', 'username', 'email', 'avatar_url']),
                    'assigned_roles' => $user->getRoleNames(),
                    'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
                    'all_user_permissions' => $user->getAllPermissions()->pluck('name'),
                    'all_system_roles' => $allRoles,
                    'all_system_permissions' => $allPermissions,
                ]
            ]);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        }
    }

    // syncRoles không còn được sử dụng từ giao diện mới nhưng giữ lại để có thể dùng qua API nếu cần
    public function syncRoles(Request $request, $id)
    {
        // ... (Giữ nguyên logic cũ)
    }

    public function syncDirectPermissions(Request $request, $id)
    {
        try {
            $actingUser = $request->user();
            $targetUser = User::findOrFail($id);

            // [THAY ĐỔI] Thêm logic validation phân cấp
            // 1. Không ai được phép chỉnh sửa superadmin
            if ($targetUser->hasRole('admin-super')) {
                return response()->json(['status' => false, 'message' => 'Không thể chỉnh sửa quyền của Quản trị viên tối cao.'], 403);
            }

            // 2. Admin không được phép chỉnh sửa admin khác
            if ($actingUser->hasRole('admin') && $targetUser->hasRole('admin')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền chỉnh sửa tài khoản Quản trị viên khác.'], 403);
            }

            $validatedData = $request->validate([
                'permissions' => 'present|array',
                'mode' => 'required|string|in:sync,add' // 'sync' = gán lại, 'add' = bổ sung
            ]);
            
            $requestedPermissions = $validatedData['permissions'];
            $mode = $validatedData['mode'];

            // Logic bảo mật: Không thể gán quyền mà người thực hiện không có
            if (!$actingUser->hasRole('admin-super') && !$actingUser->hasAllPermissions($requestedPermissions)) {
                return response()->json(['status' => false, 'message' => 'Không thể gán quyền mà bạn không sở hữu.'], 403);
            }

            // [THAY ĐỔI] Xử lý 2 chế độ gán quyền
            if ($mode === 'add') {
                // Chế độ "Bổ sung": chỉ thêm quyền mới
                $targetUser->givePermissionTo($requestedPermissions);
                $message = 'Bổ sung quyền trực tiếp thành công!';
            } else {
                // Chế độ "Gán lại": xóa hết quyền cũ và gán lại từ đầu
                $targetUser->syncPermissions($requestedPermissions);
                $message = 'Cập nhật (gán lại) quyền trực tiếp thành công!';
            }

            return response()->json(['status' => true, 'message' => $message]);

        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }
}
