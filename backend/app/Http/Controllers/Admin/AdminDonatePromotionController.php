<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use App\Models\RechargeBank;
use App\Models\RechargeCard;
use Illuminate\Http\Request;

class AdminDonatePromotionController extends Controller
{
    private function change_status_if_end_date()
    {
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

    public function show(Request $request, $id)
    {
        try {
            $this->change_status_if_end_date();
            $donate_promotion = DonatePromotion::where("web_id", $request->web_id)->where('id', $id)->get();
            if (count($donate_promotion) == 0) {
                return response()->json([
                    "status" => False,
                    "message" => "Không tìm thấy",
                    'data' => []
                ], 404);
            } else {
                return response()->json([
                    'status' => True,
                    "message" => "Xem chi tiết khuyến mãi thành công",
                    "data" => $donate_promotion
                ]);
            }
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã xảy ra lỗi"
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {


            $web_id = $request->web_id;
            // Kiểm tra xem đã có dữ liệu chưa theo web_id
            $existingPromotion = DonatePromotion::where('web_id', $web_id)->where("status", 1)->first();
            if ($existingPromotion) {
                return response()->json([
                    "status" => False,
                    "message" => "Khuyến mãi nạp thẻ đã tồn tại"
                ], 409);
            }
            $validatedData = $request->validate([
                'amount'      => 'required|integer',
                'start_date'  => 'required|date|before:end_date',
                'end_date'    => 'required|date|after:start_date',
            ]);
            DonatePromotion::create([
                'web_id'      => $web_id,
                'amount'      => $validatedData['amount'],
                'start_date'  => $validatedData['start_date'],
                'end_date'    => $validatedData['end_date'],
            ]);
            return response()->json([
                "status" => True,
                "message" => "Tạo khuyến mãi nạp thẻ thành công"
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            if (count(DonatePromotion::where("id", $id)->get()) == 0) {
                return response()->json([
                    "status" => False,
                    "message" => "Không tìm thấy",
                ], 404);
            }
            if (
                RechargeBank::where("donate_promotion_id", $id)->first() == NULL &&
                RechargeCard::where("donate_promotion_id", $id)->first() == NULL
            ) {
                // Nếu chưa có bản ghi nào liên quan, xóa hẳn
                DonatePromotion::where("id",$id)->delete();

                return response()->json([
                    "status" => true,
                    "message" => "Xóa khuyến mãi thành công"
                ], 200);
            } else {
                DonatePromotion::where("id", $id)->update(["status" => 0]);

                return response()->json([
                    "status" => true,
                    "message" => "Không thể xóa, đã có lịch sử liên quan — đã chuyển trạng thái về không hoạt động"
                ], 200);
            }
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã xảy ra lỗi hệ thống",
            ], 500);
        }
    }
    public function undo(String $id){
        try {
            if (DonatePromotion::where('id',$id)->first() == NULL) {
                return response()->json([
                    'status'=>False,
                    'message'=>"Không tìm thấy khuyến mãi"
                ],404);
            } else {
                DonatePromotion::where("id",$id)->update(['status'=>0]);
            }
            
            return response()->json([
                'status'=>True,
                'message'=>"Khôi phục thành công"
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                'message'=>"Khôi phục thất bại"
            ]);
        }
    }

}
