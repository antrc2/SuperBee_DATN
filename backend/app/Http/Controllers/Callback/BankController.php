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
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Callback\CommonController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class BankController extends Controller
{   
    public function donate(Request $request){
        try {
            if ($request->header('Authorization') !== "Apikey ".env("SEPAY_API_TOKEN")){
                return response()->json([
                    "status"=>false,
                    'message'=>"Fail to callback"
                ],403);
            };
            $contents = explode(" ", $request->content);
            $frontend_link = env("FRONTEND_URL");
            foreach ($contents as $donate_code){
                $user = User::where("donate_code",$donate_code)->with('wallet')->first();
                if (!$user){
                    // Không tìm thấy thông tin về user theo donate_code
                } else {
                    $user_id = $user->id;
                    $web_id = $user->web_id;
                    $wallet_id = $user->wallet->id;
                    $donate_promotion = DonatePromotion::where("web_id", $web_id)->where("start_date", "<=", $request->transactionDate)->where("end_date", ">", $request->transactionDate)->where('status', 1)->orderBy('id', 'desc')->first();
                    $result = $this->donate_promotion($donate_promotion,$user_id);
                    $donate_promotion_id = $result['donate_promotion_id'];
                    $donate_promotion_amount = $result['donate_promotion_amount'];
                    $amount = $request->transferAmount;
                    $donate_amount = $amount;
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
                    $wallet->increment('balance', $donate_amount);
                    $wallet->increment('promotion_balance', $bonus);
                    $recharge_bank =  RechargeBank::create([
                        'wallet_transaction_id' => $wallet_transaction_id,
                        "user_id"=>$user_id,
                        "web_id"=>$web_id,
                        'amount'=>$amount,
                        "transaction_reference"=>$request->referenceCode,
                        "status"=>1,
                        "donate_promotion_id"=>$donate_promotion_id,
                        // "donate_amount"=>$donate_amount
                    ]);
                    WalletTransaction::where("id",$wallet_transaction_id)->update(
                        [
                            "related_id"=>$recharge_bank->id
                        ]
                        );
                    $this->sendNotification(1,"Nạp {$amount} thành công",$frontend_link . "/info/transactions",$user_id);
                    return response()->json([
                        "status"=>True,
                        "success"=>True,
                        "message"=>"Nạp thẻ thành công"
                    ], 200);
                }
            }
            return response()->json([
                "status"=>False,
                'success'=>True,
                "message"=>"Không tìm thấy giao dịch liên quan"
            ], 200);
            
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>false,
                "message"=>"Đã có lỗi xảy ra"
            ],500);
            // return response()->json(['error' => 'Internal Server Error'], 500);
            // return response()->json([
            //     "error"=>$th->getMessage()
            // ]);
        }
    }

    public function withdraw(Request $request){
        try {
            if ($request->header('Authorization') !== "Apikey ".env("SEPAY_API_TOKEN")){
                return response()->json([
                    "status"=>false,
                    'message'=>"Fail to callback"
                ],403);
            };
            // return response()->json([
            //     "hehe"=>$request->withdraw_code
            // ]);
            DB::beginTransaction();
            $withdraw = Withdraw::where("withdraw_code",$request->withdraw_code)->with("user")->first();
            if ($withdraw == null) {

                // return "{'hehe'=>'không tìm thấy withdrawcode tương ứng'}";
                return response()->json([
                    "hehe"=>"Không tìm thấy withdraw_code {$request->withdraw_code} tương ứng"
                ]);
            }
            // $wallet = Wallet::where("user_id",$withdraw->user_id)->first();
            if ($request->status){
                $withdraw->status = 1;
                // $withdraw->note = $request->message;
                $this->sendNotification(1,"Rút {$withdraw->amount} thành công",null,$withdraw->user->id);
                WalletTransaction::create([
                    "wallet_id"=>$withdraw->user->id,
                    "type"=>'withdraw',
                    'related_id'=>$withdraw->id,
                    "related_type"=>"App\Models\Withdraw",
                    "amount"=>$withdraw->amount,
                    'status'=>1
                ]);
            } else {
                $withdraw->status = 3;
                $withdraw->note = $request->message;
            }
            $withdraw->save();
            DB::commit();
            return response()->json([
                "status"=>True,
                'message'=>$request->message
            ]);


            // $withdraw = Withdraw::where('withdraw_code',$request->withdraw)
            // $python_url = env("PYTHON_API");
            // $bulks = Http::get("{$python_url}/transaction/bulk_payment")->json();
            // Log::info(['bulks'=>$bulks['data']]);
            // foreach ($bulks['data'] as $bulk){
            //     // Log::info(['bulk_details'=>$bulk]);
            //     $bulk_details = Http::get("{$python_url}/transaction/bulk_payment_detail/{$bulk['bulkId']}")->json();
                
            //     foreach ($bulk_details['data'] as $bulk_detail){
            //         $detailDescription = $bulk_detail['detailDescription'];
            //         $withdraw = Withdraw::where("withdraw_code",$detailDescription)->first();
            //         if ($withdraw != NULL) { // Tìm thấy
            //             DB::beginTransaction();

            //             $withdraw->status = 1;
            //             // $withdraw->save();
            //             $wallet = Wallet::where('user_id',$withdraw->user_id)->first();
            //             $wallet_transaction = WalletTransaction::create([
            //                 'wallet_id'=>$wallet->id,
            //                 "type"=>"withdraw",
            //                 "amount"=>$withdraw->amount,
            //                 "related_id"=>$withdraw->id,
            //                 "related_type"=>"App\Models\Withdraw",
            //                 'status'=>1
            //             ]);

            //             $withdraw->wallet_transaction_id = $wallet_transaction->id;
            //             $withdraw->save();
            //             DB::commit();
            //             return response()->json([
            //                 'success'=>True,
            //             ]);
                        
            //         }
            //     }    
            // }
            // Ghi dữ liệu từ request vào file log
            // Log::info('Withdraw request data:', [
            //     'request' => $request->all(),
            //     'content' => $request->content,
            //     'transferType' => $request->transferType,
            //     'transferAmount' => $request->transferAmount,
            //     'referenceCode' => $request->referenceCode,
            //     'transactionDate' => $request->transactionDate,
            //     // ''
            //     'token' => $request->token,
            // ]);
            // $contents = explode(" ",$request->content);
            // foreach ($contents as $withdraw_code){
            //     // echo $withdraw_code;
            //     $withdraw = Withdraw::with('user.wallet')->where("withdraw_code",$withdraw_code)->where("status",0)->first();
            //     // var_dump($withdraw);
            //     if (!$withdraw){

            //     } else {
            //         $withdraw_id = $withdraw->id;
            //         $user_id = $withdraw->user->id;
            //         $web_id = $withdraw->user->web_id;
            //         $wallet_id = $withdraw->user->wallet->id;
                    
                    

            //         $wallet = Wallet::find($wallet_id);
            //         if ($wallet->balance >= $request->transferAmount){
            //             $wallet->decrement('balance', $request->transferAmount);
            //             $wallet_transaction = WalletTransaction::create([
            //                 "wallet_id"=>$wallet_id,
            //                 "type"=>"withdraw",
            //                 "amount"=>$request->transferAmount,
            //                 "related_id"=>$withdraw_id,
            //                 "related_type"=>"App\Models\Withdraw",
            //                 "status"=>1
            //             ]);
            //             $wallet_transaction_id = $wallet_transaction->id;
            //             Withdraw::where('id',$withdraw_id)->update(
            //                 [
            //                     "wallet_transaction_id"=>$wallet_transaction_id,
            //                     "status"=>1
            //                 ]
            //                 );
            //             return response()->json([
            //                 'status'=>True,
            //                 'success'=>True,
            //                 "message"=>"Rút tiền thành công"
            //             ], 200);
            //         } else {
            //             return response()->json([
            //                 "status"=>False,
            //                 'success'=>True,
            //                 "message"=>"Số dư không đủ",
            //             ]);
            //         }
                    

            //     }
            // }
            // return response()->json([
            //     "success"=>True
            // ], 200);

        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'success'=>False,
                "message"=>"Đã có lỗi xảy ra",
                'hehe'=>$th->getMessage(),
                'line'=>$th->getLine()
            ], 500);
        }
    }

    // public function callback2(Request $request)
    // {
    //     // Dữ liệu nhận về
    //     // {
    //     //     "postingDate": "09/06/2025 00:01:00",
    //     //     "transactionDate": "08/06/2025 00:23:11",
    //     //     "accountNo": "0838411897",
    //     //     "creditAmount": "4000",
    //     //     "debitAmount": "0",
    //     //     "currency": "VND",
    //     //     "description": "CUSTOMER Nguyen Ngoc An tu Liobank   Ma giao  dich  Trace341385 Trace 341385",
    //     //     "addDescription": "Nguyen Ngoc An tu Liobank   Ma giao  dich  Trace341385 Trace 341385 ",
    //     //     "availableBalance": "352420",
    //     //     "beneficiaryAccount": "",
    //     //     "refNo": "FT25160578165854",
    //     //     "benAccountName": "",
    //     //     "bankName": "",
    //     //     "benAccountNo": "",
    //     //     "dueDate": "",
    //     //     "docId": "",
    //     //     "transactionType": "ACSM",
    //     //     "pos": "",
    //     //     "tracingType": ""
    //     // },


    //     try {
    //         if ($request->token !== env("BANK_TOKEN")) {
    //         return response()->json([
    //             "status" => False,
    //             "message" => "Can't access to here",
    //         ], 403);
    //     }
    //     $add_description = explode(" ",$request->addDescription);
    //     if ($request->creditAmount !== 0) { // Nhận tiền
    //         foreach ($add_description as $donate_code){
    //             $user = User::where("donate_code",$donate_code)->with('wallet')->first();
    //             if (!$user){
    //                 // Không tìm thấy thông tin về user theo donate_code
    //             } else {
    //                 $user_id = $user->id;
    //                 $web_id = $user->web_id;
    //                 $wallet_id = $user->wallet->id;

    //                 $donate_promotion = DonatePromotion::where("web_id", $web_id)->where("start_date", "<=", now())->where("end_date", ">", now())->where('status', 1)->orderBy('id', 'desc')->first();
    //                 if ($donate_promotion !== NULL){
    //                     $donate_promotion_id = $donate_promotion->id;
    //                     $donate_promotion_amount = $donate_promotion->amount;
                        
    //                 } else {
    //                     $donate_promotion_id = NULL;
    //                     $donate_promotion_amount = 0;
    //                 }

    //                 $amount = $request->creditAmount;
    //                 $bonus = $amount * ($donate_promotion_amount / 100);
    //                 $amount += $bonus;
    //                 $wallet_transaction = WalletTransaction::create([
    //                     "wallet_id"=>$wallet_id,
    //                     "type"=>"recharge_bank",
    //                     "amount"=>$amount,
    //                     "related_type"=> "App\Models\RechargeBank"
    //                 ]);

    //                 $wallet_transaction_id = $wallet_transaction->id;
    //                 $wallet = Wallet::find($wallet_id);
    //                 $wallet->increment('balance', $amount);
    //                 $recharge_bank =  RechargeBank::create([
    //                     'wallet_transaction_id' => $wallet_transaction_id,
    //                     "user_id"=>$user_id,
    //                     "web_id"=>$web_id,
    //                     'amount'=>$amount,
    //                     "transaction_reference"=>$request->refNo,
    //                     "status"=>1,
    //                     "donate_promotion_id"=>$donate_promotion_id
    //                 ]);

    //                 WalletTransaction::where("id",$wallet_transaction_id)->update(
    //                     [
    //                         "related_id"=>$recharge_bank->id
    //                     ]
    //                     );

    //                 return response()->json([
    //                     "status"=>True,
    //                     "message"=>"Nạp thẻ thành công"
    //                 ]);
    //             }
    //         }
    //         return response()->json([
    //             "status"=>False,
    //             "Không tìm thấy người dùng"
    //         ]);
    //     } else { // Rút tiền
    //         foreach ($add_description as $withdraw_code){
    //             $withdraw = Withdraw::with("user.wallet")->where("withdraw_code",$withdraw_code);
    //             if (!$withdraw){
    //                 // Không tìm thấy thông tin về user theo withdraw_code
    //             } else {
    //                 $user_id = $withdraw->user->id;
    //                 $web_id = $withdraw->user->web_id;
    //                 $wallet_id = $withdraw->user->wallet->id;



    //                 break;
    //             }
    //         }
    //     }
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             "error"=>$th->getMessage()
    //         ]);
    //     }
        
    // }


