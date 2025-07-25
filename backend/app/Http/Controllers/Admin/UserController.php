<?php

namespace App\Http\Controllers\Admin;

use App\Events\SystemNotification;
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
            ], 500); // Trả về 500 cho lỗi server
        }
    }
    public function destroy(Request $request, $id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            if ($request->user_id == $id) {
                return response()->json([
                    "status" => False,
                    "message" => "Bạn không thể tự khóa tài khoản của mình"
                ], 422);
            }

            $query->status = 2;
            $query->save();
            event(new SystemNotification(
                "EMAIL_BAN_ACCOUNT",
                [
                    "email" => $query->email,
                    "username" => $query->username,
                    // "amount"=>9000
                ]
            ));
            // event(new SystemNotification())
            return response()->json([
                'status' => true,
                'message' => 'Khóa tài khoản thành công',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi xóa tài khoản',
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
            event(new SystemNotification(
                "EMAIL_RESTORE_ACCOUNT",
                [
                    "email" => $query->email,
                    "username" => $query->username,
                    // "amount"=>9000
                ]
            ));
            return response()->json([
                'status' => true,
                'message' => 'Khôi phục tài khoản thành công',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi khôi phục tài khoản',
            ], 500);
        }
    }
    public function updateRoles(Request $request, $id)
    {
        try {
            // Bước 1: Validate đầu vào
            $request->validate([
                'roles' => 'required',
                'user_id' => 'required|integer|exists:users,id',
            ]);

            // Chuyển roles thành mảng nếu là chuỗi
            $roles = is_array($request->roles) ? $request->roles : [$request->roles];

            // Chỉ chấp nhận admin, user, partner
            $allowedRoles = ['admin', 'user', 'partner'];
            foreach ($roles as $role) {
                if (!in_array($role, $allowedRoles)) {
                    return response()->json([
                        'status' => false,
                        'message' => "Đã có lỗi xảy ra"
                    ], 422);
                }
            }

            // Lấy user bị cập nhật
            $targetUser = User::find($id);
            if (!$targetUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ], 404);
            }

            // Lấy user thực hiện
            $authUser = User::find($request->user_id);
            if (!$authUser || !$authUser->hasRole('admin')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            // Nếu người bị chỉnh sửa là admin thì không được cập nhật roles nữa (vì ngang cấp)
            if ($targetUser->hasRole('admin')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Đã có lỗi xảy ra!'
                ], 403);
            }

            // Gán quyền mới
            $targetUser->syncRoles($roles);
            $targetUser->load('roles');

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật quyền thành công',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ',

            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật quyền',

            ], 500);
        }
    }
}
