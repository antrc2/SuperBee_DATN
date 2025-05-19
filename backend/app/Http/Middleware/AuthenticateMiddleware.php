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
        $authHeader = $request->header('shopkey');

        if (!$authHeader || !preg_match('/Key\s(\S+)/', $authHeader, $matches)) {
            return response()->json(['error' => 'API Key not provided'], 401);
        }

        $apiKey = $matches[1];

        // Tìm API key trong database
        $apiKeyRecord = Web::where('api_key', $apiKey)->first();

        if (!$apiKeyRecord) {
            return response()->json(['error' => 'Invalid API Key'], 401);
        }

        // Lấy web_id từ bản ghi
        $webId = $apiKeyRecord->id;
        // $userId = $apiKeyRecord->user_id;

        // Thêm web_id vào request
        $request->merge(['web_id' => $webId, 'shopkey' => $authHeader]);

        return $next($request);
    }
}
