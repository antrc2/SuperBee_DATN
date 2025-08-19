<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductGameAttribute;
use Illuminate\Http\Request;

class UserProductController extends Controller
{
    public function index(Request $request, $slug)
    {
        try {
            $category = Category::where('slug', $slug)
                ->where('status', 1)
                ->first();

            if (!$category) {
                return response()->json(
                    [
                        "status" => false,
                        "message" => "Không tìm thấy danh mục sản phẩm",
                        "data" => []
                    ],
                    404
                );
            }
            $products = [];
            $categories = [];
            $type = null;
            if ($category->parent_id !== null) {
                $type = 1;
                $products = Product::with("images")->with('category')->with("gameAttributes")
                    ->where('status', 1)
                    ->where('category_id', $category->id)
                    ->get();
            } else {
                $type = 2;
                $categories = Category::where('parent_id', $category->id)
                    ->withCount([
                        'products as count' => function ($query) {
                            $query->where('status', 1);
                        }
                    ])
                    ->get();
            }
            return response()->json(
                [
                    "status" => true,
                    "message" => "Lấy danh sách sản phẩm thành công",
                    "data" => [
                        "type" => $type,
                        "category" => $category,
                        "categories" => $categories,
                        "products" => $products
                    ]
                ]
            );
        } catch (\Throwable $th) {
            return response()->json(
                [
                    "status" => false,
                    "message" => "Lấy danh sách sản phẩm thất bại",
                    "data" => []
                ],
                500
            );
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $product = Product::with('category')->with("images")->with("gameAttributes")
                ->where('status', 1)
                ->where('sku', $id)
                ->get();
            if (count($product) == 0) {
                return response()->json(
                    [
                        "status" => false,
                        "message" => "Không tìm thấy sản phẩm",
                        "data" => []
                    ],
                    404
                );
            }
            if ($product[0]->category->status == 1) {
                return response()->json(
                    [
                        "status" => true,
                        "message" => "Xem chi tiết sản phẩm thành công",
                        "data" => $product
                    ]
                );
            } else {
                return response()->json([
                    'status' => false,
                    'message' => "Không tìm thấy danh mục sản phẩm",
                    'data' => []
                ], 404);
            }
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                'data' => []
            ], 500);
        }
    }

    public function search(Request $request)
    {
        $keyword = $request->input('keyword');

        $products = Product::with(['category.parent', 'images', 'gameAttributes'])
            ->where('products.status', 1)
            ->where(function ($query) use ($keyword) {
                $query->where('products.sku', 'LIKE', "%{$keyword}%")
                    ->orWhere('products.description', 'LIKE', "%{$keyword}%");
                $query->orWhereHas('gameAttributes', function ($q) use ($keyword) {
                    $q->where('attribute_key', 'LIKE', "%{$keyword}%")
                        ->orWhere('attribute_value', 'LIKE', "%{$keyword}%");
                });
                $query->orWhereHas('category', function ($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%{$keyword}%");
                });
                $query->orWhereHas('category.parent', function ($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%{$keyword}%");
                });
            })
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Tìm kiếm sản phẩm thành công',
            'data' => $products
        ]);
    }

    public function getProductsWithFilter(Request $request, $slug)
{
    try {
        // Validate các tham số
        $request->validate([
            'key' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'categoryId' => 'nullable|integer|exists:categories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|gte:min_price',
            'attribute_key' => 'nullable|string|max:255',
            'attribute_value' => 'nullable|string|max:255',
            'sortBy' => 'nullable|in:featured,newest,price_asc,price_desc',
            'limit' => 'integer|min:1|max:50',
            'page' => 'integer|min:1',
        ]);

        $limit = $request->query('limit', 12);

        // Kiểm tra danh mục
        $category = Category::where('slug', $slug)->with('children')->first();
        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Danh mục không tồn tại'
            ], 404);
        }

        // Bắt đầu xây dựng câu truy vấn
        $query = Product::with(['category', 'gameAttributes', 'images'])->where('status', 1);

        // Lọc theo danh mục từ slug
        $query->where('category_id', $category->id);

        // 1. Lọc theo TỪ KHÓA CHUNG (key)
        if ($request->filled('key')) {
            $searchKey = $request->query('key');
            $query->where(function ($q) use ($searchKey) {
                $q->where('sku', 'like', '%' . $searchKey . '%')
                    ->orWhereHas('category', function ($catQuery) use ($searchKey) {
                        $catQuery->where('name', 'like', '%' . $searchKey . '%');
                    });
            });
        }

        // 2. Lọc theo SKU
        if ($request->filled('sku')) {
            $query->where('sku', 'like', '%' . $request->query('sku') . '%');
        }

        // 3. Lọc theo DANH MỤC (từ dropdown)
        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->query('categoryId'));
        }

        // 4. Lọc theo KHOẢNG GIÁ
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->query('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->query('max_price'));
        }

        // 5. Lọc theo THUỘC TÍNH ĐỘNG
        if ($request->filled('attribute_key') && $request->filled('attribute_value')) {
            $query->whereHas('gameAttributes', function ($q) use ($request) {
                $q->where('attribute_key', 'LIKE', '%' . $request->attribute_key . '%')
                    ->where('attribute_value', 'LIKE', '%' . $request->attribute_value . '%');
            });
        }

        // 6. SẮP XẾP
        $sortBy = $request->query('sortBy', 'newest');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'featured':
                $query->whereNotNull('sale')->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        // Phân trang và trả về kết quả
        $products = $query->paginate($limit);

        return response()->json([
            'success' => true,
            'data' => [
                'type' => 1,
                'category' => $category, // Trả về danh mục và children
                'products' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'has_more' => $products->hasMorePages(),
                    'links' => $products->links()->elements[0] ?? null,
                ]
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Có lỗi xảy ra khi lấy danh sách sản phẩm',
            'error' => $e->getMessage()
        ], 500);
    }
}
}