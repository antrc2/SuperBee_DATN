<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateHistory;
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
                            "message"=>"Sản phẩm {$product->sku} đã được bán"
                        ]);
                    } elseif ($product->status == 3) {
                        return response()->json([
                            "status"=>False,
                            "message"=>"Sản phẩm {$product->sku} đã bị hủy bán"
                        ]);
                    } else {
                        return response()->json([
                            "status"=>False,
                            "message"=>"Sản phẩm {$product->sku} không thể bán"
                        ]);
                    }
                }
            }

            $promotion = Promotion::where("code",$request->promotion_code);
            $discount_amount = 0;
            $discount_value = 0;
            // Kiểm tra xem có nhập hay không
            if (isset($request->promotion_code) && $request->promotion_code != NULL){ // Có nhập
                $promotion_code = $promotion->first()->code;
                if ($promotion->where("status",1)->first()){ // Đang kích hoạt
                    $promotion = $promotion->where("status",1);
                    $code = $promotion->where('start_date', '<=', now())->where('end_date', '>=', now())->first();
                    if ($code){ // Vẫn còn hạn sử dụng
                        $check = Order::where("user_id",$user_id)->where("promo_code",$code->code)->get(); // Đếm số lần sử dụng promo code
                        // Ktra xem có bị giới hạn trên 1  người không
                        if ($code->per_user_limit == -1) {
                            $can_use_discount_code = True;
                        } else {
                            if ($code->per_user_limit > count($check)){
                                $can_use_discount_code = True;

                            } else {
                                $can_use_discount_code = False;
                                return response()->json([
                                    "status"=>False,
                                    'message'=>"Bạn đã hết số lần sử dụng mã giảm giá {$code->code}"
                                ]);
                            }
                        }
                        // var_dump($can_use_discount_code);

                        // Kiểm tra xem có bị giới hạn ở trên tất cả người dùng không
                        if ($can_use_discount_code) {
                            if ($code->usage_limit == -1) {
                                $can_use_discount_code = True;
                            } else {
                                $codes = Order::where("promo_code",$code->code)->get();
                                if ($code->usage_limit <= count($codes)){
                                    $can_use_discount_code = False;
                                    return response()->json([
                                        "status"=>False,
                                        "message"=>"Mã giảm giá {$code->code} đã đạt đến giới hạn số lần sử dụng"
                                    ]);
                                } else {
                                    $can_use_discount_code = True;
                                }
                            }
                        }

                        if ($can_use_discount_code){
                            $discount_value = $code->discount_value / 100;
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
                $promotion_code = NULL;
            }

            // Tính tiền
            $total_price_after_discount = $total_price - $discount_amount;
            $wallet = Wallet::where("user_id",$user_id)->first();

            if ($wallet->balance - $total_price_after_discount  < 0){
                return response()->json([
                    "status"=>False,
                    "message"=>"Bạn không đủ số tiền để mua"
                ]);
            }
            // Tính aff
            $affiliate = Affiliate::where('user_id',$user_id)->first();
            $affiliated_by = $affiliate->affiliated_by;
            DB::beginTransaction();
            

            $order = Order::create([
                "user_id"=>$user_id,
                "order_code"=>"ORDER-".$this->generateCode(16),
                "total_amount"=>$total_price,
                "wallet_transaction_id"=>null,
                "status"=>1,
                "promo_code"=>$promotion_code,
                "discount_amount"=>$discount_amount
            ]);

            for ($i=0 ; $i<count($product_id) ; $i++){
                OrderItem::create([
                    "order_id"=>$order->id,
                    "product_id"=>$product_id[$i],
                    "unit_price"=>$unit_price[$i]
                ]);
            }
            $wallet_transaction = WalletTransaction::create([
                "wallet_id"=>$wallet->id,
                "type"=>"purchase",
                "related_id"=>$order->id,
                "related_type"=>"App\Models\Order",
                "status"=>1
            ]);
            Order::where("id",$order->id)->update([
                "wallet_transaction_id"=>$wallet_transaction->id
            ]);
            $wallet->balance -= $total_price_after_discount;
            $wallet->save();


            if ($affiliated_by == null) {
                $aff_recieved = 0;
            } else {
                $aff_recieved = $total_price_after_discount * 5 / 100;
                AffiliateHistory::create([
                    "affiliate_id"=>$affiliate->id,
                    "commission_amount"=>$aff_recieved,
                    "order_id"=>$order->id,
                ]);
            }
            $current_order = Order::with(["items.product",'walletTransaction'])->get();
            
            return response()->json([
                "status"=>True,
                "message"=>"Mua hàng thành công",
                "data"=>$current_order
            ]);

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage(),
                "file" => $th->getFile(),
                "line" => $th->getLine(),
            ], 500);
        }
    }
}
