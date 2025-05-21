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
        $web = Web::where('id', $request->web_id)->first();
        $credentials = $request->only('username', 'password');


        // Tìm user theo username
        $user = \App\Models\User::where('username', $credentials['username'])->where('web_id', $web->id)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 401);
        }

        // So sánh password sử dụng SHA-512
        if (!Hash::check($credentials["password"], $user->password)) {
            return response()->json(['error' => 'Invalid password'], 401);
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
    }



    public function refreshToken(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required',
            'api_key' => 'required',
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
    }

    public function logout(Request $request)
    {
        RefreshToken::where('user_id', $request->user_id)->delete();
        return response()->json(['message' => 'Logged out', "status" => true, 'data' => []], 200);
    }
    public function register(Request $request)
    {
        // $request->validate([
        //     'username' => 'required|string|max:255|unique:users',
        //     'password' => 'required|string|min:8',
        //     'fullname' => 'required|string|max:255',
        //     'avatar_url' => 'nullable|url',
        // ]);
        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'fullname' => $request->fullname,
            'avatar_url' => $request->avatar_url,
        ]);

        return response()->json(['message' => 'User registered successfully', 'status' => true, 'data' => $user], 201);
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
