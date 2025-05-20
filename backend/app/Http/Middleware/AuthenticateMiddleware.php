<?php

namespace App\Http\Middleware;

use App\Mail\SendEmailDomain;
use App\Models\User;
use App\Models\Web;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;


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

            return response()->json(['error' => 'Invalid API Key', "code" => "NO_API_KEY"], 401);

        }
        if ($apiKeyRecord->status == 0) {
            $userID = $apiKeyRecord->user_id;

            $user = User::where("id", $userID)->first();

            if ($user && $user->email) {
                $data = [
                    'name' => $user->fullname,
                    'message' => 'Đây là email thử nghiệm từ Hải',
                    "apiKey" => $apiKeyRecord->api_key
                ];
                try {
                    Mail::to($user->email)->queue(new SendEmailDomain($data));
                } catch (\Exception $e) {

                    return response()->json(["error" => "WEB_NOT_ACTIVE", "code" => "SendEmailFAIL"], 404);
                }
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
}
