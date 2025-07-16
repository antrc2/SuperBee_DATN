<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Categorypost;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\MarkdownConverter;

class UserPostController extends Controller
{
    public function index()
    {
        try {
            $post = Post::with("category", "author")->paginate(20);
            return response()->json([
                "message" => "Lấy danh sách bài viết thành công",
                "status" => true,
                "data" => $post
            ]);
            return response()->json([
                "message" => "Lấy danh sách bài viết thành công",
                "status" => true,
                "data" => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi lấy danh sách bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function show($slug)
    {
        try {
            $post = Post::with("category", "comments", 'author')->where('slug', $slug)->firstOrFail();
            return response()->json([
                "message" => "Lấy bài viết thành công",
                "status" => true,
                "data" => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi lấy bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function getCategoryById($id)
    {
        try {
            $category = Categorypost::where("id", $id)->first();
            if (!$category) {
                return response()->json([
                    'message' => "danh mục bài viết không tồn tại",
                    'status' => false
                ], 401);
            }
            return response()->json([
                'message' => "Lấy danh mục bài viết thành công",
                'status' => false,
                'data' => $category
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi đổi trạng thái bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function getPostByCategory($id)
    {
        try {
            $posts = Post::with('comments', 'author', 'category')->where("category_id", $id)->get();
            if (!$posts) {
                return response()->json([
                    'message' => "không có bài viết liên quan.",
                    'status' => false
                ], 401);
            }
            return response()->json([
                'message' => "Lấy bài viết liên quan thành công.",
                'status' => false,
                'data' => $posts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Tải bài viết thất bại: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
}
