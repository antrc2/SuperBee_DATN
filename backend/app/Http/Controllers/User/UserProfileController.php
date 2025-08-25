<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateHistory;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Exception; // Import Exception class

class UserProfileController extends Controller
{
    /**
     * Lấy thông tin profile của người dùng hiện tại.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        try {
            $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized or User not found.',
                    'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
                ], 401);
            }

            return response()->json($user);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching user profile.',
                'error' => $e->getMessage(),
                'errorCode' => 'FETCH_PROFILE_FAILED'
            ], 500);
        }
    }

    public function money(Request $request)
    {
        try {
            $user = User::with(['wallet'])->where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();
            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized or User not found.',
                    'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
                ], 401);
            }
            // Lấy danh sách tên các vai trò của user
            $roles = $user->getRoleNames(); // Ví dụ: ['partner', 'user']

            // Lấy danh sách tên của TẤT CẢ các quyền (bao gồm cả quyền từ vai trò và quyền trực tiếp)
            $permissions = $user->getAllPermissions()->pluck('name'); // Ví dụ: ['products.create', 'orders.view-own']

            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu thành công',
                'data' => [
                    'money' => $user->wallet->balance + $user->wallet->promotion_balance,
                    'roles' => $roles,
                    'permissions' => $permissions
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching user money.',
                'error' => $e->getMessage(),
                'errorCode' => 'FETCH_MONEY_FAILED'
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $user = User::with(['wallet.transactions', 'wallet.transactions.withdraw', 'wallet.transactions.rechargeBank', "wallet.transactions.rechargeCard", 'wallet.transactions.order'])
                ->where('id', '=', $request->user_id)
                ->where('web_id', '=', $request->web_id)
                ->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized or User not found.',
                    'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
                ], 401);
            }

            return response()->json(
                $user
            );
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching user history.',
                'error' => $e->getMessage(),
                'errorCode' => 'FETCH_HISTORY_FAILED'
            ], 500);
        }
    }

    public function order(Request $request)
    {
        try {
            $order = Order::with(["items"])->where('user_id', '=', $request->user_id)->get();

            if ($order->isEmpty()) { // Kiểm tra nếu không tìm thấy đơn hàng
                return response()->json([
                    'message' => 'No orders found for this user.',
                    'errorCode' => 'NO_ORDERS_FOUND'
                ], 404); // 404 Not Found là thích hợp hơn 401 ở đây nếu người dùng hợp lệ nhưng không có đơn hàng
            }

            return response()->json(
                $order
            );
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while fetching user orders.',
                'error' => $e->getMessage(),
                'errorCode' => 'FETCH_ORDERS_FAILED'
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            $user = User::where('id', $request->user_id)
                ->where('web_id', $request->web_id)
                ->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized or User not found.',
                    'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
                ], 401);
            }

            $userId = $user->id;

            $data = $request->validate([
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($userId),
                ],
                'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9\+\(\)\s\-]+$/'],
                'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
                'avatar_url' => ['nullable', 'string', 'max:255'],

                'cccd_number' => ['nullable', 'string', 'max:20', 'regex:/^[0-9]+$/'],
                'cccd_created_at' => ['nullable', 'date'],
                'cccd_frontend' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:5120'],
                'cccd_backend' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:5120'],
                'cccd_frontend_url' => ['nullable', 'string'],
                'cccd_backend_url' => ['nullable', 'string'],
            ]);

            // Update basic fields
            $user->email = $data['email'];
            $user->phone = $data['phone'] ?? null;
            $user->cccd_number = $data['cccd_number'] ?? null;
            $user->cccd_created_at = $data['cccd_created_at'] ?? null;

            // ==== Avatar ====
            if ($request->hasFile('avatar')) {
                // Xóa ảnh cũ nếu có và không phải ảnh mặc định
                if ($user->avatar_url && !str_contains($user->avatar_url, 'placeholder') && !str_contains($user->avatar_url, 'default-avatar')) {
                    $this->deleteFile($user->avatar_url);
                }

                $url = $this->uploadFile($request->file('avatar'), "avatars");
                if ($url) {
                    $user->avatar_url = $url;
                }
            } elseif (isset($data['avatar_url']) && !empty($data['avatar_url'])) {
                $user->avatar_url = $data['avatar_url'];
            }

            // ==== CCCD Frontend ====
            if ($request->hasFile('cccd_frontend')) {
                // Xóa ảnh cũ nếu có
                if ($user->cccd_frontend_url && !str_contains($user->cccd_frontend_url, 'placeholder')) {
                    $this->deleteFile($user->cccd_frontend_url);
                }

                $url = $this->uploadFile($request->file('cccd_frontend'), "cccd");
                if ($url) {
                    $user->cccd_frontend_url = $url;
                }
            } elseif (isset($data['cccd_frontend_url']) && !empty($data['cccd_frontend_url'])) {
                $user->cccd_frontend_url = $data['cccd_frontend_url'];
            }

            // ==== CCCD Backend ====
            if ($request->hasFile('cccd_backend')) {
                // Xóa ảnh cũ nếu có
                if ($user->cccd_backend_url && !str_contains($user->cccd_backend_url, 'placeholder')) {
                    $this->deleteFile($user->cccd_backend_url);
                }

                $url = $this->uploadFile($request->file('cccd_backend'), "cccd");
                if ($url) {
                    $user->cccd_backend_url = $url;
                }
            } elseif (isset($data['cccd_backend_url']) && !empty($data['cccd_backend_url'])) {
                $user->cccd_backend_url = $data['cccd_backend_url'];
            }

            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật thông tin profile thành công!',
                'data' => $user
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
                'errorCode' => 'VALIDATION_FAILED'
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật profile.',
                'error' => $e->getMessage(),
                'errorCode' => 'UPDATE_FAILED'
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthorized or User not found.',
                    'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
                ], 401);
            }

            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ], [
                'current_password.required' => 'Mật khẩu hiện tại không được để trống.',
                'new_password.required' => 'Mật khẩu mới không được để trống.',
                'new_password.min' => 'Mật khẩu mới phải có ít nhất :min ký tự.',
                'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
            ]);

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Mật khẩu hiện tại không đúng.',
                    'errorCode' => 'CURRENT_PASSWORD_MISMATCH'
                ], 400);
            }

            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'message' => 'Đổi mật khẩu thành công.',
                'errorCode' => null
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
                'errorCode' => 'VALIDATION_FAILED'
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi đổi mật khẩu.',
                'error' => $e->getMessage(),
                'errorCode' => 'PASSWORD_CHANGE_FAILED'
            ], 500);
        }
    }

    public function getAllAffHistory(Request $request)
    {
        $user = User::where('id', '=', $request->user_id)
            ->where('web_id', '=', $request->web_id)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized or User not found.',
                'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
            ], 401);
        }

        $affiliate = Affiliate::where('affiliated_by', $user->id)->first();

        // Nếu user chưa có affiliate thì trả về data rỗng
        if (!$affiliate) {
            return response()->json([
                'message' => 'Get affiliate history successfully.',
                'data' => []
            ], 200);
        }

        // Lấy lịch sử hoa hồng
        $histories = AffiliateHistory::where('affiliate_id', $affiliate->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Get affiliate history successfully.',
            'data' => $histories
        ], 200);
    }

    public function getDisputes(Request $request)
    {
        try {
            // Lấy user ID từ token đã được xác thực qua middleware
            $userId = auth()->id();

            // Lấy danh sách khiếu nại của user đó
            $disputes = Dispute::where('user_id', $userId)
                // Tải kèm các thông tin cần thiết để hiển thị ở frontend
                ->with([
                    'orderItem:id,order_id,product_id',
                    'orderItem.product:id,sku,description', // Lấy thêm description cho dễ hiển thị
                    'orderItem.order:id,order_code'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách khiếu nại thành công.',
                'data' => $disputes
            ], 200);
        } catch (Exception $e) {
            // Ghi log lỗi để debug
            // Log::error('Fetch Disputes Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách khiếu nại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Client: Lấy chi tiết một khiếu nại của chính mình.
     *
     * @param int $id ID của dispute
     */
    public function getDisputeDetails(Request $request, $id)
    {
        try {
            $userId = auth()->id();

            // Tìm khiếu nại theo ID
            $dispute = Dispute::with([
                'orderItem.product:id,sku,description'
            ])->find($id);

            // Kiểm tra xem khiếu nại có tồn tại và có thuộc về người dùng này không
            if (!$dispute || $dispute->user_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy khiếu nại hoặc bạn không có quyền truy cập.'
                ], 404); // Sử dụng 404 Not Found
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy chi tiết khiếu nại thành công.',
                'data' => $dispute // Trả về toàn bộ object dispute, bao gồm cả 'resolution'
            ], 200);
        } catch (Exception $e) {
            // Log::error('Fetch Dispute Detail Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết khiếu nại.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
