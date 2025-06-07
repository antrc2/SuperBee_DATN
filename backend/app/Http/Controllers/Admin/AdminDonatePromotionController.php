<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use Illuminate\Http\Request;

class AdminDonatePromotionController extends Controller
{
    private function change_status_if_end_date(){
        DonatePromotion::where('end_date', '<', now())
                ->where('status', 1)
                ->update(['status' => 0]);
    }
    public function index(Request $request)
    {
        try {

            // Cập nhật các khuyến mãi hết hạn
            $this->change_status_if_end_date();
            

            $query = DonatePromotion::where("web_id", $request->web_id);

            // Nếu có tham số limit và offset thì áp dụng

            $donate_promotions = $query->get();

            return response()->json([
                "status" => True,
                "message" => "Lấy danh sách khuyến mãi thành công",
                "data" => $donate_promotions
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    public function show(Request $request, $id){
        try {
            $this->change_status_if_end_date();
            $donate_promotion = DonatePromotion::where("web_id", $request->web_id)->where('id',$id)->get();
            if (count($donate_promotion) == 0) {
                return response()->json([
                    "status"=>False,
                    "message"=>"Không tìm thấy",
                    'data'=>[]
                ], 404);
            } else {
                return response()->json([
                'status'=>True,
                "message"=>"Xem chi tiết khuyến mãi thành công",
                "data"=>$donate_promotion
            ]);
            } 
            
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã xảy ra lỗi"
            ], 500);
        }


    }

    
}
