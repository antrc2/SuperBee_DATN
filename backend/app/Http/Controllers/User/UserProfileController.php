<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User; // Keep this import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class UserProfileController extends Controller
{
    /**
     * Lấy thông tin profile của người dùng hiện tại.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request) // Không cần tham số Request nếu chỉ dùng Auth::user()
    {
        $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();
        if (!$user) {
            // Trường hợp này thực tế không nên xảy ra nếu middleware hoạt động đúng
            // Nhưng tốt nhất vẫn nên kiểm tra phòng hờ
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
        ]);
    }
    public function history(Request $request) // Không cần tham số Request nếu chỉ dùng Auth::user()
    {
        $user = User::with(['wallet.transactions','wallet.transactions.withdraw','wallet.transactions.rechargeBank',"wallet.transactions.rechargeCard",'wallet.transactions.order'])->where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();

        if (!$user) {
            // Trường hợp này thực tế không nên xảy ra nếu middleware hoạt động đúng
            // Nhưng tốt nhất vẫn nên kiểm tra phòng hờ
            return response()->json([
                'message' => 'Unauthorized or User not found.',
                'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
            ], 401);
        }

        return response()->json([
            $user
        ]);
    }
    public function order(Request $request) // Không cần tham số Request nếu chỉ dùng Auth::user()
    {
        $order = Order::with(["items"])->where('user_id', '=', $request->user_id)->get();

        if (!$order) {
            // Trường hợp này thực tế không nên xảy ra nếu middleware hoạt động đúng
            // Nhưng tốt nhất vẫn nên kiểm tra phòng hờ
            return response()->json([
                'message' => 'Unauthorized or User not found.',
                'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
            ], 401);
        }

        return response()->json(
            $order
        );
    }

    public function update(Request $request) // <-- Giữ nguyên Request $request
    {
        $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized or User not found.',
                'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
            ], 401);
        }

        $userId = $user->id; // Lấy userId từ người dùng đã xác thực

        // Sử dụng phương thức validate() trực tiếp trên đối tượng $request
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
            // Các thông báo lỗi tùy chỉnh (tùy chọn)
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác.',
            'phone.regex' => 'Số điện thoại không đúng định dạng.',
            'avatar.image' => 'Ảnh đại diện phải là một tệp hình ảnh.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB.',
            'avatar_url.url' => 'URL ảnh đại diện không hợp lệ.',
        ]);


        try {
            $user->email = $data['email'];
            $user->phone = $data['phone'] ?? null;

            if ($request->hasFile('avatar')) {
                dd($request);
                $destinationPath = 'public/avatars';

                // Kiểm tra và tạo thư mục nếu chưa tồn tại (như bạn đã yêu cầu trước đó)
                if (!Storage::exists($destinationPath)) {
                    Storage::makeDirectory($destinationPath);
                }

                // Xóa avatar cũ nếu có (để tránh rác trong storage)
                if ($user->avatar_url && !str_contains($user->avatar_url, 'via.placeholder.com') && !str_contains($user->avatar_url, 'default.jpg')) {
                    // Chuyển đổi URL công khai thành đường dẫn trong storage để xóa
                    $oldAvatarPath = str_replace(asset('storage/'), 'public/', $user->avatar_url);
                    if (Storage::exists($oldAvatarPath)) {
                        Storage::delete($oldAvatarPath);
                    }
                }

                // Lưu file ảnh mới vào thư mục 'public/avatars'
                $avatarPath = $request->file('avatar')->store($destinationPath);

                // Lấy URL công khai của ảnh và lưu vào database
                // Phương thức Storage::url() sẽ sử dụng APP_URL để tạo ra URL đầy đủ
                $user->avatar_url = Storage::url($avatarPath); // <-- Dòng này là mấu chốt

            } elseif (isset($data['avatar_url']) && $data['avatar_url']) {
                // Nếu không upload file, nhưng có gửi avatar_url từ frontend
                $user->avatar_url = $data['avatar_url'];
            }

            $user->save();

            return response()->json([
                'message' => 'Cập nhật thông tin profile thành công!',
                'user' => [
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar_url, // <-- Trả về URL đã lưu vào database
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật profile.',
                'error' => $e->getMessage(),
                'errorCode' => 'UPDATE_FAILED'
            ], 500);
        }
    }
    public function changePassword(Request $request)
    {
        // 1. Lấy người dùng đã xác thực từ JWT middleware
        $user = User::where('id', '=', $request->user_id)->where('web_id', '=', $request->web_id)->first();


        // Kiểm tra xem người dùng có tồn tại không (trường hợp này hiếm khi xảy ra nếu middleware hoạt động đúng)
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized or User not found.',
                'errorCode' => 'UNAUTHORIZED_OR_USER_MISSING'
            ], 401);
        }

        // 2. Validate dữ liệu đầu vào
        // Sử dụng $request->validate() trực tiếp trong controller để đơn giản.
        // Hoặc bạn có thể tạo một Form Request riêng nếu muốn.
        try {
            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed', // 'confirmed' yêu cầu trường new_password_confirmation
            ], [
                'current_password.required' => 'Mật khẩu hiện tại không được để trống.',
                'new_password.required' => 'Mật khẩu mới không được để trống.',
                'new_password.min' => 'Mật khẩu mới phải có ít nhất :min ký tự.',
                'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
                'errorCode' => 'VALIDATION_FAILED'
            ], 422);
        }

        // 3. Kiểm tra mật khẩu hiện tại có đúng không
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng.',
                'errorCode' => 'CURRENT_PASSWORD_MISMATCH'
            ], 400); // Bad Request
        }

        // 4. Cập nhật mật khẩu mới
        try {
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'message' => 'Đổi mật khẩu thành công.',
                'errorCode' => null // Không có lỗi
            ], 200); // OK
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi đổi mật khẩu.',
                'error' => $e->getMessage(),
                'errorCode' => 'PASSWORD_CHANGE_FAILED'
            ], 500); // Internal Server Error
        }
    }
}
