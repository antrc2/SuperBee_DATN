<?php

namespace App\Http\Controllers\Admin;

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

class AdminPostController extends Controller
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
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
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
    public function destroy($id)
    {
        try {
            $post = Post::findOrFail($id);
            $post->delete();
            return response()->json([
                "message" => "Xóa bài viết thành công",
                "status" => true
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi xóa bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            // 1. Validate chung
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:posts,slug',
                'status' => 'required|in:0,1,2',
                'image_thumbnail_url' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'content' => 'required|string',
                'author_id' => 'required|exists:users,id',
                'category_id' => 'nullable|exists:categories_post,id',
                'category_name' => 'nullable|required_without:category_id|string|max:255',
                'category_slug' => 'nullable|required_with:category_name|string|max:255|unique:categories_post,slug',
                'category_description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "message" => "Dữ liệu không hợp lệ",
                    "status" => false,
                    "errors" => $validator->errors()
                ], 422);
            }

            // 2. Xử lý danh mục: chọn sẵn hoặc tạo mới
            $categoryId = $request->input('category_id');

            if (!$categoryId && $request->filled('category_name') && $request->filled('category_slug')) {
                $category = Categorypost::create([
                    'name' => $request->input('category_name'),
                    'slug' => $request->input('category_slug'),
                    'description' => $request->input('category_description', ''),
                ]);
                $categoryId = $category->id;
            }

            if (!$categoryId) {
                return response()->json([
                    "message" => "Bạn cần chọn danh mục có sẵn hoặc nhập danh mục mới",
                    "status" => false
                ], 422);
            }

            // 3. Upload ảnh nếu có
            $imageUrl = null;
            if ($request->hasFile('image_thumbnail_url')) {
                $imageUrl = $this->uploadFile($request->file('image_thumbnail_url'), 'post_images');
                if (is_null($imageUrl)) {
                    return response()->json(['message' => 'Tải ảnh thất bại'], 500);
                }
            }

            // 4. Tạo bài viết
            $post = Post::create([
                'title' => $request->input('title'),
                'slug' => $request->input('slug'),
                'status' => $request->input('status'),
                'image_thumbnail_url' => $imageUrl,
                'content' => $request->input('content'), // Sử dụng markdownContent thay vì content
                'category_id' => $categoryId,
                'author_id' => $request->input('author_id'),
            ]);

            return response()->json([
                "message" => "Tạo bài viết thành công",
                "status" => true,
                "data" => $post
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi tạo bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function update(Request $request, $slug)
    {
        try {
            $post = Post::where('slug', $slug)->firstOrFail();
            // 1. Validate chung
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:posts,slug,' . $post->id,
                'status' => 'required|in:0,1,2',
                'image_thumbnail_url' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'content' => 'required|string',
                'author_id' => 'required|exists:users,id',

                // Chỉ yêu cầu 1 trong 2: category_id hoặc category_name
                'category_id' => 'nullable|exists:categories,id',
                'category_name' => 'nullable|required_without:category_id|string|max:255',
                'category_slug' => 'nullable|required_with:category_name|string|max:255|unique:categories,slug,' . $post->category_id,
                'category_description' => 'nullable|string',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    "message" => "Dữ liệu không hợp lệ",
                    "status" => false,
                    "errors" => $validator->errors()
                ], 422);
            }
            // 2. Xử lý danh mục: chọn sẵn hoặc tạo mới
            $categoryId = $request->input('category_id');
            if (!$categoryId && $request->filled('category_name') && $request->filled('category_slug')) {
                $category = Categorypost::updateOrCreate(
                    ['slug' => $request->input('category_slug')],
                    [
                        'name' => $request->input('category_name'),
                        'description' => $request->input('category_description', ''),
                    ]
                );
                $categoryId = $category->id;
            }
            if (!$categoryId) {
                return response()->json([
                    "message" => "Bạn cần chọn danh mục có sẵn hoặc nhập danh mục mới",
                    "status" => false
                ], 422);
            }
            // 3. Upload ảnh nếu có
            $imageUrl = $post->image_thumbnail_url; // Giữ nguyên ảnh cũ nếu không có ảnh mới
            if ($request->hasFile('image_thumbnail_url')) {
                $imageUrl = $this->uploadFile($request->file('image_thumbnail_url'), 'post_images');
                if (is_null($imageUrl)) {
                    return response()->json(['message' => 'Tải ảnh thất bại'], 500);
                }
            }
            // 4. Cập nhật bài viết
            $post->update([
                'title' => $request->input('title'),
                'slug' => $request->input('slug'),
                'status' => $request->input('status'),
                'image_thumbnail_url' => $imageUrl,
                'content' => $request->input('content'),
                'category_id' => $categoryId,
                'author_id' => $request->input('author_id'),
            ]);
            return response()->json([
                "message" => "Cập nhật bài viết thành công",
                "status" => true,
                "data" => $post
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi cập nhật bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function publish($id)
    {
        try {
            $post = Post::findOrFail($id);
            if ($post->status != 1) {
                $post->status = 1; // Đặt trạng thái là đã xuất bản
                $post->save();
                return response()->json([
                    "message" => "Đã xuất bản bài viết thành công",
                    "status" => true,
                    "data" => $post
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi đổi trạng thái bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
    public function unpublish($id)
    {
        try {
            $post = Post::findOrFail($id);
            if ($post->status != 0 || $post->status != 2) {
                $post->status = 0; // Đặt trạng thái là đã hủy xuất bản
                $post->save();
                return response()->json([
                    "message" => "Đã hủy xuất bản bài viết thành công",
                    "status" => true,
                    "data" => $post
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Lỗi khi đổi trạng thái bài viết: " . $e->getMessage(),
                "status" => false
            ], 500);
        }
    }
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




    /**
     * Xử lý yêu cầu tải ảnh lên từ Froala Editor
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        // Validate request
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
        ], [
            'file.required' => 'Vui lòng chọn một file ảnh.',
            'file.image' => 'File tải lên phải là một ảnh.',
            'file.mimes' => 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận jpeg, png, jpg, gif, svg.',
            'file.max' => 'Kích thước ảnh không được vượt quá 5MB.',
        ]);

        // Kiểm tra và lưu file

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $imageUrl = $this->uploadFile($uploadedFile, 'froala_image');

            if ($imageUrl) {
                return response()->json(['link' => $imageUrl], 200);
            }

            return response()->json([
                'error' => 'Tải ảnh lên thất bại. Vui lòng kiểm tra log server.'
            ], 500);
        }

        return response()->json(['error' => 'Không tìm thấy file ảnh để tải lên.'], 400);
    }

    /**
     * Tùy chọn: Hàm này để Froala Image Manager tải danh sách ảnh đã upload.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function loadImages(Request $request)
    {
        try {
            $files = Storage::disk('public')->files('froala_images'); // Lấy tất cả file trong thư mục froala_images

            $images = [];
            foreach ($files as $file) {
                // Lọc bỏ các file không phải ảnh hoặc các file ẩn
                if (preg_match('/\.(jpeg|jpg|png|gif|svg)$/i', $file)) {
                    $images[] = [
                        'url' => Storage::url($file),
                        'thumb' => Storage::url($file), // Thường dùng ảnh gốc làm thumb nếu không có phiên bản nhỏ hơn
                        'name' => basename($file)
                    ];
                }
            }

            return response()->json($images);
        } catch (\Exception $e) {
            Log::error("Lỗi khi tải danh sách ảnh: " . $e->getMessage());
            return response()->json(['error' => 'Không thể tải danh sách ảnh.'], 500);
        }
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'src' => 'required|string', // URL của ảnh cần xóa
        ]);

        $url = $request->input('src');

        try {
            // Chuyển đổi URL công khai thành đường dẫn tương đối trên disk 'public'
            // Ví dụ: từ 'http://localhost:8000/storage/froala_images/xyz.jpg'
            // thành 'froala_images/xyz.jpg'
            $basePath = 'storage/';
            // SỬA TỪ str_after SANG Str::after
            $relativeStoragePath = Str::after($url, $basePath); // <-- ĐÃ SỬA

            // Hoặc đơn giản hơn nếu bạn biết chắc đường dẫn sẽ bắt đầu với froala_images
            // $filename = basename($url);
            // $relativeStoragePath = 'froala_images/' . $filename;

            // Kiểm tra xem file có tồn tại và nằm trong thư mục froala_images không để tránh xóa file hệ thống
            if (Str::startsWith($relativeStoragePath, 'froala_images/') && Storage::disk('public')->exists($relativeStoragePath)) {
                Storage::disk('public')->delete($relativeStoragePath);
                return response()->json(['message' => 'Ảnh đã được xóa thành công.']);
            } else {
                return response()->json(['error' => 'Không tìm thấy ảnh hoặc ảnh không hợp lệ để xóa.'], 404);
            }
        } catch (\Exception $e) {
            Log::error("Lỗi khi xóa ảnh: " . $e->getMessage());
            return response()->json(['error' => 'Không thể xóa ảnh.'], 500);
        }
    }
}
