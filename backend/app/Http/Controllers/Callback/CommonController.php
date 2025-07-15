<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use App\Models\RechargeBank;
use App\Models\RechargeCard;

class CommonController extends Controller
{
    public function donate_promotion($donate_promotion,$user_id)
    {
        if ($donate_promotion !== NULL) {
            if ($donate_promotion->usage_limit == -1) {

            } else {
                if ($donate_promotion->total_used >= $donate_promotion->usage_limit){
                    return ['donate_promotion_id'=>Null,"donate_promotion_amount"=>0];
                }
            }

            $card = RechargeCard::where("user_id",$user_id)->where("donate_promotion_id",$donate_promotion->id)->where('status',1)->get()->count();
            $bank = RechargeBank::where('user_id',$user_id)->where("donate_promotion_id",$donate_promotion->id)->get()->count();

            $total_used = $card + $bank;

            if ($donate_promotion->per_user_limit != -1 && $total_used >= $donate_promotion->per_user_limit) {
                return ['donate_promotion_id'=> null, 'donate_promotion_amount'=> 0];
            }
            return ['donate_promotion_id'=>$donate_promotion->id,"donate_promotion_amount"=>$donate_promotion->amount];
            // $donate_promotion_id = $donate_promotion->id;
            // $donate_promotion_amount = $donate_promotion->amount;
        } else {
            return ['donate_promotion_id'=>Null,"donate_promotion_amount"=>0];
            // $donate_promotion_id = NULL;
            // $donate_promotion_amount = 0;
        }
    }
}
