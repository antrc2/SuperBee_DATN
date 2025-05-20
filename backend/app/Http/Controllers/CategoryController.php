<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            // $query = $request->input('query', '');
            // $perPage = $request->input('per_page', 10);

            $categories = Category::all();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách danh mục thành công',
                'data' => $categories
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'image_url' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ hoặc thiếu thông tin',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Kiểm tra tên danh mục đã tồn tại chưa
            $existingCategory = Category::where('name', $request->name)->first();
            if ($existingCategory) {
                return response()->json([
                    'status' => false,
                    'message' => 'Danh mục đã tồn tại'
                ], 409);
            }

            $category = Category::create([
                'name' => $request->name,
                'image_url' => $request->image_url,
                'status' => 1,
                'created_by' => $request->user_id,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Tạo danh mục thành công',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tạo danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Lấy thông tin danh mục thành công',
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy thông tin danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'image_url' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ hoặc thiếu thông tin',
                    'errors' => $validator->errors()
                ], 400);
            }

            if ($request->name !== $category->name) {
                $existingCategory = Category::where('name', $request->name)
                    ->where('id', '!=', $category->id)
                    ->first();

                if ($existingCategory) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Tài nguyên đã tồn tại'
                    ], 409);
                }
            }

            $updateData = [
                'name' => $request->name,
                'updated_by' => $request->user_id,
            ];

            if ($request->has('image_url') && $request->image_url !== null && $request->image_url !== '') {
                $updateData['image_url'] = $request->image_url;
            }
            if ($request->filled('status')) {
                $updateData['status'] = $request->status;
            }

            $category->update($updateData);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật danh mục thành công',
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            if ($category->products()->exists()) {
                $category->update([
                    'status' => 0,
                    'updated_by' => $request->user_id
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Đã xóa mềm danh mục thành công'
                ]);
            } else {
                $category->delete();

                return response()->json([
                    'status' => true,
                    'message' => 'Đã xóa cứng danh mục thành công'
                ]);
            }
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi xóa danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Thiếu phần patch (khôi phục xóa mềm)
}
