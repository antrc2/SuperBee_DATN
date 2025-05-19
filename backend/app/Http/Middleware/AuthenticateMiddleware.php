<?php

namespace App\Http\Middleware;

use App\Models\Web;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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
