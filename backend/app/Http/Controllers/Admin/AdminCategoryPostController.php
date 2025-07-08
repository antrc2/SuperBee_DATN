<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categorypost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminCategoryPostController extends Controller
{



    public function getCategoryPost()
    {
        try {
            $categories = Categorypost::get();
            if ($categories->isEmpty()) {
                return response()->json([
                    "message" => "Không có danh mục bài viết nào",
                    "status" => false,
                    "data" => []
                ]);
            }
            return response()->json([
                "message" => "Lấy danh mục bài viết thành công",
                "status" => true,
                "data" => $categories
            ]);
        } catch (\Exception $th) {
            return response()->json([
                "message" => "Lỗi khi lấy danh mục bài viết: " . $th->getMessage(),
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
                "message" => "Lỗi khi tạo danh mục bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
}
