<?php

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
    /**
     * Lấy danh sách tất cả các quyền, được gom nhóm.
     */
    public function index()
    {
        try {
            // Lấy tất cả các cột cần thiết
            $permissions = Permission::where('guard_name', 'api')
                ->select('id', 'name', 'description', 'group_name')
                ->orderBy('group_name')
                ->orderBy('name')
                ->get();

            // Gom nhóm các quyền dựa trên cột 'group_name'
            $groupedPermissions = $permissions->groupBy('group_name');

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách quyền thành công.',
                'data' => $groupedPermissions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy danh sách quyền.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo một quyền mới.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|unique:permissions,name,NULL,id,guard_name,api',
                'description' => 'nullable|string|max:255',
                'group_name' => 'required|string|max:255',
            ]);

            $permission = Permission::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'group_name' => $validatedData['group_name'],
                'guard_name' => 'api'
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Tạo quyền mới thành công.',
                'data' => $permission
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi tạo quyền.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật một quyền.
     */
    public function update(Request $request, $id)
    {
        try {
            $permission = Permission::findOrFail($id);

            $validatedData = $request->validate([
                'name' => ['required', 'string', Rule::unique('permissions')->ignore($permission->id)],
                'description' => 'nullable|string|max:255',
                'group_name' => 'required|string|max:255',
            ]);

            $permission->update($validatedData);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật quyền thành công.',
                'data' => $permission
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quyền.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi cập nhật quyền.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa một quyền.
     */
    public function destroy($id)
    {
        try {
            $permission = Permission::findOrFail($id);

            if ($permission->roles()->count() > 0 || $permission->users()->count() > 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa quyền này vì nó đang được gán cho vai trò hoặc người dùng.'
                ], 400);
            }

            $permission->delete();

            return response()->json([
                'status' => true,
                'message' => 'Xóa quyền thành công.'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy quyền.'], 404);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi xóa quyền.', 'error' => $e->getMessage()], 500);
        }
    }
}
