<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserOrderController extends Controller
{
    private function generateCode(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $max)];
        }
        return $code;
    }
    public function index(Request $request){
        try {
            $user_id = $request->user_id;
            $orders = Order::with(['items.product.category','items.product.images','promotion'])->where('user_id',$user_id)->get();
            return response()->json([
                'status'=>True,
                "message"=>"Lấy danh sách đơn hàng thành công",
                "data"=>$orders
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra",
                'data'=>[]
            ]);

        }
    }
    public function show(Request $request,$id){
        try {
            $user_id = $request->user_id;
            $order = Order::with(['items.product.category','items.product.gameAttributes','items.product.credentials','items.product.images'])->where('user_id',$user_id)->where('id',$id)->first();
            return response()->json([
                "status"=>True,
                "message"=>"Lấy đơn hàng thành công",
                'data'=>$order
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                "message"=>"Đã xảy ra lỗi",
                "data"=>[]
            ], 500);
        }
    }
    public function store(Request $request){
        try {
            $user_id = $request->user_id;
            $product_id = $request->product_id;

            $validator = Validator::make($request->all(), [
                'product_id' => 'required|array|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                ], 422);
            }

            $total_price = 0;
            $unit_price = [];

            foreach ($product_id as $item){
                $query = Product::where("id",$item);
                $product = $query->first();
                if (!$product){
                    return response()->json([
                        "status"=>False,
                        "message"=>"Một sản phẩm không tồn tại",
                    ],404);
                } else { // Tìm thấy, check status;
                    if ($product->status == 1){
                        if ($product->sale == NULL){
                            $total_price += $product->price;
                            $unit_price[] = $product->price;
                        } else {
                            $total_price += $product->sale;
                            $unit_price[] = $product->sale;
                        }
                    } elseif ($product->status == 4){
                        return response()->json([
                            "status"=>False,
                            "message"=>"Sản phẩm ${product->sku} đã được bán"
                        ]);
                    } elseif ($product->status == 3) {
                        return response()->json([
                            "status"=>False,
                            "message"=>"Sản phẩm ${product->sku} đã bị hủy bán"
                        ]);
                    } else {
                        return response()->json([
                            "status"=>False,
                            "message"=>"Sản phẩm ${product->sku} không thể bán"
                        ]);
                    }
                }
            }

            $promotion = Promotion::where("code",$request->promotion_code);
            $discount_amount = 0;
            $discount_value = 0;
            // Kiểm tra xem có nhập hay không
            if (isset($request->promotion_code) && $request->promotion_code != NULL){ // Có nhập
                $promotion_code = $promotion->first();
                if ($promotion->where("status",1)->first()){ // Đang kích hoạt
                    $promotion = $promotion->where("status",1);
                    $code = $promotion->where('start_date', '<=', now())->where('end_date', '>=', now())->first();
                    if ($code){ // Vẫn còn hạn sử dụng
                        $check = Order::where("user_id",$user_id)->where("promo_code",$code)->all(); // Đếm số lần sử dụng promo code
                        if ($check && $code->per_user_limit > count($check)){ //  Tồn tại, quá số lần sử dụng
                            return response()->json([
                                "status"=>False,
                                'message'=>"Bạn đã hết số lần sử dụng mã giảm giá ${code->code}"
                            ]);
                        } else {
                            

                            if ($code->usage_limit == -1 || $code->usage_limit >= $code->total_used) { // Vẫn sử dụng được
                                $discount_value = $code->discount_value;
                                if ($code->min_discount_amount != NULL && $code->max_discount_amount != NULL) {
                                    if ($total_price < $code->min_discount_amount){
                                        return response()->json([
                                            "status"=>False,
                                            'message'=>"Số tiền chưa đạt đến mức được giảm giá",
                                        ]);
                                    } elseif ($total_price >= $code->min_discount_amount && $total_price < $code->max_discount_amount){
                                        $discount_amount  = $total_price * $discount_value;
                                    } elseif ($total_price >= $code->max_discount_amount){
                                        $discount_amount = $code->max_discount_amount * $discount_value;
                                    } else {
                                        return response()->json([
                                            'status'=>False,
                                            "message"=>"Đã xảy ra lỗi"
                                        ],500);
                                    }
                                } elseif ($code->min_discount_amount == NULL && $code->max_discount_amount == NULL){
                                    $discount_amount =  $total_price * $discount_value;
                                } elseif ($code->min_discount_amount == NULL && $code->max_discount_amount != NULL){
                                    if ($total_price >= $code->max_discount_amount){
                                        $discount_amount = $code->max_discount_amount * $discount_value; 
                                    } else {
                                        $discount_amount = $total_price * $discount_value;
                                    }
                                } else if ($code->min_discount_amount != NULL && $code->max_discount_amount == NULL){
                                    if ($total_price < $code->min_discount_amount){
                                        return response()->json([
                                            "status"=>False,
                                            'message'=>"Số tiền chưa đạt đến mức được giảm giá",
                                        ]);
                                    } else {
                                        $discount_amount = $total_price * $discount_value;
                                    }
                                } else {
                                    return response()->json([
                                        "status"=>False,
                                        "message"=>"Đã có lỗi xảy ra"
                                    ], 500);
                                }

                            }
                        }
                    } else {
                        return response()->json([
                            "status"=>False,
                            'message'=>"Mã giảm giá đã hết hạn"
                        ]);
                    }
                } else {
                    return response()->json([
                        "status"=>False,
                        "message"=>"Không tìm thấy mã giảm giá"
                    ]);
                }
            } else {
                // Không nhập mã giảm giá
            }
            

        } catch (\Throwable $th) {
            // throw $th;
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra",
            ],500);
        }
    }
}
