<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use App\Models\RechargeCard;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

use function PHPSTORM_META\type;

class CardController extends Controller
{
    public function callback(Request $request){
        try {
            if ($request->token !== $_ENV['BANK_TOKEN']){
                return response()->json([
                    "status"=>False,
                    "message"=>"Can't access to here",
                ], 403);
            } 

        } catch (\Throwable $th) {
            //throw $th;
        }
    }
    public function store(Request $request){
        try {
            $validate_data = Validator::make($request->all(), [
                "telco" => "required|string",
                "amount" => "required|integer",
                "serial" => "required|string",
                "code" => "required|string"
            ]);
            $partner_id = env('PARTNER_ID');
            $partner_key = env('PARTNER_KEY');
            $sign = md5($partner_key.$request->code.$request->serial);
            $dataPost = [];
            $dataPost['request_id'] = rand(100000000, 999999999); //Mã đơn hàng của bạn
            $dataPost['code'] = $request->code;
            $dataPost['partner_id'] = $partner_id;
            $dataPost['serial'] =$request->serial;
            $dataPost['telco'] = $request->telco;
            $dataPost['amount'] = $request->amount;
            $dataPost['command'] = 'charging';  // NẠP THẺ
            $dataPost['sign'] = $sign;
            DB::beginTransaction();
            $response = Http::post('https://doithe1s.vn/chargingws/v2', $dataPost);
            $response = $response->json();
            if ($response['status'] == 99){
                RechargeCard::create([
                    'amount'=>$response['amount'],
                    "value"=>0,
                    "declared_value" => $response['declared_value'],
                    "telco"=>$response['telco'],
                    "serial"=>$response['serial'],
                    "code"=>$response['code'],
                    "status"=>$response['status'],
                    "message"=>$response['message'],
                    "user_id"=>$request->user_id,
                    "web_id"=>$request->web_id,
                    'sign'=>$sign,
                    "wallet_transaction_id"=>null
                ]);
                return response()->json([
                    "status"=>True,
                    "message"=>"Đang xử lí thẻ cào",
                    "data"=>$response
                ],200);
            } else {
                return response()->json([
                    'status'=>False,
                    "message"=>$response['message'],
                    "status_code"=>$response['status']
                ],400);
            }
            


            DB::commit();
        } catch (\Throwable $th) {
            // return response()->json([
            //     "response"=>$th->getMessage()
            // ]);
            DB::rollBack();
            return response()->json([
                'status'=>False,
                'message'=>'Đã có lỗi xảy ra',
                "response"=>$th->getMessage()
            ],500);
        }
    }


}
