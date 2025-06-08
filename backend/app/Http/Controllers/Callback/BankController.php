<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use App\Models\RechargeBank;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdraw;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function callback(Request $request)
    {
        // Dữ liệu nhận về
        // {
        //     "postingDate": "09/06/2025 00:01:00",
        //     "transactionDate": "08/06/2025 00:23:11",
        //     "accountNo": "0838411897",
        //     "creditAmount": "4000",
        //     "debitAmount": "0",
        //     "currency": "VND",
        //     "description": "CUSTOMER Nguyen Ngoc An tu Liobank   Ma giao  dich  Trace341385 Trace 341385",
        //     "addDescription": "Nguyen Ngoc An tu Liobank   Ma giao  dich  Trace341385 Trace 341385 ",
        //     "availableBalance": "352420",
        //     "beneficiaryAccount": "",
        //     "refNo": "FT25160578165854",
        //     "benAccountName": "",
        //     "bankName": "",
        //     "benAccountNo": "",
        //     "dueDate": "",
        //     "docId": "",
        //     "transactionType": "ACSM",
        //     "pos": "",
        //     "tracingType": ""
        // },


        try {
            if ($request->token !== env("BANK_TOKEN")) {
            return response()->json([
                "status" => False,
                "message" => "Can't access to here",
            ], 403);
        }
        $add_description = explode(" ",$request->addDescription);
        if ($request->creditAmount !== 0) { // Nhận tiền
            foreach ($add_description as $donate_code){
                $user = User::where("donate_code",$donate_code)->with('wallet')->first();
                if (!$user){
                    // Không tìm thấy thông tin về user theo donate_code
                } else {
                    $user_id = $user->id;
                    $web_id = $user->web_id;
                    $wallet_id = $user->wallet->id;

                    $donate_promotion = DonatePromotion::where("web_id", $web_id)->where("start_date", "<=", now())->where("end_date", ">", now())->where('status', 1)->orderBy('id', 'desc')->first();
                    if ($donate_promotion !== NULL){
                        $donate_promotion_id = $donate_promotion->id;
                        $donate_promotion_amount = $donate_promotion->amount;
                        
                    } else {
                        $donate_promotion_id = NULL;
                        $donate_promotion_amount = 0;
                    }

                    $amount = $request->creditAmount;
                    $bonus = $amount * ($donate_promotion_amount / 100);
                    $amount += $bonus;
                    $wallet_transaction = WalletTransaction::create([
                        "wallet_id"=>$wallet_id,
                        "type"=>"recharge_bank",
                        "amount"=>$amount,
                        "related_type"=> "App\Models\RechargeBank"
                    ]);

                    $wallet_transaction_id = $wallet_transaction->id;
                    $wallet = Wallet::find($wallet_id);
                    $wallet->increment('balance', $amount);
                    $recharge_bank =  RechargeBank::create([
                        'wallet_transaction_id' => $wallet_transaction_id,
                        "user_id"=>$user_id,
                        "web_id"=>$web_id,
                        'amount'=>$amount,
                        "transaction_reference"=>$request->refNo,
                        "status"=>1,
                        "donate_promotion_id"=>$donate_promotion_id
                    ]);

                    WalletTransaction::where("id",$wallet_transaction_id)->update(
                        [
                            "related_id"=>$recharge_bank->id
                        ]
                        );

                    return response()->json([
                        "status"=>True,
                        "message"=>"Nạp thẻ thành công"
                    ]);
                }
            }
            return response()->json([
                "status"=>False,
                "Không tìm thấy người dùng"
            ]);
        } else { // Rút tiền
            foreach ($add_description as $withdraw_code){
                $withdraw = Withdraw::with("user.wallet")->where("withdraw_code",$withdraw_code);
                if (!$withdraw){
                    // Không tìm thấy thông tin về user theo withdraw_code
                } else {
                    $user_id = $withdraw->user->id;
                    $web_id = $withdraw->user->web_id;
                    $wallet_id = $withdraw->user->wallet->id;



                    break;
                }
            }
        }
        } catch (\Throwable $th) {
            return response()->json([
                "error"=>$th->getMessage()
            ]);
        }
        
    }
}
