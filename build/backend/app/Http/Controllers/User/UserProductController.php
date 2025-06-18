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
            $products = Product::with("images")->with('category')->with("gameAttributes")->where('status', 1)->where('category_id', $category->id)->get();
            return response()->json(
                [
                    "status" => True,
                    "message" => "Lấy danh sách sản phẩm thành công",
                    "data" => [
                        "category" => $category,
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
}
