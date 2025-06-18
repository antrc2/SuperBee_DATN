<?php

namespace App\Http\Middleware;

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
                $request->merge([
                    'web_id' => $decoded->web_id,
                ]);
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
            $emailData = [
                'subject' => 'Thông báo: Website của bạn không hoạt động',
                'greeting' => 'Chào bạn,',
                'message' => "Chúng tôi nhận thấy rằng API key của website **$domain** của bạn đang được sử dụng nhưng trạng thái của website hiện không hoạt động. Vui lòng kiểm tra lại để website hoạt động bình thường.",
                'closing' => 'Trân trọng,',
                'app_name' => config('app.name'),
                'apiKey' => $key
            ];
    
            try {
                Mail::to($recipientEmail)->queue(new SendEmailDomain($emailData));
            } catch (\Exception $e) {
                // Log lỗi nếu gửi email thất bại
                // \Log::error("Failed to send deactivation email to $recipientEmail for domain $domain: " . $e->getMessage());
                // Không nên `echo` trong middleware, hãy log hoặc xử lý lỗi một cách phù hợp.
            }
        }
    }

