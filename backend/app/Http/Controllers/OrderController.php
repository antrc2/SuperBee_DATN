<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartDetail;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductDetail;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = $request->user_id;
            $webId = $request->web_id;
            $role = User::where('id', $userId)->value('role_id');
            if ($role == 4) {
                $listOrders = Order::get();
                return response()->json([
                    "status" => true,
                    "message" => "Lấy danh sách đơn hàng thành công",
                    "data" => $listOrders
                ]);
            } else {
                $listOrders = Order::where("user_id", $userId)->where("web_id", $webId)->get();
                return response()->json([
                    "status" => true,
                    "message" => "Lấy danh sách đơn hàng thành công",
                    "data" => $listOrders
                ]);
            }
        } catch (Exception $error) {
            return response()->json([
                "status" => false,
                "message" => "Lỗi: " . $error->getMessage()
            ], 500);
        }
    }
    public function OrderDetail(Request $request, $id)
    {
        try {
            $userId = $request->user_id;
            $webId = $request->web_id;
            $role = User::where('id', $userId)->value('role_id');
            $order = Order::find($id);
            $orderDetails = OrderDetail::where("order_id", $id)->get();
            if (!$order) {
                return response()->json([
                    "status" => false,
                    "message" => "Đơn hàng không tồn tại",
                ]);
            }
            if ($role == 4 || $order->user_id == $userId) {
                return response()->json([
                    "status" => true,
                    "message" => "Lấy chi tiết đơn hàng thành công",
                    "data" => [
                        "order" => $order,
                        "order_details" => $orderDetails
                    ]
                ]);
            } else {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không có quyền truy cập vào đơn hàng này",
                ], 403);
            }
        } catch (Exception $error) {
            return response()->json([
                "status" => false,
                "message" => "Lỗi:" . $error->getMessage(),
            ], 500);
        }
    }
    public function Order(Request $request)
    {
        try {
            $userId = $request->user_id;
            $webId = $request->web_id;
            if (!$request->discount_code_id) {
                $discount = DiscountCode::where("id", $request->discount_code_id)->where("user_id", $userId)->where("web_id", $webId)->first();
                if (!$discount) {
                    return response()->json([
                        "status" => false,
                        "message" => "Mã Giảm giá không tồn tại hoặc không thuộc về bạn."
                    ], 400);
                }
                if ($discount->end_date < now()) {
                    return response()->json([
                        "status" => false,
                        "messager" => "Mã Giảm giá đã hết hạn."
                    ], 400);
                }
                $total = 0;
                foreach ($request->products as $item) {
                    $total += ProductDetail::where('id', $item["product_detail_id"])->value('price');
                }
                if ($total < $discount->min_discount_amount) {
                    return response()->json([
                        "status" => false,
                        "message" => "Đơn hàng của bạn không đủ điều kiện sử dụng mã giảm giá này."
                    ], 400);
                }
                if ($total < $discount->max_discount_amount) {
                    $total_price = $total - $total * $discount->discount_amount / 100;
                } else {
                    $total_price = $total - $discount->max_discount_amount * $discount->discount_amount / 100;
                }
                // Cập nhật số dư của người dùng
                $user = User::find($userId);
                if ($user->balance < $total_price) {
                    return response()->json([
                        "status" => false,
                        "message" => "Số dư của bạn không đủ để thực hiện giao dịch."
                    ], 400);
                }
                $user->balance = $user->balance - $total_price;
                $user->save();
                $order = Order::create([
                    "user_id" => $userId,
                    "web_id" => $webId,
                    "discount_code_id" => $request->discount_code_id,
                    "total_price" => $total_price
                ]);
                OrderDetail::insert(
                    array_map(function ($item) use ($order) {
                        return [
                            "order_id" => $order->id,
                            "product_detail_id" => $item["product_detail_id"],
                            "web_id" => $order->web_id,
                        ];
                    }, $request->products)
                );
                // Cập nhật số lượt dùng mã giảm giá
                $discount->used_count += 1;
                $discount->save();

                // Cập nhật trạng thái sản phẩm
                foreach ($request->products as $item) {
                    $Product_id = ProductDetail::where('id', $item["product_detail_id"])->value('product_id');
                    $product = Product::where("id", $Product_id)->first();
                    $product->status = 4;
                    $product->save();
                }
                // Xóa sản phẩm trong giỏ hàng
                foreach ($request->products as $item) {
                    // Xóa chi tiết trong giỏ hàng
                    CartDetail::where('product_detail_id', $item["product_detail_id"])->delete();
                }

                // Sau khi xóa hết chi tiết, kiểm tra Cart
                $cart = Cart::where("user_id", $userId)->where("web_id", $webId)->first();

                if ($cart) {
                    // Đếm số lượng CartDetail còn lại
                    $CountProductInCart = CartDetail::where('cart_id', $cart->id)->count();

                    if ($CountProductInCart === 0) {
                        // Nếu không còn chi tiết nào -> xóa luôn Cart
                        $cart->delete();
                    }
                }
                return response()->json([
                    "status" => true,
                    "message" => "Đặt hàng thành công",
                    "data" => $order
                ]);
            } else {
                $total = 0;
                foreach ($request->products as $item) {
                    $total += ProductDetail::where('id', $item["product_detail_id"])->value('price');
                }
                $user = User::find($userId);
                if ($user->balance < $total) {
                    return response()->json([
                        "status" => false,
                        "message" => "Số dư của bạn không đủ để thực hiện giao dịch."
                    ], 400);
                }
                $user->balance = $user->balance - $total;
                $user->save();
                $order = Order::create([
                    "user_id" => $userId,
                    "web_id" => $webId,
                    "total_price" => $total
                ]);
                OrderDetail::insert(
                    array_map(function ($item) use ($order) {
                        return [
                            "order_id" => $order->id,
                            "product_detail_id" => $item["product_detail_id"],
                            "web_id" => $order->web_id,
                        ];
                    }, $request->products)
                );
                // Cập nhật trạng thái sản phẩm
                foreach ($request->products as $item) {
                    $Product_id = ProductDetail::where('id', $item["product_detail_id"])->value('product_id');
                    $product = Product::where("id", $Product_id)->first();
                    $product->status = 4;
                    $product->save();
                }
                // Xóa sản phẩm trong giỏ hàng
                foreach ($request->products as $item) {
                    // Xóa chi tiết trong giỏ hàng
                    CartDetail::where('product_detail_id', $item["product_detail_id"])->delete();
                }

                // Sau khi xóa hết chi tiết, kiểm tra Cart
                $cart = Cart::where("user_id", $userId)->where("web_id", $webId)->first();

                if ($cart) {
                    // Đếm số lượng CartDetail còn lại
                    $CountProductInCart = CartDetail::where('cart_id', $cart->id)->count();

                    if ($CountProductInCart === 0) {
                        // Nếu không còn chi tiết nào -> xóa luôn Cart
                        $cart->delete();
                    }
                }
                return response()->json([
                    "status" => true,
                    "message" => "Đặt hàng thành công",
                    "data" => $order
                ]);
            }
        } catch (Exception $error) {
            return response()->json([
                "status" => false,
                "message" => "Lỗi: " . $error->getMessage()
            ], 500);
        }
    }
}
