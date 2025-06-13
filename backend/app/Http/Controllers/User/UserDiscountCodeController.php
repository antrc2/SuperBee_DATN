<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\User;
use App\Models\Web;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DiscountCodeController extends Controller
{
    // GET /discount_codes
    public function index(Request $request)
    {
        try {
            // $query = DiscountCode::orderBy('created_at', 'desc');
            $codes = Promotion::withCount(['orders'])->orderBy('created_at', 'desc')->get();
            if ($codes->count() == 0) {
                return response()->json([
                    'message' => 'Không có mã giảm giá nào',
                    'status' => true,
                    'data' => []
                ]);
            }
            return response()->json([
                'message' => 'Lấy danh sách mã giảm giá thành công',
                'status' => true,
                'data' => $codes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã có lỗi xảy ra',
                'status' => false,
                'error' => $e->getMessage(),  // Thêm dòng này để xem lỗi thật
            ], 500);
        }
    }

    // GET /discount_codes/{id}
    public function show($id)

    {
        try {
            $code = Promotion::with("user.web")->find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy chi tiết mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }
}
