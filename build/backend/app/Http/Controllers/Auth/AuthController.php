<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\ResetPassword;
use App\Mail\VerifyEmail;
use App\Models\Affiliate;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Web;
use App\Models\RefreshToken;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log; // Added for logging
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * Handles domain activation status.
     * This method appears to be a placeholder and always returns a 'WEB_NOT_ACTIVE' error.
     * Consider implementing actual domain validation logic here.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function domain(Request $request)
    {
        // This method currently always returns an error.
        // Implement actual domain validation logic here if needed.
        return response()->json([
            "error" => "WEB_ACTIVE",
            "code" => "ACTIVE"
        ], 200);
    }

    /**
     * Activates a web instance using a provided API key.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function active(Request $request)
    {
        $request->validate([
            'keyShop' => 'required|string',
        ]);

        $shopKey = $request->keyShop;
        $shop = Web::where('api_key', $shopKey)->first();

        if (is_null($shop)) {
            return response()->json([
                "message" => "Key does not exist or is incorrect.",
                "status" => false
            ], 401);
        }

        $shop->status = 1;
        $shop->save();

        return response()->json([
            "message" => "Web activation successful.",
            "status" => true
        ], 200);
    }

    /**
     * Encodes a JWT token with the given payload, expiration time, and type.
     * Uses different secret keys for access and refresh tokens.
     *
     * @param array $payload
     * @param int $expireTime
     * @param string $type "acc" for access token, "ref" for refresh token.
     * @return string The encoded JWT token.
     */
    protected function encodeToken(array $payload, int $expireTime, string $type): string
    {
        $payload['exp'] = time() + $expireTime;
        if ($type === "acc") {
            return JWT::encode($payload, (string)env('JWT_SECRET_KEY'), 'HS256');
        }

        if ($type === "ref") {
            return JWT::encode($payload, (string)env('JWT_SECRET'), 'HS256');
        }

        // Fallback or error for unknown token type
        throw new \InvalidArgumentException("Invalid token type provided.");
    }

    /**
     * Generates an access token for the given user.
     *
     * @param User $user
     * @param Request $request (kept for consistency with original, though not directly used in payload)
     * @return string The generated access token.
     */
    protected function generateAccessToken(User $user, Request $request): string
    {
        $wallet = Wallet::where('user_id', $user->id)->first();
        $payload = [
            'name' => $user->username,
            'user_id' => $user->id,
            'web_id' => $user->web_id,
            'avatar' => $user->avatar_url, 
            'role_ids' => $user->getRoleNames()->toArray(), // Use array for role names
            'money' => $wallet->balance ?? "0"
        ];
        $expireTime = (int)env('JWT_ACCESS_TOKEN_TTL', 3600); // Default to 1 hour
        // dd(time() + $expireTime, date('Y-m-d H:i:s'));
        return $this->encodeToken($payload, $expireTime, "acc");
    }

    /**
     * Generates a refresh token for the given user.
     *
     * @param User $user
     * @param Request $request (kept for consistency with original, though not directly used in payload)
     * @return string The generated refresh token.
     */
    protected function generateRefreshToken(User $user, Request $request): string
    {
        $payload = [
            'name' => $user->username,
            'user_id' => $user->id,
            'web_id' => $user->web_id,
            'role_ids' => $user->getRoleNames()->toArray(), // Use array for role names
        ];
        $expireTime = (int)env('JWT_REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30); // Default to 30 days

        return $this->encodeToken($payload, $expireTime, "ref");
    }

    /**
     * Registers a new user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'username' => ['required', 'string', 'unique:users,username,NULL,id,web_id,' . $request->web_id],
                'password' => 'required|string|min:6',
                'email' => ['required', 'email', 'unique:users,email,NULL,id,web_id,' . $request->web_id],
                'web_id' => 'required|exists:webs,id',
                'aff' => 'nullable|exists:users,id',
            ]);

            // Check if user with this email already exists on this web_id
            $is_user = User::where('email', $validatedData['email'])
                ->where('web_id', $validatedData['web_id'])
                ->first();

            if ($is_user) {
                return response()->json([
                    'message' => 'Account with this email already exists on this website.',
                    'status' => false,
                    'data' => []
                ], 409); // Use 409 Conflict for resource conflicts
            }

            $validatedData['password'] = Hash::make($validatedData['password']);

            $donate_code = "";
            do {
                $donate_code = $this->generateCode(16);
            } while (User::where("donate_code", $donate_code)->exists()); // Use exists() for efficiency

            $validatedData['donate_code'] = $donate_code;
            $tokenEmail = Str::random(60);
            $validatedData['email_verification_token'] = $tokenEmail;

            $validatedData['email_verification_expires_at'] =  now()->addSeconds((int)env('EMAIL_VERIFICATION_TTL', 3600));
            $user = User::create($validatedData);
            $user->assignRole('user'); // Assign 'user' role

            // Handle affiliate
            if (isset($validatedData['aff'])) {
                Affiliate::create([
                    'user_id' => $user->id,
                    'affiliated_by' => $validatedData['aff']
                ]);
            }
            // Gửi email xác minh tài khoản
            Mail::to($user->email)->queue(new VerifyEmail($tokenEmail, $user->username));

            return response()->json([
                'message' => 'Đăng ký thành công! Vui lòng kiểm tra email của bạn để kích hoạt tài khoản.',
                'status' => true,
                'data' => []
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'The provided data is invalid.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Registration error: " . $e->getMessage() . " on line " . $e->getLine());
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $user = User::where('email_verification_token', $request->token)
            ->where('email_verification_expires_at', '>', now())
            ->first();
        if (!$user) {
            return response()->json(['message' => 'Mã kích hoạt không hợp lệ hoặc đã hết hạn.'], 400);
        }

        $user->email_verified_at = now();
        $user->email_verification_token = null; // Xóa token sau khi dùng
        $user->email_verification_expires_at = null; // Xóa thời gian hết hạn
        $user->status = 1; // Kích hoạt tài khoản
        $user->save();
        // // Create wallet
        Wallet::create([
            'user_id' => $user->id,
            "balance" => 0,
            "currency" => "VND"
        ]);

        $accessToken = $this->generateAccessToken($user, $request);
        $refreshToken = $this->generateRefreshToken($user, $request);

        // Delete any existing refresh tokens for this user before creating a new one
        RefreshToken::where('user_id', $user->id)->delete();
        RefreshToken::create([
            'user_id' => $user->id,
            'refresh_token' => $refreshToken,
            'expires_at' => Carbon::now()->addSeconds((int)env('JWT_REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30)),
            'revoked' => false,
        ]);

        $cookieExpirationMinutes = (int)env('JWT_REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30) / 60; // Convert seconds to minutes

        $cookie = cookie(
            'refresh_token',
            $refreshToken,
            $cookieExpirationMinutes,
            '/',
            null,
            true, // Secure: true in production, false otherwise
            true, // HttpOnly
            false, // Raw
            'none' // SameSite
        );

        return response()->json([
            "message" => "Tài khoản của bạn đã được kích hoạt thành công!",
            'access_token' => $accessToken,
            'status' => true
        ], 200)->withCookie($cookie);
    }

    /**
     * Sends a password reset email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Trả về thông báo chung để tránh tiết lộ email nào tồn tại
            return response()->json(['message' => 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.'], 200);
        }

        $token = $this->generateCode(20);
        $user->password_reset_token = $token;
        $user->password_reset_expires_at = now()->addSeconds((int)env('PASSWORD_RESET_TTL', 3600));
        $user->save();

        try {
            Mail::to($user->email)->queue(new ResetPassword($token, $user->username));
            return response()->json(['message' => 'Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.'], 200);
        } catch (\Exception $e) {

            return response()->json(['message' => 'Không thể gửi email đặt lại mật khẩu lúc này. Vui lòng thử lại sau.'], 500);
        }
    }

    /**
     * Resets the user's password using a token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('password_reset_token', $request->token)
            ->where('password_reset_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'], 400);
        }

        $user->password = Hash::make($request->password);
        $user->password_reset_token = null; // Xóa token sau khi dùng
        $user->password_reset_expires_at = null; // Xóa thời gian hết hạn
        $user->save();

        return response()->json(['message' => 'Mật khẩu của bạn đã được đặt lại thành công.'], 200);
    }


    /**
     * Logs in a user and returns access and refresh tokens.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
                'web_id' => 'required|exists:webs,id',
            ]);

            $web = Web::findOrFail($validatedData['web_id']);

            $user = User::where('username', $validatedData['username'])
                ->where('web_id', $web->id)
                ->first();
            if ($user->status === 0) {
                return response()->json([
                    'message' => 'tài khoản bạn chưa kích hoạt',
                    'status' => false
                ], 401);
            }
            if ($user->status === 3) {
                return response()->json([
                    'message' => 'tài khoản bạn bị khóa',
                    'status' => false
                ], 401);
            }

            if (!$user || !Hash::check($validatedData['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials.',
                    'status' => false
                ], 401);
            }

            $accessToken = $this->generateAccessToken($user, $request);
            $refreshToken = $this->generateRefreshToken($user, $request);

            RefreshToken::where('user_id', $user->id)->delete();
            RefreshToken::create([
                'user_id' => $user->id,
                'refresh_token' => $refreshToken,
                'expires_at' => Carbon::now()->addSeconds((int)env('JWT_REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30)),
                'revoked' => false,
            ]);

            $cookieExpirationMinutes = env('JWT_REFRESH_TOKEN_TTL', 60 * 60 * 24 * 30) / 60;

            $cookie = cookie(
                'refresh_token',
                $refreshToken,
                $cookieExpirationMinutes,
                '/',
                null,
                true, // Secure: true in production, false otherwise
                true, // HttpOnly
                false, // Raw
                'none' // SameSite
            );

            return response()->json([
                "message" => "Login successful",
                'access_token' => $accessToken,
            ])->withCookie($cookie);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'status' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("Login error: " . $e->getMessage() . " on line " . $e->getLine());
            return response()->json([
                'message' => 'An internal server error occurred.',
                'status' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refreshes the access token using a valid refresh token from the cookie.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function refreshToken(Request $request)
    {
        try {

            $refreshToken = $request->cookie('refresh_token');

            if (empty($refreshToken)) {
                return response()->json(['error' => 'No refresh token provided.'], 402);
            }

            $refresh = RefreshToken::where('refresh_token', $refreshToken)
                ->where('revoked', false)
                ->where('expires_at', '>', Carbon::now())
                ->first();

            if (is_null($refresh)) {
                return response()->json(['error' => 'Invalid or expired refresh token.'], 408);
            }

            $user = User::find($refresh->user_id);

            if (is_null($user)) {
                return response()->json(['error' => 'User not found.'], 404);
            }

            $newAccessToken = $this->generateAccessToken($user, $request);
            $newRefreshToken = $this->generateRefreshToken($user, $request);

            // Invalidate the old refresh token and create a new one
            $refresh->delete(); // Delete the old refresh token
            RefreshToken::create([
                'user_id' => $user->id,
                'refresh_token' => $newRefreshToken,
                'expires_at' => Carbon::now()->addSeconds((int)env(key: 'JWT_REFRESH_TOKEN_TTL')),
                'revoked' => false,
            ]);

            $cookieExpirationMinutes = (int)env('JWT_REFRESH_TOKEN_TTL');

            $cookie = cookie(
                'refresh_token',
                $newRefreshToken,
                $cookieExpirationMinutes,
                '/',
                null,
                true, // Secure: true in production, false otherwise
                true, // HttpOnly
                false, // Raw
                'none' // SameSite
            );

            return response()->json([
                'access_token' => $newAccessToken,
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error("Refresh Token error: " . $e->getMessage() . " on line " . $e->getLine());
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logs out the user by revoking their refresh token.
     * This function needs to be implemented.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('refresh_token');
            if (empty($refreshToken)) {
                return response()->json(['message' => 'No refresh token provided.'], 200);
            }
            // Find and revoke the refresh token
            $refresh = RefreshToken::where('refresh_token', $refreshToken)->delete();

            // Clear the refresh token cookie
            $cookie = cookie()->forget('refresh_token');

            return response()->json([
                'message' => 'Logged out successfully.'
            ])->withCookie($cookie);
        } catch (\Exception $e) {
            Log::error("Logout error: " . $e->getMessage() . " on line " . $e->getLine());
            return response()->json([
                'message' => 'An internal server error occurred.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generates a random alphanumeric code of a specified length.
     *
     * @param int $length The desired length of the code.
     * @return string The generated code.
     */
    public function generateCode(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $max)];
        }
        return $code;
    }
}