// public function callback(Request $request)
// {
//     try {
//         $authHeader = $request->header('Authorization');
//         // var_dump($authHeader);
//         if ($request->header('Authorization') !== "Apikey ".env("SEPAY_API_TOKEN")){
//             return response()->json([
//                 "status"=>false,
//                 'message'=>"Fail to callback"
//             ],403);
//         };
//         $contents = explode(" ", $request->content);
//         if ($request->transferType == 'in') { // NHận tiền
//             foreach ($contents as $donate_code){
//                 $user = User::where("donate_code",$donate_code)->with('wallet')->first();
//                 if (!$user){
//                     // Không tìm thấy thông tin về user theo donate_code
//                 } else {
//                     $user_id = $user->id;
//                     $web_id = $user->web_id;
//                     $wallet_id = $user->wallet->id;

//                     $donate_promotion = DonatePromotion::where("web_id", $web_id)->where("start_date", "<=", now())->where("end_date", ">", now())->where('status', 1)->orderBy('id', 'desc')->first();
//                     if ($donate_promotion !== NULL){
//                         $donate_promotion_id = $donate_promotion->id;
//                         $donate_promotion_amount = $donate_promotion->amount;
                        
//                     } else {
//                         $donate_promotion_id = NULL;
//                         $donate_promotion_amount = 0;
//                     }

