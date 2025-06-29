<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use App\Models\RechargeCard;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class CardController extends Controller
{
    public function callback(Request $request)
    {
        try {
            $sign = $request->callback_sign;
            $recharge_card = RechargeCard::where("sign", $sign)->first();
            $recharge_card_id = $recharge_card->id;
            $status = $request->status;
            $message = $request->message;
            $value = $request->value;
            $amount = $request->amount;
            $declared_value = $request->declared_value;
            $donate_promotion_id = $recharge_card->donate_promotion_id;

            if (!$recharge_card) {
                return;
            }
            $user_id = $recharge_card->user_id;
            $web_id = $recharge_card->web_id;
            $user_info = User::with("wallet")->where("id", $user_id)->first();
            $wallet_id = $user_info->wallet->id;
            if ($donate_promotion_id !== NULL) {
                $donate_promotion_amount = DonatePromotion::where("id",$donate_promotion_id)->first()->amount;
                $bonus = $amount * ($donate_promotion_amount / 100);
                $amount += $bonus;
            }
            if ($declared_value == $value) { // Thẻ đúng




                $wallet_transaction = WalletTransaction::create(
                    [
                        "wallet_id" => $wallet_id,
                        "type" => "recharge_card",
                        "amount" => $amount,
                        "related_id" => $recharge_card->id,
                        "related_type" => "App\Models\RechargeCard"
                    ]
                );
                $wallet = Wallet::find($wallet_id);
                $wallet->increment('balance', $amount);
                $wallet_transaction_id = $wallet_transaction->id;
            } elseif ($value == 0) { // Thẻ sai
                $wallet_transaction = WalletTransaction::create(
                    [
                        "wallet_id" => $wallet_id,
                        "type" => "recharge_card",
                        "amount" => 0,
                        "related_id" => $recharge_card->id,
                        "related_type" => "App\Models\RechargeCard"
                    ]
                );
                $wallet_transaction_id = $wallet_transaction->id;
            } else { // Thẻ đúng nhưng sai mệnh giá
                $wallet_transaction = WalletTransaction::create(
                    [
                        "wallet_id" => $wallet_id,
                        "type" => "recharge_card",
                        "amount" => $amount,
                        "related_id" => $recharge_card->id,
                        "related_type" => "App\Models\RechargeCard"
                    ]
                );
                $wallet_transaction_id = $wallet_transaction->id;
            }
            RechargeCard::where("id", $recharge_card_id)->update([
                "wallet_transaction_id" => $wallet_transaction_id,
                "amount" => $amount,
                "value" => $value,
                "declared_value" => $declared_value,
                "status" => $status,
                'message' => $message,
            ]);
            return;
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra"
            ],500);
            //throw $th;
            // return response()->json([
            //     "hehe" => $th->getMessage()
            // ]);
            // return;
        }
    }
    public function store(Request $request)
    {

        // Dữ liệu gửi vào đây nhé 
        // {
        //     "telco": "VIETTEL",
        //     "amount": 10000,
        //     "serial": "2161199621343",
        //     "code": "369404179833759"
        // }


        try {
            $validate_data = Validator::make($request->all(), [
                "telco" => "required|string",
                "amount" => "required|integer",
                "serial" => "required|string",
                "code" => "required|string"
            ]);

            if ($validate_data->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    // 'errors' => $validate_data->errors()
                ], 422);
            }

            $donate_promotion = DonatePromotion::where("web_id", $request->web_id)->where("start_date", "<=", now())->where("end_date", ">", now())->where('status', 1)->orderBy('id', 'desc')->first();
            if ($donate_promotion !== NULL) {
                $donate_promotion_id = $donate_promotion->id;
            } else {
                $donate_promotion_id = NULL;
            }
            $partner_id = env('PARTNER_ID');
            $partner_key = env('PARTNER_KEY');
            $sign = md5($partner_key . $request->code . $request->serial);
            $dataPost = [];
            $dataPost['request_id'] = rand(100000000, 999999999); //Mã đơn hàng của bạn
            $dataPost['code'] = $request->code;
            $dataPost['partner_id'] = $partner_id;
            $dataPost['serial'] = $request->serial;
            $dataPost['telco'] = $request->telco;
            $dataPost['amount'] = $request->amount;
            $dataPost['command'] = 'charging';  // NẠP THẺ
            $dataPost['sign'] = $sign;
            // DB::beginTransaction();
            $response = Http::post('https://doithe1s.vn/chargingws/v2', $dataPost);
            $response = $response->json();
            if ($response['status'] == 99) {
                RechargeCard::create([
                    'amount' => $response['amount'],
                    "value" => 0,
                    "declared_value" => $response['declared_value'],
                    "telco" => $response['telco'],
                    "serial" => $response['serial'],
                    "code" => $response['code'],
                    "status" => $response['status'],
                    "message" => $response['message'],
                    "user_id" => $request->user_id,
                    "web_id" => $request->web_id,
                    'sign' => $sign,
                    "wallet_transaction_id" => null,
                    "donate_promotion_id" => $donate_promotion_id
                ]);
                if ($donate_promotion_id != NULL) {
                    $response['donate_promotion_id'] = $donate_promotion_id;
                }
                return response()->json([
                    "status" => True,
                    "message" => "Đang xử lí thẻ cào",
                    "data" => $response
                ], 200);
            } else {
                return response()->json([
                    'status' => False,
                    "message" => $response['message'],
                    "status_code" => $response['status']
                ], 400);
            }



            // DB::commit();
        } catch (\Throwable $th) {
            // DB::rollBack();
            return response()->json([
                'status' => False,
                'message' => 'Đã có lỗi xảy ra',
                // "response" => $th->getMessage()
            ], 500);
        }
    }
}
