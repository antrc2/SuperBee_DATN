<?php

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
     * Lấy danh sách vai trò, kèm theo các quyền và mô tả của vai trò đó.
     */
    public function index()
    {
        try {
            // Lấy tất cả các cột, bao gồm cả cột 'description' mới
            $roles = Role::with('permissions:id,name,description')
                ->where('guard_name', 'api')
                ->select('id', 'name', 'description', 'created_at')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách vai trò thành công.',
                'data' => $roles
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy danh sách vai trò.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo một vai trò mới.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|unique:roles,name,NULL,id,guard_name,api',
                'description' => 'nullable|string|max:255',
            ]);

            $role = Role::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'] ?? null,
                'guard_name' => 'api'
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Tạo vai trò mới thành công.',
                'data' => $role
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi tạo vai trò.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thông tin chi tiết một vai trò.
     */
    public function show($id)
    {
        try {
            $role = Role::with('permissions:id,name')->findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Lấy thông tin vai trò thành công.',
                'data' => $role
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy vai trò.',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã có lỗi xảy ra.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật tên và mô tả vai trò.
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findOrFail($id);

            $validatedData = $request->validate([
                'name' => ['required', 'string', Rule::unique('roles')->ignore($role->id)],
                'description' => 'nullable|string|max:255',
            ]);

            $role->update($validatedData);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật vai trò thành công.',
                'data' => $role
            ]);
        } catch (ModelNotFoundException $e) {
             return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi cập nhật vai trò.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa một vai trò.
     */
    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);

            if ($role->users()->count() > 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa vai trò này vì đang có người dùng được gán.'
                ], 400);
            }

            $role->delete();

            return response()->json([
                'status' => true,
                'message' => 'Xóa vai trò thành công.'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi xóa vai trò.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Gán hoặc cập nhật danh sách quyền cho một vai trò.
     */
    public function assignPermissions(Request $request, $id)
    {
        try {
            $request->validate([
                'permissions' => 'present|array',
                'permissions.*' => 'string|exists:permissions,name,guard_name,api',
            ]);

            $role = Role::findOrFail($id);
            $role->syncPermissions($request->permissions);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật quyền cho vai trò thành công.',
                'data' => $role->load('permissions:id,name')
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy vai trò.'], 404);
        } catch (ValidationException $e) {
            return response()->json(['status' => false, 'message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã xảy ra lỗi khi gán quyền.', 'error' => $e->getMessage()], 500);
        }
    }
}
