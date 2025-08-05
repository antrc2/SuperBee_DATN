<?php

namespace App\Http\Controllers\Auto;

use App\Http\Controllers\Controller;
use App\Models\Business_setting;
use Illuminate\Http\Request;

class AutoTransactionController extends Controller
{
    public function status(Request $request){
        try {
            $business = Business_setting::where("web_id",1)->first();
            return response()->json([
                'status'=>False,
                "message"=>"Lấy trạng thái thành công",
                'data'=>$business->auto_transaction
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Lấy trạng thái thất bại",
                'data'=>0
            ],500);
        }
    }
    public function turn(Request $request){
        try {
            $business = Business_setting::where("web_id",1)->first();
            // if ($business->auto_transaction)
            $business->auto_transaction = !$business->auto_transaction;
            $business->save();
            return response()->json([
                "status"=>True,
                'message'=>"Thành công"
            ],200);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                'message'=>"Thành công"
            ],500);
            //throw $th;
        }
    }
}
