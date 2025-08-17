<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Controllers\User\UserCartController;
use App\Models\Product;
use Illuminate\Http\Request;

class AssistantCartController extends Controller
{
    public function store(Request $request){
        try {
            $user_cart = new UserCartController();
            $response = $user_cart->store($request)->getData(true);;
            $sku = Product::where("id",$request->product_id)->first()->sku;
            $frontend_link = env("FRONTEND_URL");
            if ($response['status']){
                $this->sendNotification(1,"Thêm sản phẩm {$sku} vào giỏ hàng thành công","{$frontend_link}/cart",$request->user_id);
            }
            $response['link'] = "{$frontend_link}/cart";
            return response()->json($response);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Đã xảy ra lỗi hệ thống",
                // "hehe"=>$th->getMessage()
            ]);
        }
    }
}
