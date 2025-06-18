<?php

namespace App\Http\Middleware;

use App\Models\Web;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Mail; // Import the Mail facade
use App\Mail\SendEmailDomain;
use App\Models\User;

class AuthenticateMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('authorization');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {

            return response()->json(['error' => 'API Key not provided'], 401);
        }
        // dd($authHeader);
        $apiKey = $matches[1];

        // Tìm API key trong database
        $apiKeyRecord = Web::where('api_key', $apiKey)->first();

        if (!$apiKeyRecord) {
            return response()->json(['error' => 'Invalid API Key', 'code' => 'NO_API_KEY'], 401);
        }
        if ($apiKeyRecord->status == 0) {
            // Web is not active
            // Send email notification to the web owner or admin
            $user = User::findOrFail($apiKeyRecord->user_id);

            if ($user) { // Ensure the email exists
                $this->sendDeactivationEmail($user->email, $apiKeyRecord->subdomain, $apiKeyRecord->api_key);
            }
            return response()->json(["error" => "WEB_NOT_ACTIVE", "code" => "NO_ACTIVE"], 404);
        }
        // Lấy web_id từ bản ghi
        $webId = $apiKeyRecord->id;
        // $userId = $apiKeyRecord->user_id;

        // Thêm web_id vào request
        $request->merge(['web_id' => $webId]);

        return $next($request);
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
            // Log the error if the email sending fails
            // \Log::error("Failed to send deactivation email to $recipientEmail for domain $domain: " . );
            echo $e->getMessage();
            return;
        }
    }
}
