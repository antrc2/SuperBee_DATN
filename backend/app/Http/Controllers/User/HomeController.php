<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\Category;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Lấy dữ liệu chính cho trang chủ.
     * Dữ liệu sản phẩm ở đây đã được giới hạn sẵn (limit 8).
     */
    public function index(Request $request)
    {
        // ... (Giữ nguyên logic của hàm index đã tối ưu ở lần trước)
        $banners = Banner::where('web_id', $request->web_id)->where('status', 1)->orderBy('id', 'asc')->get();
             $category = new UserCategoryController();
        $categories = $category->index()->getData();
        $topNap = Wallet::with(['user' => fn($q) => $q->select('id', 'username')])
            ->select('balance', 'user_id')->orderBy('balance', 'desc')->limit(5)->get();

        // Lấy 8 sản phẩm nổi bật
        $featuredProducts = Product::with("images", "category", "gameAttributes")
            ->where('status', 1)->whereNotNull('sale')->orderBy('price', 'desc')->limit(8)->get();

        // Lấy 8 sản phẩm mới nhất
        $newestProducts = Product::with("images", "category", "gameAttributes")
            ->where('status', 1)->latest()->limit(8)->get();

        return response()->json([
            'status' => 200,
            'message' => 'Lấy dữ liệu trang chủ thành công',
            'data' => [
                'banners' => $banners,
                'categories' => $categories->data,
                'top_users' => $topNap,
                'featured_products' => $featuredProducts,
                'newest_products' => $newestProducts,
            ]
        ], 200);
    }

    /**
     * API chuyên dụng cho trang tìm kiếm và lọc sản phẩm.
     * Hỗ trợ phân trang, sắp xếp, lọc theo danh mục, SKU, và khoảng giá.
     */
    public function products(Request $request)
    {
        // Validate tất cả các tham số có thể có
        $request->validate([
            'key' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'categoryId' => 'nullable|integer|exists:categories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|gte:min_price',
            'sortBy' => 'nullable|in:featured,newest,price_asc,price_desc',
            'limit' => 'integer|min:1|max:50',
            'page' => 'integer|min:1',
        ]);

        $limit = $request->query('limit', 12);

        // Bắt đầu xây dựng câu truy vấn
        $query = Product::with(['category', 'gameAttributes', 'images'])->where('status', 1);

        // 1. Lọc theo TỪ KHÓA CHUNG (key) - tìm trong SKU hoặc tên danh mục
        if ($request->filled('key')) {
            $searchKey = $request->query('key');
            $query->where(function ($q) use ($searchKey) {
                $q->where('sku', 'like', '%' . $searchKey . '%')
                  ->orWhereHas('category', function ($catQuery) use ($searchKey) {
                      $catQuery->where('name', 'like', '%' . $searchKey . '%');
                  });
            });
        }

        // 2. Lọc theo SKU (từ ô input trong bộ lọc)
        if ($request->filled('sku')) {
            $query->where('sku', 'like', '%' . $request->query('sku') . '%');
        }

        // 3. Lọc theo DANH MỤC (từ dropdown trong bộ lọc)
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

        // 5. SẮP XẾP
        $sortBy = $request->query('sortBy', 'newest'); // Mặc định là mới nhất
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
        return response()->json($products);
    }

}
