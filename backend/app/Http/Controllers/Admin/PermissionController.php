<?php

// FILE: app/Http/Controllers/Admin/PermissionController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class PermissionController extends Controller
{
    public function index()
    {
        try {
            $permissions = Permission::where('guard_name', 'api')
                ->select('id', 'name', 'description', 'group_name')
                ->orderBy('group_name')->orderBy('name')->get();
            $groupedPermissions = $permissions->groupBy('group_name');
            return response()->json(['status' => true, 'message' => 'Lấy danh sách quyền thành công.', 'data' => $groupedPermissions]);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Lỗi khi lấy danh sách quyền.', 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|unique:permissions,name,NULL,id,guard_name,api|max:100',
                'description' => 'nullable|string|max:255',
                'group_name' => 'required|string|max:255',
            ]);

            $permission = Permission::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'group_name' => $validatedData['group_name'],
                'guard_name' => 'api'
            ]);
            return response()->json(['status' => true, 'message' => 'Tạo quyền mới thành công.', 'data' => $permission], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $permission = Permission::findOrFail($id);
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:100', Rule::unique('permissions')->ignore($permission->id)],
                'description' => 'nullable|string|max:255',
                'group_name' => 'required|string|max:255',
            ]);
            $permission->update($validatedData);
            return response()->json(['status' => true, 'message' => 'Cập nhật quyền thành công.', 'data' => $permission]);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quyền.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        try {
            $permission = Permission::findOrFail($id);
            if ($permission->roles()->count() > 0 || $permission->users()->count() > 0) {
                return response()->json(['status' => false, 'message' => 'Không thể xóa quyền đang được gán cho vai trò hoặc người dùng.'], 400);
            }
            $permission->delete();
            return response()->json(['status' => true, 'message' => 'Xóa quyền thành công.']);
        } catch (ModelNotFoundException) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quyền.'], 404);
        }
    }
}