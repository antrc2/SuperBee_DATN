<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            $offset = $request->input('offset', 0);

            $categories = Category::skip($offset)
                ->take($limit)
                ->get();

            $total = Category::count();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách danh mục thành công',
                'data' => $categories,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách danh mục',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'image_url' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ hoặc thiếu thông tin',
                    'errors' => $validator->errors()
                ], 400);
            }
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
                'updated_by' => $request->user_id
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
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'image_url' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 400);
            }

            $updateData = [
                'updated_by' => $request->user_id,
            ];

            if ($request->has('name') && $request->filled('name')) {
                $existingCategory = Category::where('name', $request->name)
                    ->where('id', '!=', $category->id)
                    ->first();

                if ($existingCategory) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Tên danh mục đã tồn tại'
                    ], 409);
                }
                $updateData['name'] = $request->name;
            }

            if ($request->has('image_url') && $request->filled('image_url')) {
                $updateData['image_url'] = $request->image_url;
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
            ], 500);
        }
    }

    public function updatePatch(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            if ($category->status === 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Danh mục đã được khôi phục trước đó'
                ], 400);
            }

            $category->update([
                'status' => 1,
                'updated_by' => $request->user_id
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Khôi phục danh mục thành công',
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
                'message' => 'Có lỗi xảy ra khi khôi phục danh mục',
            ], 500);
        }
    }
}
