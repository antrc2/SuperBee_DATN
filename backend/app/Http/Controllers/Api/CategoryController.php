<?php

namespace App\Http\Controllers\Api;

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
            $query = $request->input('query', '');
            $offset = (int) $request->input('offset', 0);
            $limit = (int) $request->input('limit', 10);

            $categories = Category::when($query, function ($q) use ($query) {
                return $q->where('name', 'like', "%{$query}%");
            })
                ->with(['createdBy', 'updatedBy'])
                ->skip($offset)
                ->take($limit)
                ->get();

            $total = Category::when($query, function ($q) use ($query) {
                return $q->where('name', 'like', "%{$query}%");
            })->count();

            return response()->json([
                'message' => 'Lấy danh sách danh mục thành công',
                'data' => $categories,
                'total' => $total,
                'offset' => $offset,
                'limit' => $limit
            ]);
        } catch (Exception $e) {
            return response()->json([
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
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $category = Category::create([
                'name' => $request->name,
                'image_url' => $request->image_url,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Tạo danh mục thành công',
                'data' => $category
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi tạo danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::with(['createdBy', 'updatedBy'])->findOrFail($id);
            return response()->json([
                'message' => 'Lấy thông tin danh mục thành công',
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục',
                'error' => $e->getMessage()
            ], 404);
        } catch (Exception $e) {
            return response()->json([
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
                'image_url' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $category->update([
                'name' => $request->name,
                'image_url' => $request->image_url,
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Cập nhật danh mục thành công',
                'data' => $category
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Không tìm thấy danh mục',
                'error' => $e->getMessage()
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật danh mục',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function partialUpdate(Request $request, $id)
    // {
    //     try {
    //         $category = Category::findOrFail($id);

    //         $validator = Validator::make($request->all(), [
    //             'name' => 'sometimes|required|string|max:255',
    //             'image_url' => 'sometimes|nullable|string|max:255',
    //             'status' => 'sometimes|required|integer|in:0,1'
    //         ]);

    //         if ($validator->fails()) {
    //             return response()->json(['errors' => $validator->errors()], 422);
    //         }

    //         $category->update(array_merge(
    //             $request->all(),
    //             ['updated_by' => Auth::id()]
    //         ));

    //         return response()->json([
    //             'message' => 'Cập nhật danh mục thành công',
    //             'data' => $category
    //         ]);
    //     } catch (ModelNotFoundException $e) {
    //         return response()->json([
    //             'status' => False,
    //             'message' => 'Không tìm thấy danh mục',
    //             'error' => $e->getMessage()
    //         ], 404);
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'message' => 'Có lỗi xảy ra khi cập nhật danh mục',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function destroy($id) {
        
    }
}
