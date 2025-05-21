<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use App\Models\Web;
use App\Models\RefreshToken;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
    protected function generateRefreshToken($user, Request $request)
    {
        $payload = [
            'sub' => $user->id,
            "web_id" => $request->web_id,
            'type' => 'refresh',
            'exp' => time() + env('JWT_REFRESH_EXPIRE_TIME', 60 * 60 * 24 * 30) // 30 ngày
        ];

        return JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256');
    }

    public function me(Request $request)
    {
        return response()->json(User::find($request->userId));
    }
    protected function buildJwtClaims($user, Request $request): array
    {
        return [
            'user_id' => $user->id,
            'username' => $user->username,
            'web_id' => $user->web_id,
            'role_id' => $user->role_id,
            'api_key' => $request->header('ShopKey'),
        ];
    }
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


            // Tìm user theo username
            $user = \App\Models\User::where('username', $credentials['username'])->where('web_id', $web->id)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'User not found',
                    'status'  => false
                ], 401);
            }

            // So sánh password sử dụng Bcrypt
            if (!Hash::check($credentials["password"], $user->password)) {
                return response()->json([
                    'message' => 'Invalid password',
                    'status'  => false
                ], 401);
            }
            // ✅ Build payload + tạo access token
            $claims = $this->buildJwtClaims($user, $request);
            $accessToken = auth()->claims($claims)->login($user);

            // Tạo refresh token
            $refreshToken = $this->generateRefreshToken($user, $request);

            RefreshToken::create([
                'user_id' => $user->id,
                'refresh_token' => $refreshToken,
                'expires_at' => Carbon::now()->addDays(env('JWT_REFRESH_EXPIRE_TIME', 30)),
                'revoked' => false,
            ]);

            return response()->json([
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60

            ]);
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



    public function refreshToken(Request $request)
    {
        try {
            $request->validate([
                'refresh_token' => 'required',
            ]);

            $refresh = RefreshToken::where('refresh_token', $request->refresh_token)
                ->where('revoked', false)
                ->where('expires_at', '>', now())
                ->first();

            if (!$refresh) return response()->json(['error' => 'Invalid or expired refresh token'], 401);

            $web = Web::where('api_key', $request->api_key)->first();
            if (!$web || $web->user_id !== $refresh->user_id) {
                return response()->json(['error' => 'API Key mismatch'], 401);
            }

            $user = User::find($refresh->user_id);
            $newAccessToken = $this->generateAccessToken($user, $request->api_key);

            return response()->json([
                'access_token' => $newAccessToken,
                'expires_in' => env('JWT_EXPIRE_TIME', 3600)
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'The provided data is invalid.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            RefreshToken::where('user_id', $request->user_id)->delete();
            $user = User::find($request->user_id);
            return response()->json(['message' => 'Logged out', "status" => true, 'data' => ["user" => $user]], 200);
        } catch (\Exception  $e) {
            return response()->json([
                'message' => 'An internal server error occurred.',
                'status'  => false,
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function register(Request $request)
    {
        try {
            // 1. Validate dữ liệu
            $validated = $request->validate([
                'username'   => [
                    'required',
                    'string',
                    Rule::unique('users')->where(function ($query) use ($request) {
                        return $query->where('web_id', $request->web_id ?? 1);
                    }),
                ],
                'password'   => 'required|string|min:6',
                'fullname'   => 'required|string|max:255',
                'avatar_url' => 'required|url',
                'email'      => 'nullable|email|unique:users,email',
                'phone'      => 'nullable|string|max:20',
                'web_id'     => 'nullable|exists:webs,id',
            ]);

            // 2. Mã hóa mật khẩu
            $validated['password'] = Hash::make($validated['password']);

            // 3. Gán mặc định web_id nếu chưa có
            $validated['web_id'] = $validated['web_id'] ?? 1;

            // 4. Tạo người dùng
            $user = User::create($validated);

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
    public function generateAccessToken($user, $apiKey)
    {
        $payload = [
            'sub' => $user->id,
            'web_id' => $user->web_id,
            'api_key' => $apiKey,
            'exp' => time() + env('JWT_EXPIRE_TIME', 60 * 60) // 1 giờ
        ];

        return JWT::encode($payload, env('JWT_SECRET_KEY'), 'HS256');
    }
}
