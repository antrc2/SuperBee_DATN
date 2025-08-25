<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AssistantProductController extends Controller
{
    public function index(Request $request){
        try {
            $skus = Product::where('status',1)->with(['category'=>function($query){
                $query->where('parent_id',"!=",null)->where('status',1);
            }])->get(['sku','created_at','updated_at']);
            return response()->json([
                "status"=>True,
                'message'=>"Lấy danh sách sku của sản phẩm thành công",
                'data'=>$skus
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách sku của sản phẩm thất bại",
                'data'=>[]
            ]);
        }
    }
    public function show(Request $request,$sku){
        try {
            $product = Product::where("sku",$sku)->where('status',1)->with(['category'=>function($query){
                $query->where('parent_id',"!=",null)->where('status',1);
            }])->with(['gameAttributes','images'])->first();
            $frontend_link = env("FRONTEND_URL");
            return response()->json([
                'status'=>True,
                'message'=>"Lấy chi tiết sản phẩm theo sku {$sku} thành công",
                'data'=>$product,
                'link'=>"{$frontend_link}/acc/{$sku}"
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Lấy chi tiết sản phẩm theo sku {$sku} thất bại",
                'data'=>[]
            ]);
        }
    }
}
