<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
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
            $order_queue = OrderQueue::with('order_item.product')->where("id",$response['id'])->first();
            $user_id = $order_queue->order_item->product->created_by;
            $amount = $order_queue->amount;
            $wallet = Wallet::where("user_id",$user_id)->first();
            DB::beginTransaction();
            $wallet->balance += $amount;
            $wallet->save();
            WalletTransaction::create([
                "wallet_id"=>$wallet->id,
                "type"=>"sell",
                "amount"=>$amount,
                "related_id"=>$response['id'],
                "related_type"=>"App\Models\OrderQueue",
                "status"=>1
            ]);
            $order_queue->status = 1;
            $order_queue->save();
            DB::commit();
            return response()->json([
                "status"=>True,
                "message"=>"Thành công",
            ],200);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra"
            ],500);
        }
    }
}
