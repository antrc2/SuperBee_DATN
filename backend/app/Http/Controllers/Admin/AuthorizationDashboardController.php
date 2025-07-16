<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AuthorizationDashboardController extends Controller
{
    /**
     * Lấy dữ liệu tổng quan cho dashboard phân quyền.
     */
    public function index()
    {
        try {
            $roleCount = Role::where('guard_name', 'api')->count();
            $permissionCount = Permission::where('guard_name', 'api')->count();

            $powerUsers = User::whereHas('roles', function ($query) {
                $query->where('name', '!=', 'basic_user'); // Giả sử vai trò cơ bản là 'basic_user'
            })
            ->orWhereHas('permissions') // Hoặc có quyền trực tiếp
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
            return response()->json(['status' => false, 'message' => 'Lỗi khi tải dữ liệu tổng quan.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy thông tin chi tiết của một người dùng để quản lý.
     */
    public function getUserDetails($id)
    {
        try {
            $user = User::findOrFail($id);

            $allRoles = Role::where('guard_name', 'api')->select('id', 'name', 'description')->get();
            $allPermissions = Permission::where('guard_name', 'api')->orderBy('group_name')->get()->groupBy('group_name');
            $allUserPermissions = $user->getAllPermissions()->pluck('name');

            return response()->json([
                'status' => true,
                'data' => [
                    'user' => $user->only(['id', 'username', 'email', 'avatar_url']),
                    'assigned_roles' => $user->getRoleNames(),
                    'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
                    'all_user_permissions' => $allUserPermissions,
                    'all_system_roles' => $allRoles,
                    'all_system_permissions' => $allPermissions,
                ]
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi tải chi tiết người dùng.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Đồng bộ hóa vai trò cho người dùng.
     */
    public function syncRoles(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $validated = $request->validate([
                'roles' => 'present|array',
                'roles.*' => 'string|exists:roles,name,guard_name,api',
            ]);

            $user->syncRoles($validated['roles']);

            return response()->json(['status' => true, 'message' => 'Cập nhật vai trò thành công!']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi cập nhật vai trò.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Đồng bộ hóa các quyền trực tiếp cho người dùng.
     */
    public function syncDirectPermissions(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $validated = $request->validate([
                'permissions' => 'present|array',
                'permissions.*' => 'string|exists:permissions,name,guard_name,api',
            ]);

            $user->syncPermissions($validated['permissions']);

            return response()->json(['status' => true, 'message' => 'Cập nhật quyền trực tiếp thành công!']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy người dùng.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi cập nhật quyền.', 'error' => $e->getMessage()], 500);
        }
    }
}
