<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateHistory;
use App\Models\Order;
use App\Models\OrderQueue;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CallbackPartnerController extends Controller
{
    public function recieve_money(Request $request){
        try {
            if (!$request->hasHeader('Authorization')) {
                return response()->json([
                    "status" => false,
                    "message" => "Authorization header is missing",
                ], 401);
            }
            $authHeader = $request->header('Authorization');
            if ($authHeader !== "Bearer " . env('PYTHON_TOKEN')) {
                return response()->json([
                    "status" => false,
                    "message" => "Unauthorized",
                ], 401);
            }
            $response = $request->data;
            // $order_queue = OrderQueue::with('order.items')->where("id",$response['id'])->first();
            
            $order = Order::with("queue")->with("items.product")->where("id",$response['order_id'])->first();
            // Tính aff:
            // return response()->json(["hehe"=>$order]);
            $user_id = $order->user_id;
            $affiliate = Affiliate::where('user_id',$user_id)->first();
            
            
            DB::beginTransaction();
            if ($affiliate == null){
                // Khong được ai giới thiệu
            } else {
                // Có ng giới thiệu
                $affiliated_by = $affiliate->affiliated_by;
                $affiliate_by_wallet = Wallet::where("user_id",$affiliated_by)->first();
                $commission_amount = $order->total_amount * 5 / 100;
                $affiliate_history = AffiliateHistory::create([
                    "affiliate_id"=>$affiliate->id,
                    "commission_amount"=>$commission_amount,
                    "order_id"=>$order->id
                ]);
                $affiliate_by_wallet->balance += $commission_amount;
                $affiliate_by_wallet->save();

                WalletTransaction::create([
                    "wallet_id"=>$affiliate_by_wallet->id,
                    "type"=>"commission",
                    "amount"=>$commission_amount,
                    "related_id"=>$affiliate_history->id,
                    "related_type"=>"App\Models\AffiliateHistory",
                    "status"=>1
                ]);
                
            }

            // Người bán nhận tiền
            foreach ($order->items as $item){
                $import_price = $item->product->import_price;
                $created_by = $item->product->created_by;
                $product_id = $item->product->id;
                $wallet = Wallet::where("user_id",$created_by)->first();
                $wallet->balance += $import_price;
                $wallet->save();
                WalletTransaction::create([
                    "wallet_id"=>$wallet->id,
                    "type"=>"sell",
                    "amount"=>$import_price,
                    "related_id"=> $product_id,
                    "related_type"=>"App\Models\Product",
                    "status"=>1
                ]);
            }
            OrderQueue::where("id",$response['id'])->update([
                "status"=>1
            ]);



            
            // $user_id = $order_queue->order_item->product->created_by;
            // // $order_id = $order_queue->order_item->order->id;
            // // $order = $order_queue
            // $amount = $order_queue->amount;
            // $wallet = Wallet::where("user_id",$user_id)->first();
            // DB::beginTransaction();
            // $wallet->balance += $amount;
            // $wallet->save();
            // WalletTransaction::create([
            //     "wallet_id"=>$wallet->id,
            //     "type"=>"sell",
            //     "amount"=>$amount,
            //     "related_id"=>$response['id'],
            //     "related_type"=>"App\Models\OrderQueue",
            //     "status"=>1
            // ]);
            // $order_queue->status = 1;
            // $order_queue->save();
            DB::commit();
            return response()->json([
                "status"=>True,
                "message"=>"Thành công",
            ],200);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra",
                "hehe"=>$th->getMessage(),
                "line"=>$th->getLine()
            ],500);
        }
    }
}
