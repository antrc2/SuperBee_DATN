<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateHistory;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserOrderController extends Controller
{
    private function total_used_promotion_code($promotion_code, $user_id = 0)
    {
        $query = Order::where("promo_code", $promotion_code);
        if ($user_id !== 0) {
            $query->where("user_id", $user_id);
        }
        return count($query->get());
    }
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
    public function index(Request $request)
    {
        try {
            $user_id = $request->user_id;
            $orders = Order::with(['items.product.category', 'items.product.images', 'promotion'])->where('user_id', $user_id)->get();
            return response()->json([
                'status' => True,
                "message" => "Lấy danh sách đơn hàng thành công",
                "data" => $orders
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra",
                'data' => []
            ]);
        }
    }
    public function show(Request $request, $id)
    {
        try {
            $user_id = $request->user_id;
            $order = Order::with(['items.product.category', 'items.product.gameAttributes', 'items.product.credentials', 'items.product.images'])->where('user_id', $user_id)->where('id', $id)->first();
            return response()->json([
                "status" => True,
                "message" => "Lấy đơn hàng thành công",
                'data' => $order
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                "message" => "Đã xảy ra lỗi",
                "data" => []
            ], 500);
        }
    }

    private function get_cart_and_total_price($user_id)
    {
        try {
            $cart = Cart::where("user_id", $user_id)->with('items')->with('items.product.gameAttributes')->with('items.product.images')->first();
            if ($cart == null) {
                return [
                    "status" => False,
                    "message" => "Không tìm thấy giỏ hàng",
                    "carts" => [],
                    "total_price" => 0,
                    "status_code" => 404
                ];
            } else {
                $total_price = 0;
                $cart_items = CartItem::where("cart_id", $cart->id)->with('product')->where('status', 1)->get();
                foreach ($cart_items as $cart_item) {
                    if ($cart_item->product->status == 1) {
                        $price = $cart_item->product->sale ?? $cart_item->product->price;
                        $total_price += $price;
                        $cart_item->unit_price = $price;
                    } else {
                        return [
                            "status" => False,
                            "message" => "Một sản phẩm không tồn tại",
                            "carts" => [],
                            "total_price" => 0,
                            "status_code" => 404
                        ];
                    }
                }
                return [
                    "status" => True,
                    "message" => "Lấy giỏ hàng và tổng giá thành công",
                    "carts" => $cart_items,
                    "total_price" => $total_price,
                    "status_code" => 200
                ];
            }
        } catch (\Throwable $th) {
            // return ;
            return [
                "status" => False,
                "message" => "Đã có lỗi xảy ra",
                "carts" => [],
                "total_price" => 0,
                "status_code" => 500,
            ];
        }
    }


    private function check_promotion_from_cart($user_id, $promotion_code)
    {
        try {
            $cart = $this->get_cart_and_total_price($user_id);
            $total_price = $cart['total_price'];

            if (!$cart['status']) {
                return [
                    "status" => false,
                    "message" => "Giỏ hàng không hợp lệ",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            // Kiểm tra có nhập mã giảm giá hay không
            if ($promotion_code == null) {
                return [
                    "status" => false,
                    "message" => "Vui lòng nhập mã giảm giá",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            $promotion = Promotion::where("code", $promotion_code)->first();

            if ($promotion == null) {
                return [
                    "status" => false,
                    "message" => "Mã giảm giá {$promotion_code} không tồn tại",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 404
                ];
            }

            if ($promotion->status != 1) {
                return [
                    "status" => false,
                    "message" => "Mã giảm giá {$promotion_code} không tồn tại",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 404
                ];
            }

            if ($promotion->start_date > now()) {
                return [
                    "status" => false,
                    'message' => "Chưa đến hạn sử dụng mã giảm giá {$promotion_code}",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            if ($promotion->end_date < now()) {
                return [
                    "status" => false,
                    'message' => "Đã quá hạn sử dụng mã giảm giá {$promotion_code}",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            $total_used_user = $this->total_used_promotion_code($promotion_code, $user_id);
            if ($promotion->user_id != -1 && $promotion->user_id !== $user_id) {
                return [
                    "status" => false,
                    "message" => "Mã giảm giá {$promotion_code} không tồn tại",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 404
                ];
            }
            if ($total_used_user >= $promotion->per_user_limit) {
                return [
                    'status' => false,
                    "message" => "Bạn đã hết số lần sử dụng mã giảm giá {$promotion_code}",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            if ($total_used_user >= $promotion->usage_limit) {
                return [
                    "status" => false,
                    "message" => "Mã giảm giá {$promotion_code} đã hết số lần sử dụng",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 400
                ];
            }

            $discount_value = $promotion->discount_value / 100;
            $discount_amount = 0;

            // Xử lý điều kiện min, max
            if ($promotion->min_discount_amount != null && $promotion->max_discount_amount != null) {
                if ($total_price < $promotion->min_discount_amount) {
                    return [
                        "status" => false,
                        "message" => "Số tiền chưa đạt đến mức được giảm giá",
                        "promotion_code" => $promotion_code,
                        "discount_amount" => 0,
                        "discount_value" => 0,
                        "total_price_after_discount" => $total_price,
                        "status_code" => 400
                    ];
                } elseif ($total_price >= $promotion->min_discount_amount && $total_price <= $promotion->max_discount_amount) {
                    $discount_amount = $total_price * $discount_value;
                } elseif ($total_price > $promotion->max_discount_amount) {
                    $discount_amount = $promotion->max_discount_amount * $discount_value;
                }
            } elseif ($promotion->min_discount_amount == null && $promotion->max_discount_amount == null) {
                $discount_amount = $total_price * $discount_value;
            } elseif ($promotion->min_discount_amount == null && $promotion->max_discount_amount != null) {
                if ($total_price > $promotion->max_discount_amount) {
                    $discount_amount = $promotion->max_discount_amount * $discount_value;
                } else {
                    $discount_amount = $total_price * $discount_value;
                }
            } elseif ($promotion->min_discount_amount != null && $promotion->max_discount_amount == null) {
                if ($total_price < $promotion->min_discount_amount) {
                    return [
                        "status" => false,
                        "message" => "Số tiền chưa đạt đến mức được giảm giá",
                        "promotion_code" => $promotion_code,
                        "discount_amount" => 0,
                        "discount_value" => 0,
                        "total_price_after_discount" => $total_price,
                        "status_code" => 400
                    ];
                } else {
                    $discount_amount = $total_price * $discount_value;
                }
            } else {
                return [
                    "status" => false,
                    "message" => "Đã có lỗi xảy ra",
                    "promotion_code" => $promotion_code,
                    "discount_amount" => 0,
                    "discount_value" => 0,
                    "total_price_after_discount" => $total_price,
                    "status_code" => 500
                ];
            }

            return [
                "status" => true,
                'message' => "Áp dụng mã giảm giá {$promotion_code} thành công",
                "promotion_code" => $promotion_code,
                "discount_amount" => $discount_amount,
                "discount_value" => $discount_value,
                "total_price_after_discount" => $total_price - $discount_amount,
                "status_code" => 200,
            ];
        } catch (\Throwable $th) {
            // Lưu ý: nếu lỗi, không biết promotion_code, discount_value... => để default
            return [
                "status" => false,
                "message" => "Đã xảy ra lỗi hệ thống",
                "promotion_code" => $promotion_code,
                "discount_amount" => 0,
                "discount_value" => 0,
                "total_price_after_discount" => 0,
                "status_code" => 500
            ];
        }
    }


    public function check_promotion(Request $request)
    {
        try {
            return response()->json($this->check_promotion_from_cart($request->user_id, $request->promotion_code));
        } catch (\Throwable $th) {
            return [
                "status" => false,
                "message" => "Đã xảy ra lỗi hệ thống",
                "promotion_code" => $request->promotion_code,
                "discount_amount" => 0,
                "discount_value" => 0,
                "total_price_after_discount" => 0,
                "status_code" => 500
            ];
        }
    }
    public function checkout(Request $request)
    {
        try {
            // $this->total_used_promotion_code();
            // $this->get_cart_and_total_price();
            // $this->check_promotion();
            // return response()->json($this->get_cart_and_total_price($request->user_id));
        } catch (\Throwable $th) {
            //throw $th;
        }
    }


    // public function store(Request $request){
    //     try {
    //         $user_id = $request->user_id;
    //         $product_id = $request->product_id;
    //         $cart = Cart::with('items')->where("user_id",$user_id)->first();

    //         if ($cart == null){
    //             return response()->json([
    //                 "status"=>False,
    //                 "message"=>"Bạn không có sản phẩm nào trong giỏ hàng"
    //             ]);
    //         }
    //         $validator = Validator::make($request->all(), [
    //             'product_id' => 'required|array|min:1',
    //         ]);

    //         if ($validator->fails()) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Dữ liệu không hợp lệ',
    //             ], 422);
    //         }

    //         $total_price = 0;
    //         $unit_price = [];

    //         foreach ($product_id as $item){
    //             if (CartItem::where('product_id',$item)->first() == null) {
    //                 return response()->json([
    //                     "status"=>False,
    //                     "message"=>"Một sản phẩm không tồn tại"
    //                 ]);
    //             }
    //             $query = Product::where("id",$item);
    //             $product = $query->first();
    //             if (!$product){
    //                 return response()->json([
    //                     "status"=>False,
    //                     "message"=>"Một sản phẩm không tồn tại",
    //                 ],404);
    //             } else { // Tìm thấy, check status;
    //                 if ($product->status == 1){
    //                     if ($product->sale == NULL){
    //                         $total_price += $product->price;
    //                         $unit_price[] = $product->price;
    //                     } else {
    //                         $total_price += $product->sale;
    //                         $unit_price[] = $product->sale;
    //                     }
    //                 } elseif ($product->status == 4){
    //                     return response()->json([
    //                         "status"=>False,
    //                         "message"=>"Sản phẩm {$product->sku} đã được bán"
    //                     ]);
    //                 } elseif ($product->status == 3) {
    //                     return response()->json([
    //                         "status"=>False,
    //                         "message"=>"Sản phẩm {$product->sku} đã bị hủy bán"
    //                     ]);
    //                 } else {
    //                     return response()->json([
    //                         "status"=>False,
    //                         "message"=>"Sản phẩm {$product->sku} không thể bán"
    //                     ]);
    //                 }
    //             }
    //         }
    //         $promotion = Promotion::where("code",$request->promotion_code);
    //         $discount_amount = 0;
    //         $discount_value = 0;
    //         // Kiểm tra xem có nhập hay không
    //         if (isset($request->promotion_code) && $request->promotion_code != NULL){ // Có nhập
    //             $promotion_code = $promotion->first()->code;
    //             if ($promotion->where("status",1)->first()){ // Đang kích hoạt
    //                 $promotion = $promotion->where("status",1);
    //                 $code = $promotion->where('start_date', '<=', now())->where('end_date', '>=', now())->first();
    //                 if ($code){ // Vẫn còn hạn sử dụng
    //                     $check = Order::where("user_id",$user_id)->where("promo_code",$code->code)->get(); // Đếm số lần sử dụng promo code
    //                     // Ktra xem có bị giới hạn trên 1  người không
    //                     if ($code->per_user_limit == -1) {
    //                         $can_use_discount_code = True;
    //                     } else {
    //                         if ($code->per_user_limit > count($check)){
    //                             $can_use_discount_code = True;

    //                         } else {
    //                             $can_use_discount_code = False;
    //                             return response()->json([
    //                                 "status"=>False,
    //                                 'message'=>"Bạn đã hết số lần sử dụng mã giảm giá {$code->code}"
    //                             ]);
    //                         }
    //                     }
    //                     // var_dump($can_use_discount_code);

    //                     // Kiểm tra xem có bị giới hạn ở trên tất cả người dùng không
    //                     if ($can_use_discount_code) {
    //                         if ($code->usage_limit == -1) {
    //                             $can_use_discount_code = True;
    //                         } else {
    //                             $codes = Order::where("promo_code",$code->code)->get();
    //                             if ($code->usage_limit <= count($codes)){
    //                                 $can_use_discount_code = False;
    //                                 return response()->json([
    //                                     "status"=>False,
    //                                     "message"=>"Mã giảm giá {$code->code} đã đạt đến giới hạn số lần sử dụng"
    //                                 ]);
    //                             } else {
    //                                 $can_use_discount_code = True;
    //                             }
    //                         }
    //                     }

    //                     if ($can_use_discount_code){
    //                         $discount_value = $code->discount_value / 100;
    //                         if ($code->min_discount_amount != NULL && $code->max_discount_amount != NULL) {
    //                             if ($total_price < $code->min_discount_amount){
    //                                 return response()->json([
    //                                     "status"=>False,
    //                                     'message'=>"Số tiền chưa đạt đến mức được giảm giá",
    //                                 ]);
    //                             } elseif ($total_price >= $code->min_discount_amount && $total_price < $code->max_discount_amount){
    //                                 $discount_amount  = $total_price * $discount_value;
    //                             } elseif ($total_price >= $code->max_discount_amount){
    //                                 $discount_amount = $code->max_discount_amount * $discount_value;
    //                             } else {
    //                                 return response()->json([
    //                                     'status'=>False,
    //                                     "message"=>"Đã xảy ra lỗi"
    //                                 ],500);
    //                             }
    //                         } elseif ($code->min_discount_amount == NULL && $code->max_discount_amount == NULL){
    //                             $discount_amount =  $total_price * $discount_value;
    //                         } elseif ($code->min_discount_amount == NULL && $code->max_discount_amount != NULL){
    //                             if ($total_price >= $code->max_discount_amount){
    //                                 $discount_amount = $code->max_discount_amount * $discount_value; 
    //                             } else {
    //                                 $discount_amount = $total_price * $discount_value;
    //                             }
    //                         } else if ($code->min_discount_amount != NULL && $code->max_discount_amount == NULL){
    //                             if ($total_price < $code->min_discount_amount){
    //                                 return response()->json([
    //                                     "status"=>False,
    //                                     'message'=>"Số tiền chưa đạt đến mức được giảm giá",
    //                                 ]);
    //                             } else {
    //                                 $discount_amount = $total_price * $discount_value;
    //                             }
    //                         } else {
    //                             return response()->json([
    //                                 "status"=>False,
    //                                 "message"=>"Đã có lỗi xảy ra"
    //                             ], 500);
    //                         }
    //                     }

    //                 } else {
    //                     return response()->json([
    //                         "status"=>False,
    //                         'message'=>"Mã giảm giá đã hết hạn"
    //                     ]);
    //                 }
    //             } else {
    //                 return response()->json([
    //                     "status"=>False,
    //                     "message"=>"Không tìm thấy mã giảm giá"
    //                 ]);
    //             }
    //         } else {
    //             // Không nhập mã giảm giá
    //             $promotion_code = NULL;
    //         }

    //         // Tính tiền
    //         $total_price_after_discount = $total_price - $discount_amount;
    //         $wallet = Wallet::where("user_id",$user_id)->first();

    //         if ($wallet->balance - $total_price_after_discount  < 0){
    //             return response()->json([
    //                 "status"=>False,
    //                 "message"=>"Bạn không đủ số tiền để mua"
    //             ]);
    //         }
    //         // Tính aff
    //         $affiliate = Affiliate::where('user_id',$user_id)->first();
    //         $affiliated_by = $affiliate->affiliated_by;
    //         DB::beginTransaction();
    //         $wallet_transaction = WalletTransaction::create([
    //             "wallet_id"=>$wallet->id,
    //             "type"=>"purchase",
    //             "related_id"=>null,
    //             "related_type"=>"App\Models\Order",
    //             "status"=>1,
    //             "amount"=> $total_price_after_discount
    //         ]);

    //         $order = Order::create([
    //             "user_id"=>$user_id,
    //             "order_code"=>"ORDER-".$this->generateCode(16),
    //             "total_amount"=>$total_price,
    //             "wallet_transaction_id"=>$wallet_transaction->id,
    //             "status"=>1,
    //             "promo_code"=>$promotion_code,
    //             "discount_amount"=>$discount_amount
    //         ]);
    //         // return response()->json([
    //         //     "hehe"=>$order
    //         // ]);
    //         for ($i=0 ; $i<count($product_id) ; $i++){
    //             OrderItem::create([
    //                 "order_id"=>$order->id,
    //                 "product_id"=>$product_id[$i],
    //                 "unit_price"=>$unit_price[$i]
    //             ]);
    //             CartItem::where('product_id',$product_id[$i])->delete();
    //         }
    //         $cart = Cart::where("user_id",$user_id)->with('items')->first();
    //         if (count($cart->items) == 0) {
    //             Cart::where("id",$cart->id)->delete();
    //         }

    //         WalletTransaction::where("id",$wallet_transaction->id)->update([
    //             'related_id'=>$order->id
    //         ]);
    //         // Order::where("id",$order->id)->update([
    //         //     "wallet_transaction_id"=>$wallet_transaction->id
    //         // ]);
    //         $wallet->balance -= $total_price_after_discount;
    //         $wallet->save();


    //         if ($affiliated_by == null) {
    //             $aff_recieved = 0;
    //         } else {
    //             $aff_recieved = $total_price_after_discount * 5 / 100;
    //             AffiliateHistory::create([
    //                 "affiliate_id"=>$affiliate->id,
    //                 "commission_amount"=>$aff_recieved,
    //                 "order_id"=>$order->id,
    //             ]);
    //             $wallet_aff = Wallet::where("user_id",$affiliated_by)->get();
    //             $wallet_aff->balance  += $aff_recieved;
    //             $wallet_aff->save();

    //             WalletTransaction::create([
    //                 "wallet_id"=>$wallet_aff->id,
    //                 'type'=>"commission",
    //                 "amount"=>$aff_recieved,
    //                 "related_id"=>$wallet_aff->id,
    //                 "related_type"=>"App\Models\AffiliateHistory",
    //                 "status"=>1
    //             ]);
    //         }
    //         $current_order = Order::with(["items.product",'walletTransaction'])->where('id',$order->id)->get();

    //         DB::commit();
    //         return response()->json([
    //             "status"=>True,
    //             "message"=>"Mua hàng thành công",
    //             "data"=>$current_order
    //         ]);
    //     } catch (\Throwable $th) {
    //         DB::rollBack();
    //         return response()->json([
    //             "status" => false,
    //             "message" => "Đã có lỗi xảy ra"
    //         ], 500);
    //     }
    // }
}
