<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
use App\Models\User;
use App\Models\Web;
use App\Models\RefreshToken;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;


class AuthController extends Controller
{
    //
    public function domain(Request $request)
    {
        $a =   $request->header('authorization');
        return response()->json(["error" => "WEB_NOT_ACTIVE", "code" => "ACTIVE"], 200);
    }
    public function active(Request $request)
    {
        $shopKey = $request->keyShop;
        $shop = Web::where('api_key', $shopKey)->first();
        if ($shop == null) {
            return response()->json(["message" => "Key không tồn tại hoặc sai", "status" => false], 401);
        }
        $shop->status = 1;
        $shop->save();
        return response()->json(["message" => "Kích Hoạt web thành công", "status" => true], 200);
    }
    protected function encodeToken(array $payload, int $expireTime): string
    {
        $payload['exp'] = time() + $expireTime;
        return JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256');
    }

    /**
     * Hàm tạo access token
     */
    protected function generateAccessToken(User $user, Request $request): string
    {
        $payload = [
            'name' => $user->username,
            'user_id' => $user->id,
            'web_id' => $user->web_id,
            'role_id' => $user->role_id,
        ];
        $expireTime = env('JWT_EXPIRE_TIME', 3600); // Mặc định 1 giờ
        return $this->encodeToken($payload, $expireTime);
    }

    /**
     * Hàm tạo refresh token
     */
    protected function generateRefreshToken(User $user, Request $request): string
    {
        $payload = [
            'name' => $user->username,
            'user_id' => $user->id,
            'web_id' => $user->web_id,
            'role_id' => $user->role_id,
        ];
        $expireTime = env('JWT_REFRESH_EXPIRE_TIME', 60 * 60 * 24 * 30); // Mặc định 30 ngày
        return $this->encodeToken($payload, $expireTime);
    }

    /**
     * Đăng ký
     */
    public function register(Request $request)
    {
        try {
            // 1. Validate dữ liệu
            $validated = $request->validate([
                'username'   => [
                    'required',
                    'string'
                ],
                'password'   => 'required|string|min:6',
                'email'      => 'required|email|unique:users,email',
                'web_id'     => 'required|exists:webs,id',
                'aff'   => 'exists:users,id',
            ]);
            // check user xem tồn tại ở web id chưa
            $is_user = User::where('username', '=', $request->username)->where('web_id', '=', $request->web_id)->first();
            if ($is_user) {
                return response()->json([
                    'message' => 'Account already exists.',
                    'status'  => false,
                    'data'    => []
                ], 201);
            }

            // 2. Mã hóa mật khẩu
            $validated['password'] = Hash::make($validated['password']);

            // // 3. Gán mặc định web_id nếu chưa có
            // $validated['web_id'] = $validated['web_id'] ?? 1;

            $donate_code = "";
            do {
                $donate_code = $this->generateCode(16);
            } while (User::where("donate_code", $donate_code)->first() !== NULL);

            $validated['donate_code'] = $donate_code;
            // dd($validated);
            // 4. Tạo người dùng
            $user = User::create($validated);
            // gán role cho người dùng
            $user->assignRole('user');
            // kiểm tra xem có user là giới thiệu không
            $affiliated_by = $validated['aff'] ??  null;
            if ($affiliated_by) {
                Affiliate::create(['user_id' => $user->id, 'affiliated_by' => $affiliated_by]);
            }
            // dd($user);
            // 5. Trả kết quả thành công
            return response()->json([
                'message' => 'Registration successful',
                'status'  => true,
                'data'    => $user
            ], 201);
        } catch (ValidationException $e) {
            // Nếu validate lỗi, trả về JSON thông báo lỗi
            return response()->json([
                'message' => 'The provided data is invalid.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Nếu có lỗi hệ thống khác
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập và trả về access token cùng refresh token
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
                'web_id'   => 'required|exists:webs,id',
            ]);

            $web = Web::findOrFail($request->web_id);
            $credentials = $request->only('username', 'password');

            $user = User::where('username', $credentials['username'])
                ->where('web_id', $web->id)
                ->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials',
                    'status'  => false
                ], 401);
            }

            $user->getRoleNames();
            // $user->getAllPermissions();

            $accessToken = $this->generateAccessToken($user, $request);
            $refreshToken = $this->generateRefreshToken($user, $request);
            RefreshToken::where('user_id', $user->id)->delete();
            RefreshToken::create([
                'user_id' => $user->id,
                'refresh_token' => $refreshToken,
                'expires_at' => Carbon::now()->addSeconds(env('JWT_REFRESH_EXPIRE_TIME', 60 * 60 * 24 * 30)),
                'revoked' => false,
            ]);

            // Thiết lập cookie cho refresh_token (dùng HTTP, không bắt buộc HTTPS)
            $cookie = cookie(
                'refresh_token',                    // Tên cookie
                $refreshToken,                      // Giá trị cookie
                env('JWT_REFRESH_EXPIRE_TIME', 20160), // Thời gian sống (phút)
                '/',                                // Path
                null,                               // Domain (mặc định)
                false,                              // Secure = false (cho phép HTTP)
                true,                               // HttpOnly (true để bảo mật)
                false,                              // Raw
                'Strict'                            // SameSite
            );

            // Trả về response JSON và đính kèm cookie
            return response()->json([
                'access_token' => $accessToken,
            ])->withCookie($cookie);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'status'  => false,
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An internal server error occurred.',
                'status'  => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Làm mới access token bằng refresh token
     */
    public function refreshToken(Request $request)
    {
        try {
            // Lấy refresh token từ cookie (name = 'refresh_token')
            $refreshToken = $request->cookie('refresh_token');

            // Nếu không có cookie hoặc cookie rỗng, trả về lỗi 401
            if (!$refreshToken) {
                return response()->json(['error' => 'No refresh token provided'], 401);
            }

            // Kiểm tra refresh token còn hợp lệ trong database
            $refresh = RefreshToken::where('refresh_token', $refreshToken)
                ->where('revoked', false)
                ->where('expires_at', '>', now())
                ->first();

            if (!$refresh) {
                return response()->json(['error' => 'Invalid or expired refresh token'], 401);
            }

            // Lấy user tương ứng
            $user = User::find($refresh->user_id)->first();

            if (! $user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $accessToken = $this->generateAccessToken($user, $request);
            $refreshToken = $this->generateRefreshToken($user, $request);
            RefreshToken::where('user_id', $user->id)->delete();
            RefreshToken::create([
                'user_id' => $user->id,
                'refresh_token' => $refreshToken,
                'expires_at' => Carbon::now()->addSeconds(env('JWT_REFRESH_EXPIRE_TIME', 60 * 60 * 24 * 30)),
                'revoked' => false,
            ]);

            // Thiết lập cookie cho refresh_token (dùng HTTP, không bắt buộc HTTPS)
            $cookie = cookie(
                'refresh_token',                    // Tên cookie
                $refreshToken,                      // Giá trị cookie
                env('JWT_REFRESH_EXPIRE_TIME', 20160), // Thời gian sống (phút)
                '/',                                // Path
                null,                               // Domain (mặc định)
                false,                              // Secure = false (cho phép HTTP)
                true,                               // HttpOnly (true để bảo mật)
                false,                              // Raw
                'Strict'                            // SameSite
            );

            // Trả về response JSON và đính kèm cookie
            return response()->json([
                'access_token' => $accessToken,
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng xuất người dùng
     */
    public function logout(Request $request)
    {
        // Giữ nguyên logic hiện có
    }
    /**
     * Tạo mã xác thực
     */
    public function generateCode(int $length = 16)
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $code;
    }
}
