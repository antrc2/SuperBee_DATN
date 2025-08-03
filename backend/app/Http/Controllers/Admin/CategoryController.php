<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    /**
     * Hiển thị danh sách danh mục.
     */
    public function index()
    {
        try {
            $categories = Category::with(['creator', 'updater'])->get();

            $buildTree = function ($categories, $parentId = null) use (&$buildTree) {
                $tree = [];

                foreach ($categories as $category) {
                    if ($category->parent_id === $parentId) {
                        $children = $buildTree($categories, $category->id);

                        $tree[] = [
                            'id' => $category->id,
                            'name' => $category->name,
                            'parent_id' => $category->parent_id,
                            'slug' => $category->slug,
                            'status' => $category->status,
                            "image_url" => $category->image_url,
                            'created_by' => $category->creator ? $category->creator->username : null,
                            'updated_by' => $category->updater ? $category->updater->username : null,
                            'created_at' => $category->created_at,
                            'updated_at' => $category->updated_at,
                            'children' => $children
                        ];
                    }
                }
                return $tree;
            };
            $treeCategories = $buildTree($categories);
            return response()->json([
                'status' => true,
                'data' => $treeCategories,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lưu danh mục mới vào cơ sở dữ liệu.
     */
    public function store(Request $request)
    {
        try {
            // Kiểm tra dữ liệu đầu vào
            $request->validate([
                'name' => 'required|string|max:255',
                'parent_id' => 'nullable|exists:categories,id',
                'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:40000'
            ]);

            // Kiểm tra tên danh mục đã tồn tại chưa
            $existingCategory = Category::where('name', $request->name)->first();
            if ($existingCategory) {
                return response()->json([
                    'status' => false,
                    'message' => 'Tên danh mục đã tồn tại'
                ], 400);
            }

            // Tạo slug duy nhất
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $count = 1;

            while (Category::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }


            $imageUrl = null;

            // 2. Kiểm tra và tải ảnh nếu có
            if ($request->hasFile('image_url')) {
                // Gọi hàm uploadFile từ Controller cha
                $imageUrl = $this->uploadFile(
                    $request->file('image_url'),
                    'category_images' // Thư mục bạn muốn lưu ảnh danh mục
                );

                if (is_null($imageUrl)) {
                    // Xử lý lỗi nếu việc tải ảnh không thành công
                    return response()->json(['message' => 'Failed to upload category image.'], 500);
                }
            }

            // Tạo danh mục mới
            $category = Category::create([
                'name' => $request->name,
                'parent_id' => $request->parent_id,
                'slug' => $slug,
                'image_url' => $imageUrl,
                'status' => $request->status ?? 1,
                'created_by' => $request->user_id ?? null,
                'updated_by' => $request->user_id ?? null
            ]);
            $frontend_link = env("FRONTEND_URL");
            $this->sendNotification(1,"Danh mục {$request->name} đã được tạo thành công","{$frontend_link}/admin/categories/{$category->id}/edit",null,'products.*');
            return response()->json([
                'status' => true,
                'message' => 'Tạo danh mục thành công',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị thông tin chi tiết của danh mục.
     */
    public function show(string $id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Lấy danh mục thành công',
                'data' => $category
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin danh mục.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Kiểm tra dữ liệu đầu vào
            $request->validate(rules: [
                'name' => 'nullable|string|max:255',
                'parent_id' => [
                    'nullable',
                    'exists:categories,id',
                    function ($attribute, $value, $fail) use ($id) {
                        if ($value == $id) {
                            $fail('Danh mục không thể là con của chính nó.');
                        }
                    },
                ],
                'status' => 'nullable|in:0,1'
            ]);

            // Tìm danh mục cần cập nhật
            $category = Category::findOrFail($id);

            // Kiểm tra parent_id không nằm trong cây con của danh mục hiện tại
            if ($request->parent_id) {
                $childrenIds = $this->getAllChildrenIds($category);
                if (in_array($request->parent_id, $childrenIds)) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Không thể đặt danh mục cha là con của danh mục con'
                    ], 400);
                }
            }

            // Kiểm tra tên đã thay đổi và đã tồn tại chưa

            if ($category->name !== $request->name) {
                $existingCategory = Category::where('name', $request->name)
                    ->where('id', '!=', $id)
                    ->first();
                if ($existingCategory) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Tên danh mục đã tồn tại'
                    ], 400);
                }
            }

            // Kiểm tra xem có thay đổi gì không
            // if (
            //     $category->name === $request->name &&
            //     $category->parent_id === $request->parent_id &&
            //     $category->status == ($request->status ?? $category->status)
            // ) {
            //     return response()->json([
            //         'status' => true,
            //         'message' => 'Không có thay đổi nào để cập nhật',
            //         'data' => $category
            //     ], 200);
            // }

            // Tạo slug mới nếu tên thay đổi
            if ($category->name !== $request->name) {
                $slug = Str::slug($request->name);
                $originalSlug = $slug;
                $count = 1;

                while (Category::where('slug', $slug)
                    ->where('id', '!=', $id)
                    ->exists()
                ) {
                    $slug = $originalSlug . '-' . $count++;
                }
            } else {
                $slug = $category->slug;
            }
            $imageUrl = $category->image_url;

            // 2. Kiểm tra và tải ảnh nếu có
            if ($request->hasFile('image_url')) {
                // Gọi hàm uploadFile từ Controller cha
                $imageUrl = $this->uploadFile(
                    $request->file('image_url'),
                    'category_images'
                );

                if (is_null($imageUrl)) {
                    // Xử lý lỗi nếu việc tải ảnh không thành công
                    return response()->json(['message' => 'Failed to upload category image.'], 500);
                }
                if ($category->image_url) {
                    $relativePath = str_replace('/storage/', '', $category->image_url);
                    $this->deleteFile($relativePath, 'public');
                }
            }
            // Cập nhật danh mục
            $category->update([
                'name' => $request->name ?? $category->name,
                'parent_id' => $request->parent_id ?? $category->parent_id,
                'image_url' => $imageUrl,
                'slug' => $slug ?? $category->slug,
                'status' => $request->status ?? $category->status,
                'updated_by' => $request->user_id ?? null
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật danh mục thành công',
                'data' => $category
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (\Exception $e) {
            // $e->getMessage();
            return response()->json([
                'status' => false,
                'message' => "Đã xảy ra lỗi"
            ], 500);
        }
    }

    /**
     * Xóa danh mục.
     */
    public function destroy(string $id, Request $request)
    {
        try {
            // Không cho phép xóa danh mục mặc định
            if ($id == 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa danh mục mặc định'
                ], 400);
            }

            // Tìm danh mục cần xóa
            $category = Category::findOrFail($id);

            // Lấy tất cả ID của danh mục con một cách an toàn
            $childrenIds = $this->getAllChildrenIds($category);
            if ($childrenIds === null) {
                return response()->json([
                    'status' => false,
                    'message' => 'Có lỗi khi lấy danh sách danh mục con'
                ], 500);
            }

            $allCategoryIds = array_merge([$id], $childrenIds);

            // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
            DB::beginTransaction();
            try {
                // Chuyển tất cả sản phẩm về danh mục mặc định (id = 1)
                DB::table('products')
                    ->whereIn('category_id', $allCategoryIds)
                    ->update([
                        'category_id' => 1,
                        'updated_at' => now(),
                        'updated_by' => $request->user_id ?? null
                    ]);

                // Xóa tất cả danh mục (bao gồm cả danh mục con)
                Category::whereIn('id', $allCategoryIds)->delete();

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Xóa danh mục thành công'
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getAllChildrenIds(Category $category, array $processedIds = [])
    {
        try {
            // Kiểm tra để tránh đệ quy vô hạn
            if (in_array($category->id, $processedIds)) {
                return [];
            }

            $processedIds[] = $category->id;
            $ids = [];
            $children = Category::where('parent_id', $category->id)->get();

            foreach ($children as $child) {
                $ids[] = $child->id;
                $childIds = $this->getAllChildrenIds($child, $processedIds);
                if ($childIds === null) {
                    return [];
                }
                $ids = array_merge($ids, $childIds);
            }

            return $ids;
        } catch (\Exception $e) {
            return [];
        }
    }
}
