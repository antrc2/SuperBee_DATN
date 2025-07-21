<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\AffiliateHistory;
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

            return response()->json([
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar_url,
                'donate_code' => $user->donate_code,
            ]);
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
                    'money' => $user->wallet->balance,
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
            $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();

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
                'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
                'avatar_url' => ['nullable', 'url', 'max:255'],
            ], [
                'email.required' => 'Email không được để trống.',
                'email.email' => 'Email không đúng định dạng.',
                'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác.',
                'phone.regex' => 'Số điện thoại không đúng định dạng.',
                'avatar.image' => 'Ảnh đại diện phải là một tệp hình ảnh.',
                'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB.',
                'avatar_url.url' => 'URL ảnh đại diện không hợp lệ.',
            ]);

            $user->email = $data['email'];
            $user->phone = $data['phone'] ?? null;

            if ($request->hasFile('avatar')) {
                $destinationPath = 'public/avatars';

                if (!Storage::exists($destinationPath)) {
                    Storage::makeDirectory($destinationPath);
                }

                if ($user->avatar_url && !str_contains($user->avatar_url, 'via.placeholder.com') && !str_contains($user->avatar_url, 'default.jpg')) {
                    $oldAvatarPath = str_replace(asset('storage/'), 'public/', $user->avatar_url);
                    if (Storage::exists($oldAvatarPath)) {
                        Storage::delete($oldAvatarPath);
                    }
                }

                $avatarPath = $request->file('avatar')->store($destinationPath);
                $user->avatar_url = Storage::url($avatarPath);
            } elseif (isset($data['avatar_url']) && $data['avatar_url']) {
                $user->avatar_url = $data['avatar_url'];
            }

            $user->save();

            return response()->json([
                'message' => 'Cập nhật thông tin profile thành công!',
                'user' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar_url,
                ]
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
        //  return response()->json([
        //     'message' => 'Get affiliate history successfully.',
        //     'data' => $affiliate
        // ], 200);
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
}
