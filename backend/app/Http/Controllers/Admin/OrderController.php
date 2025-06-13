<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    //
    public function index(Request $request)
    {
        $orders = Order::orderBy("created_at", "desc")->paginate(10);
        return response()->json([
            'orders' => $orders,
            'message' => 'Lấy danh sách đơn hàng thành công',
            ' status' => true
        ]);
    }
    public function show(Request $request, $id)
    {
        $order = Order::find($id);
   
        if (!$order) {
            return response()->json([
                'message' => 'Đơn hàng không tồn tại',
                'status' => false
            ], 404);
        }
        $orderItems = OrderItem::where('order_id', $id)
            ->with(['product', 'product.images','order.user'])
            ->get();
        return response()->json([
            'order' => $orderItems,
            'message' => 'Lấy thông tin đơn hàng thành công',
            'status' => true
        ]);
    }
}
