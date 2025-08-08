<?php

namespace App\Http\Middleware;

use App\Events\SystemNotification;
use App\Models\Web;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendEmailDomain;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Illuminate\Support\Facades\Auth;

class CheckApiKey
{
    public function handle(Request $request, Closure $next): Response
    {

        // 1. Ưu tiên kiểm tra JWT (Access Token) trước
        $authHeader = $request->header('Authorization');

        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            try {
                $secretKey = env('JWT_SECRET_KEY');
                if (!$secretKey) {
                    return response()->json([
                        'message' => 'JWT secret key not configured.',
                        'errorCode' => 'JWT_SECRET_NOT_SET'
                    ], 500); // Internal Server Error
                }
                $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
                // Check for essential claims in the token payload
                if (!isset($decoded->web_id)) {
                    return response()->json([
                        'message' => 'Web ID not found in token payload.',
                        'errorCode' => 'PAYLOAD_MISSING_WEB_ID'
                    ], 401);
                }
                if (!isset($decoded->user_id)) {
                    return response()->json([
                        'message' => 'User ID not found in token payload.',
                        'errorCode' => 'PAYLOAD_MISSING_USER_ID'
                    ], 401);
                }
                $user = User::where('id', $decoded->user_id)
                    ->where('web_id', $decoded->web_id)
                    ->first();
                if (!$user) {
                    return response()->json([
                        'message' => 'User not found for provided token.',
                        'errorCode' => 'USER_NOT_FOUND'
                    ], 401);
                }
                if($user->status == 2){
                     return response()->json([
                        'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
                        'status' => false,
                        'code' => 'LOCKED_ACCOUNT'
                    ], 401);
                }
                Auth::guard(name: 'api')->setUser($user);
                $roles = $user->getRoleNames();
                $request->merge([
                    'web_id' => $decoded->web_id,
                    'user_id' => $decoded->user_id,
                    'role' => $roles[0],
                ]);
            } catch (ExpiredException $e) {
                return response()->json([
                    'message' => 'Token has expired.',
                    'errorCode' => 'TOKEN_EXPIRED'
                ], 401);
            } catch (SignatureInvalidException $e) {
                return response()->json([
                    'message' => 'Invalid token signature.', // Covers JsonWebTokenError from your JS
                    'errorCode' => 'INVALID_TOKEN_SIGNATURE'
                ], 401);
            } catch (BeforeValidException $e) {
                return response()->json([
                    'message' => 'Token is not yet valid (check nbf claim).', // Covers NotBeforeError
                    'errorCode' => 'TOKEN_NOT_ACTIVE'
                ], 401);
            } catch (\UnexpectedValueException $e) {
                // This can catch a range of issues, including malformed tokens,
                // wrong number of segments, or issues with the algorithm.
                return response()->json([
                    'message' => 'Invalid token format or structure.',
                    'errorCode' => 'INVALID_TOKEN_FORMAT',
                    'detail' => $e->getMessage()
                ], 401);
            } catch (\Exception $e) {
                // General catch-all for other JWT related or unexpected errors
                return response()->json([
                    'message' => 'Token authentication failed.',
                    'errorCode' => 'TOKEN_AUTHENTICATION_FAILED',
                    'detail' => $e->getMessage()
                ], 401);
            }
            return $next($request);
        }

        // 2. Nếu không có JWT hoặc JWT không hợp lệ, tiếp tục kiểm tra API Key
        $apiKey = $request->header('X-API-KEY'); // Sử dụng X-API-KEY cho API Key để phân biệt rõ ràng
        if (!empty($apiKey)) {
            $apiKeyRecord = Web::where('api_key', $apiKey)->first();

            if (!$apiKeyRecord) {
                return response()->json(['error' => 'Invalid API Key', 'code' => 'NO_API_KEY'], 401);
            }

            if ($apiKeyRecord->status == 0) {
                // Web không hoạt động, gửi email thông báo
                $user = User::find($apiKeyRecord->user_id); // Dùng find thay vì findOrFail để tránh exception nếu user không tồn tại

                if ($user) {
                    $this->sendDeactivationEmail($user->email, $apiKeyRecord->subdomain, $apiKeyRecord->api_key);
                }
                return response()->json(["error" => "WEB_NOT_ACTIVE", "code" => "NO_ACTIVE"], 404);
            }

            // Gắn web_id vào request
            $request->merge(['web_id' => $apiKeyRecord->id]);
            // Tùy chọn: gắn thêm thông tin khác của web nếu cần
            // $request->merge(['web_name' => $apiKeyRecord->name]);

            return $next($request);
        }

        // 3. Nếu không có cả JWT và API Key, hoặc cả hai đều không hợp lệ
        return response()->json(['message' => 'Unauthorized: Authentication token or API Key required', 'errorCode' => 'NO_AUTH_METHOD_PROVIDED'], 401);


        /**
         * Gửi email thông báo khi web không hoạt động.
         * @param string $recipientEmail
         * @param string $domain
         * @param string $key
         * @return void
         */
    }
    protected function sendDeactivationEmail(string $recipientEmail, string $domain, string $key): void
    {
        try {
            $messageContent = "Chúng tôi nhận thấy rằng API key của website {$domain} của bạn đang được sử dụng, nhưng trạng thái của website hiện không hoạt động. Vui lòng kiểm tra lại để đảm bảo website của bạn hoạt động bình thường. key của web bạn: {$key}";
            $payload = [
                'email' => $recipientEmail,
                "username" => "Trần Văn Long",
                "domainName" => $domain,
                "message" => $messageContent
            ];
            event(new SystemNotification(
                'EMAIL_DOMAIN', // Loại thông báo
                $payload
            ));
        } catch (\Exception $e) {
            // Log lỗi nếu gửi email thất bại
            // \Log::error("Failed to send deactivation email to $recipientEmail for domain $domain: " . $e->getMessage());
            // Không nên `echo` trong middleware, hãy log hoặc xử lý lỗi một cách phù hợp.
        }
    }
}
