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
            $powerUsers = User::whereHas('roles', function ($query) {
                $query->whereNotIn('name', ['user']); 
            })
            ->orWhereHas('permissions') 
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
            $allPermissions = Permission::where('guard_name', 'api')->orderBy('group_name')->get()->groupBy('group_name');
            
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

    public function syncRoles(Request $request, $id)
    {
        try {
            $actingUser = $request->user();
            $targetUser = User::findOrFail($id);
            $requestedRoles = $request->validate(['roles' => 'present|array'])['roles'];

            // --- LOGIC BẢO MẬT ---
            // 1. Không ai được phép gán hoặc bỏ gán vai trò 'admin' cho tài khoản gốc (ID 1)
            if ($targetUser->id === 1 && !in_array('admin', $requestedRoles)) {
                 return response()->json(['status' => false, 'message' => 'Không thể bỏ vai trò "admin" của tài khoản gốc.'], 403);
            }
            if(in_array('admin', $requestedRoles) && $targetUser->id !== 1) {
                 return response()->json(['status' => false, 'message' => 'Không thể gán vai trò "admin" cho người dùng khác.'], 403);
            }

            // 2. Chỉ 'admin' tối cao mới được gán vai trò 'super-admin'
            if (in_array('super-admin', $requestedRoles) && !$actingUser->hasRole('admin')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền gán vai trò "super-admin".'], 403);
            }

            // 3. Người thực hiện không thể gán vai trò có quyền mà họ không có
            $permissionsFromRoles = Role::whereIn('name', $requestedRoles)->with('permissions')->get()
                ->pluck('permissions')->flatten()->pluck('name')->unique();
            
            if (!$actingUser->hasAllPermissions($permissionsFromRoles)) {
                 return response()->json(['status' => false, 'message' => 'Không thể gán vai trò có quyền cao hơn quyền của bạn.'], 403);
            }
            // --- KẾT THÚC LOGIC BẢO MẬT ---

            $targetUser->syncRoles($requestedRoles);
            return response()->json(['status' => true, 'message' => 'Cập nhật vai trò thành công!']);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        }
    }

    public function syncDirectPermissions(Request $request, $id)
    {
        try {
            $actingUser = $request->user();
            $targetUser = User::findOrFail($id);
            $requestedPermissions = $request->validate(['permissions' => 'present|array'])['permissions'];

            // --- LOGIC BẢO MẬT ---
            // 1. Không thể gán quyền mà người thực hiện không có
            if (!$actingUser->hasAllPermissions($requestedPermissions)) {
                return response()->json(['status' => false, 'message' => 'Không thể gán quyền mà bạn không sở hữu.'], 403);
            }
            // --- KẾT THÚC LOGIC BẢO MẬT ---

            $targetUser->syncPermissions($requestedPermissions);
            return response()->json(['status' => true, 'message' => 'Cập nhật quyền trực tiếp thành công!']);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        }
    }
}