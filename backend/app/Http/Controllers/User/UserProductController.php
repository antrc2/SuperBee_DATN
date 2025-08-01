<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
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
                        "status" => False,
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
                $products = Product::with("images")->with('category')->with("gameAttributes")->where('status', 1)->where('category_id', $category->id)->get();
            } else {
                $type = 2;
                $categories = Category::where('parent_id', $category->id)->get();
            }
            return response()->json(
                [
                    "status" => True,
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
                    "status" => True,
                    "message" => "Lấy danh sách sản phẩm thất bại",
                    "data" => []
                ]
            );
        }
    }
    public function show(Request $request, $id)
    {
        try {
            $product = Product::with('category')->with("images")->with("gameAttributes")->where('status', 1)->where('sku', $id)->get();
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

            return response()->json(
                [
                    "status" => True,
                    "message" => "Xem chi tiết sản phẩm thành công",
                    "data" => $product
                ]
            );
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
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
                // SKU hoặc mô tả
                $query->where('products.sku', 'LIKE', "%{$keyword}%")
                    ->orWhere('products.description', 'LIKE', "%{$keyword}%");

                // Game attributes
                $query->orWhereHas('gameAttributes', function ($q) use ($keyword) {
                    $q->where('attribute_key', 'LIKE', "%{$keyword}%")
                        ->orWhere('attribute_value', 'LIKE', "%{$keyword}%");
                });

                // Tên danh mục con (category hiện tại)
                $query->orWhereHas('category', function ($q) use ($keyword) {
                    $q->where('name', 'LIKE', "%{$keyword}%");
                });

                // Tên danh mục cha
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
}
