<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Exception;

class UserController extends Controller
{
    //
    public function index(Request $request)
    {
        $user = User::with(['roles', 'wallet'])->get();
        $roles = Role::all();
        return response()->json([
            "message" => "lấy thành công",
            "status" => true,
            "data" => ["user" => $user, "roles" => $roles]
        ]);
    }
    public function show($id)
    {
        try {
            $user = User::with([
                "wallet.transactions", // Lấy ví và tất cả giao dịch của ví
                // "wallet.transactions.rechargeCard", // Chi tiết nạp thẻ (nếu là giao dịch loại recharge_card)
                // "wallet.transactions.rechargeBank",  // Chi tiết nạp bank (nếu là giao dịch loại recharge_bank)
                // "wallet.transactions.withdraw",    // Chi tiết rút tiền (nếu là giao dịch loại withdraw)
                "wallet.transactions.order",         // Chi tiết đơn hàng (nếu là giao dịch loại purchase)
                "orders.items",          // Lấy các đơn hàng và chi tiết từng sản phẩm trong đơn hàng
                "rechargeCards", // Lịch sử nạp thẻ và khuyến mãi áp dụng
                "rechargeBanks", // Lịch sử nạp bank và khuyến mãi áp dụng
                "withdraw",           // Lịch sử rút tiền
                "roles",                 // Vai trò của người dùng (từ Spatie/Permission)
                "web",                   // Website mà user thuộc về
                "referredUsers", // Các user mà user này đã giới thiệu (nếu cần xem ai)
            ])->find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản người dùng.'
                ], 404); // Trả về 404 nếu không tìm thấy
            }

            // Có thể thêm logic xử lý dữ liệu trước khi gửi về FE tại đây
            // Ví dụ: tính toán tổng tiền đã nạp/rút

            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu tài khoản người dùng thành công.',
                'data' => [
                    'user' => $user->toArray() // Chuyển đổi Eloquent Collection/Model sang array
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy dữ liệu tài khoản.',
                'error' => $e->getMessage(),
                // 'trace' => $e->getTraceAsString() // Chỉ bật trong môi trường dev để debug
            ], 500); // Trả về 500 cho lỗi server
        }
    }
    public function destroy($id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            $query->status = 0;
            $query->save();

            return response()->json([
                'status' => true,
                'message' => 'Xóa tài khoản',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi xóa tài khoản',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function restore(string $id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            $query->status = 1;
            $query->save();

            return response()->json([
                'status' => true,
                'message' => 'Đã Khôi phục tài khoản',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi khôi phục tài khoản',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
