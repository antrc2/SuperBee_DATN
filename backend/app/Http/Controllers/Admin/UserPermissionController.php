<?php

// app/Http/Controllers/Admin/UserPermissionController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserPermissionController extends Controller
{
    /**
     * Lấy danh sách người dùng và vai trò của họ.
     */
    public function index(Request $request)
    {
        // Chỉ lấy user của web mẹ. Giả sử web mẹ có web_id = 1
        // Bạn có thể thay đổi giá trị này hoặc lấy từ file .env
        $main_web_id = config('app.main_web_id', 1);

        $users = User::where('web_id', $main_web_id)
            ->with('roles:id,name')
            ->select('id', 'username', 'email', 'created_at')
            ->paginate(15);
            
        return response()->json($users);
    }

    /**
     * Lấy thông tin chi tiết của một người dùng, vai trò họ đang có,
     * và danh sách tất cả các vai trò có thể gán.
     */
    public function getUserRoles(User $user)
    {
        $userRoles = $user->getRoleNames();
        $allRoles = Role::where('guard_name', 'api')->pluck('name');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
            ],
            'assigned_roles' => $userRoles,
            'all_roles' => $allRoles,
        ]);
    }

    /**
     * Cập nhật (đồng bộ) vai trò cho một người dùng.
     */
    public function assignRolesToUser(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name,guard_name,api',
        ]);

        $user->syncRoles($request->roles);

        return response()->json([
            'message' => 'Cập nhật vai trò cho người dùng thành công.',
            'assigned_roles' => $user->getRoleNames(),
        ]);
    }
}