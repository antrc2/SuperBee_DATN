<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use Illuminate\Http\Request;

class AdminDonatePromotionController extends Controller
{
    public function index(Request $request)
    {
        try {

            // Cập nhật các khuyến mãi hết hạn

            DonatePromotion::where('end_date', '<', now())
                ->where('status', 1)
                ->update(['status' => 0]);

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
}
