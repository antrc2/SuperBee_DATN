<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class UserProductController extends Controller
{
    public function index(Request $request){
        try {
            $products = Product::with('category')->with("images")->with("gameAttributes")->where('status',1)->get();
            return response()->json(
                [
                    "status"=>True,
                    "message"=>"Lấy danh sách sản phẩm thành công",
                    "data"=>$products
                ]
                );
        } catch (\Throwable $th) {
            return response()->json(
                [
                    "status"=>True,
                    "message"=>"Lấy danh sách sản phẩm thất bại",
                    "data"=>[]
                ]
            );
        }
    }
    public function show(Request $request, $id){
        try {
            $product = Product::with('category')->with("images")->with("gameAttributes")->where('status',1)->where('id',$id)->get();
            if (count($product) == 0) {
                return response()->json(
                    [
                        "status"=>false,
                        "message"=>"Không tìm thấy sản phẩm",
                        "data"=> []
                    ],404
                );
            }

            return response()->json(
                [
                    "status"=>True,
                    "message"=>"Xem chi tiết sản phẩm thành công",
                    "data"=>$product
                ]
                );
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra",
                'data'=>[]
            ],500);
        }
    }
}