//                     $amount = $request->transferAmount;
//                     $bonus = $amount * ($donate_promotion_amount / 100);
//                     $amount += $bonus;
//                     $wallet_transaction = WalletTransaction::create([
//                         "wallet_id"=>$wallet_id,
//                         "type"=>"recharge_bank",
//                         "amount"=>$amount,
//                         "related_type"=> "App\Models\RechargeBank"
//                     ]);

//                     $wallet_transaction_id = $wallet_transaction->id;
//                     $wallet = Wallet::find($wallet_id);
//                     $wallet->increment('balance', $amount);
//                     $recharge_bank =  RechargeBank::create([
//                         'wallet_transaction_id' => $wallet_transaction_id,
//                         "user_id"=>$user_id,
//                         "web_id"=>$web_id,
//                         'amount'=>$amount,
//                         "transaction_reference"=>$request->referenceCode,
//                         "status"=>1,
//                         "donate_promotion_id"=>$donate_promotion_id
//                     ]);

//                     WalletTransaction::where("id",$wallet_transaction_id)->update(
//                         [
//                             "related_id"=>$recharge_bank->id
//                         ]
//                         );

//                     return response()->json([
//                         "status"=>True,
//                         "success"=>True,
//                         "message"=>"Nạp thẻ thành công"
//                     ]);
//                 }
//             }
//         } else { // Rút tiền
//             foreach ($contents as $withdraw_code){
//                 // echo $withdraw_code;
//                 $withdraw = Withdraw::with('user.wallet')->where("withdraw_code",$withdraw_code)->first();
//                 // var_dump($withdraw);
//                 if (!$withdraw){

//                 } else {

//                     $user_id = $withdraw->user->id;
//                     $web_id = $withdraw->user->web_id;
//                     $wallet_id = $withdraw->user->wallet->id;

                    

//                     $wallet = Wallet::find($wallet_id);
//                     if ($wallet->balance >= $request->transferAmount){

//                     } else {
//                         return response()->json([
//                             "status"=>False,
//                             "message"=>"Số dư không đủ",
//                         ])
//                     }
//                     // $wallet->decrement('balance', $request->transferAmount);

//                 }
//             }
//         }
//     } catch (\Throwable $th) {
//         // return response()->json(['error' => 'Internal Server Error'], 500);
//         return response()->json([
//             "error"=>$th->getMessage()
//         ]);
//     }
// }

}
