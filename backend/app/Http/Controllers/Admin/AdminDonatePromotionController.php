<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DonatePromotion;
use App\Models\Notification;
use App\Models\RechargeBank;
use App\Models\RechargeCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            // Tự động vô hiệu hóa các khuyến mãi hết hạn
            $this->change_status_if_end_date();

            // Bắt đầu query
            $query = DonatePromotion::with(['creator', 'web'])
                ->where('web_id', $request->web_id);

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('amount_min')) {
                $query->where('amount', '>=', (float) $request->amount_min);
            }

            if ($request->filled('amount_max')) {
                $query->where('amount', '<=', (float) $request->amount_max);
            }


            // Phân trang: mặc định 10 dòng mỗi trang
            $perPage = $request->input('per_page', 10);
            $donatePromotions = $query->latest()->paginate($perPage);

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách khuyến mãi thành công",
                "data" => $donatePromotions
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage()
            ], 500);
        }
    }


    public function show(Request $request, $id)
    {
        try {
            $this->change_status_if_end_date();
            $donate_promotion = DonatePromotion::with("creator.web")->find($id);
            if (!$donate_promotion) {
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
            $existingPromotion = DonatePromotion::with("creator")->where('web_id', $web_id)->where("status", 1)->first();
            if ($existingPromotion) {
                return response()->json([
                    "status" => False,
                    "message" => "Khuyến mãi nạp thẻ đã tồn tại"
                ], 409);
            }
            $rules = [
                'amount'           => 'required|integer',
                'start_date'       => 'required|date|before:end_date',
                'end_date'         => 'required|date|after:start_date',
                'usage_limit'      => 'nullable|integer',
                'per_user_limit'   => 'nullable|integer',
           
                'status'           => 'nullable|string',
            ];

            $messages = [
                'amount.required'         => 'Vui lòng nhập số tiền.',
                'amount.integer'          => 'Số tiền phải là số nguyên.',

                'start_date.required'     => 'Vui lòng chọn ngày bắt đầu.',
                'start_date.date'         => 'Ngày bắt đầu không đúng định dạng.',
                'start_date.before'       => 'Ngày bắt đầu phải trước ngày kết thúc.',

                'end_date.required'       => 'Vui lòng chọn ngày kết thúc.',
                'end_date.date'           => 'Ngày kết thúc không đúng định dạng.',
                'end_date.after'          => 'Ngày kết thúc phải sau ngày bắt đầu.',

                'usage_limit.integer'     => 'Giới hạn sử dụng phải là số nguyên.',
                'usage_limit.min'         => 'Giới hạn sử dụng phải ≥ 0.',

                'per_user_limit.integer'  => 'Giới hạn mỗi người dùng phải là số nguyên.',
                'per_user_limit.min'      => 'Giới hạn mỗi người dùng phải ≥ 0.',

                'status.string'           => 'Trạng thái phải là chuỗi ký tự.',
            ];


            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                // Trả về JSON (API)
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(), // message đầu tiên
                    // 'errors'  => $validator->errors(),          // toàn bộ lỗi theo field
                ], 422);
            }
            $validatedData = $validator->validated();

            $donate_promotion = DonatePromotion::create([
                'web_id'      => $web_id,
                'amount'      => $validatedData['amount'],
                'start_date'  => $validatedData['start_date'],
                'end_date'    => $validatedData['end_date'],
                'usage_limit' => $validatedData['usage_limit'],
                "per_user_limit" => $validatedData['per_user_limit'],
                'created_by' => $request->user_id,
                "updated_by" => $request->user_id,
                "status" => $validatedData['status']
            ]);
            $this->sendNotification(1, "Khuyến mãi {$request->amount}% khi nạp số dư từ {$request->start_date} đến {$request->end_date}");
            return response()->json([
                "status" => True,
                "message" => "Tạo khuyến mãi nạp thẻ thành công",
                "data" => $donate_promotion
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra",
                // "hehe" => $th->getMessage()
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
                DonatePromotion::where("id", $id)->delete();

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
    public function undo(Request $request, String $id)
    {
        try {
            if (DonatePromotion::where('id', $id)->first() == NULL) {
                return response()->json([
                    'status' => False,
                    'message' => "Không tìm thấy khuyến mãi"
                ], 404);
            } // } else {
            // 
            // }
            if (DonatePromotion::where('web_id', $request->web_id)->where("status", 1)->first() != NULL) { // Có tìm thấy
                return response()->json([
                    "status" => False,
                    "message" => "Không thể khôi phục, vì đã có khuyến mãi khác đang hoạt động"
                ], 400);
            }
        $a=    DonatePromotion::where("id", $id)->update(['status' => 1]);
            return response()->json([
                'status' => True,
                'message' => "Khôi phục thành công",
                "đf"=>$a
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => False,
                'message' => "Khôi phục thất bại"
            ]);
        }
    }
}
