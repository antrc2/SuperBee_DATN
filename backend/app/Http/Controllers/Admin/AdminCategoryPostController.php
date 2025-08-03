<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categorypost;
use AWS\CRT\HTTP\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
class AdminCategoryPostController extends Controller
{



    // public function getCategoryPost()
    // {
    //     try {
    //         $categories = Categorypost::get();
    //         if ($categories->isEmpty()) {
    //             return response()->json([
    //                 "message" => "Không có danh mục bài viết nào",
    //                 "status" => false,
    //                 "data" => []
    //             ]);
    //         }
    //         return response()->json([
    //             "message" => "Lấy danh mục bài viết thành công",
    //             "status" => true,
    //             "data" => $categories
    //         ]);
    //     } catch (\Exception $th) {
    //         return response()->json([
    //             "message" => "Đã xảy ra lỗi.",
    //             "status" => false
    //         ], 500);
    //     }
    // }
      public function getCategoryPost(Request $request)
    {
        try {
            $request->validate([
                'search' => 'sometimes|string|max:100',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
            ]);

            $query = CategoryPost::query();

            // Tìm kiếm theo tên hoặc mô tả
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('name', 'like', $searchTerm)
                             ->orWhere('description', 'like', 'searchTerm');
                });
            });

            // Lọc theo khoảng ngày tạo
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('created_at', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('created_at', '<=', $request->end_date));

            // Sắp xếp và phân trang
            $categories = $query->latest()->paginate(15)->withQueryString();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh mục bài viết thành công',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching post categories: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh mục bài viết.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getCategoryPostBySlug($slug)
    {
        try {
            $category = Categorypost::where("slug", $slug)->first();
            if (!$category) {
                return response()->json([
                    'message' => "Danh mục bài viết không tồn tại",
                    'status' => 404
                ]);
            }
            return response()->json([
                "message" => "Lấy danh mục bài viết thành công",
                "status" => true,
                "data" => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Đã xảy ra lỗi. ",
                "status" => false
            ], 500);
        }
    }
    public function updateCategoryPost(Request $request, $slug)
    {
        $category = Categorypost::where("slug", $slug)->first();
        if (!$category) {
            return response()->json([
                'message' => "Danh mục bài viết không tồn tại",
                'status' => 404
            ]);
        }
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:categories_post,slug,' . $category->id,
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => "Dữ liệu không hợp lệ",
                    "status" => false,
                    "errors" => $validator->errors()
                ], 422);
            }

            $category->update([
                'name' => $request->input('name'),
                'slug' => $request->input('slug'),
                'description' => $request->input('description', ''),
            ]);

            return response()->json([
                "message" => "Cập nhật danh mục bài viết thành công",
                "status" => 200,
                "data" => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Đã xảy ra lỗi.",
                "status" => false
            ], 500);
        }
    }
    public function deleteCategoryPost($slug)
    {
        $category = Categorypost::where("slug", $slug)->first();
        if (!$category) {
            return response()->json([
                'message' => "Danh mục bài viết không tồn tại",
                'status' => false
            ], 404);
        }
        try {
            $category->delete();
            return response()->json([
                "message" => "Xoá danh mục bài viết thành công",
                "status" => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Đã xảy ra lỗi.",
                "status" => false
            ], 500);
        }
    }
    public function createCategoryPost(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:categories_post,slug',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => "Dữ liệu không hợp lệ",
                    "status" => false,
                    "errors" => $validator->errors()
                ], 422);
            }

            $category = Categorypost::create([
                'name' => $request->input('name'),
                'slug' => $request->input('slug'),
                'description' => $request->input('description', ''),
            ]);

            return response()->json([
                "message" => "Tạo danh mục bài viết thành công",
                "status" => true,
                "data" => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Đã xảy ra lỗi.",
                "status" => false
            ], 500);
        }
    }
}
