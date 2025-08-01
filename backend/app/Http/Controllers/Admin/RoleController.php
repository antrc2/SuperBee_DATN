<?php

// FILE: app/Http/Controllers/Admin/RoleController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoleController extends Controller
{
    /**
     * @var string[]
     * Danh sách các vai trò được bảo vệ, không thể sửa/xóa.
     */
    protected $protectedRoles = ['admin', 'super-admin'];

    public function index()
    {
        try {
            $roles = Role::with('permissions:id,name,description')
                ->where('guard_name', 'api')
                ->select('id', 'name', 'description', 'created_at')
                ->get();
            return response()->json(['status' => true, 'data' => $roles]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi lấy danh sách vai trò.'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|unique:roles,name,NULL,id,guard_name,api|max:100',
                'description' => 'nullable|string|max:255',
            ]);

            $role = Role::create(['name' => $validatedData['name'], 'description' => $validatedData['description'] ?? null, 'guard_name' => 'api']);
            return response()->json(['status' => true, 'message' => 'Tạo vai trò mới thành công.', 'data' => $role], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            // Logic bảo vệ vai trò
            if (in_array($role->name, $this->protectedRoles)) {
                return response()->json(['status' => false, 'message' => 'Không thể chỉnh sửa vai trò hệ thống.'], 403);
            }

            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:100', Rule::unique('roles')->ignore($role->id)],
                'description' => 'nullable|string|max:255',
            ]);

            $role->update($validatedData);
            return response()->json(['status' => true, 'message' => 'Cập nhật vai trò thành công.', 'data' => $role]);
        } catch (ModelNotFoundException) {
             return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            
            // Logic bảo vệ vai trò
            if (in_array($role->name, $this->protectedRoles)) {
                return response()->json(['status' => false, 'message' => 'Không thể xóa vai trò hệ thống.'], 403);
            }

            if ($role->users()->count() > 0) {
                return response()->json(['status' => false, 'message' => 'Không thể xóa vai trò đang được gán cho người dùng.'], 400);
            }

            $role->delete();
            return response()->json(['status' => true, 'message' => 'Xóa vai trò thành công.']);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        }
    }

    public function assignPermissions(Request $request, $id)
    {
        try {
            $actingUser = $request->user();
            $role = Role::findOrFail($id);
            $permissions = $request->validate(['permissions' => 'present|array'])['permissions'];

            // Logic bảo mật: người gán quyền cho vai trò phải sở hữu các quyền đó
            if (!$actingUser->hasAllPermissions($permissions)) {
                return response()->json(['status' => false, 'message' => 'Không thể gán quyền mà bạn không sở hữu cho một vai trò.'], 403);
            }

            $role->syncPermissions($permissions);
            return response()->json(['status' => true, 'message' => 'Cập nhật quyền cho vai trò thành công.', 'data' => $role->load('permissions:id,name')]);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }
}