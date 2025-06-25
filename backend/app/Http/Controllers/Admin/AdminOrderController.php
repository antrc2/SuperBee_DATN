<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(){
        try {
            $orders = Order::with('items')->get();
            return response()->json([
                "status"=>True,
                "message"=>"Lấy danh sách đơn hàng thành công",
                "data"=>$orders
            ],200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                "message"=>"Lấy danh sách đơn hàng thất bại",
                "data"=>[]
            ],500);
        }
    }
    public function show($id){
        try {
            $order = Order::where('id',$id)->with('items.product.category')->with("items.product.gameAttributes")->with("items.product.images")->first();
            return response()->json([
                "status"=>True,
                "message"=>"Lấy chi tiết đơn hàng thành công",
                "data"=>$order
            ],200); 
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Lấy chi tiết đơn hàng thất bại",
                "data"=>[]
            ],500);
        }
    }
}
