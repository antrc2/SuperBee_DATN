<?php

namespace App\Http\Middleware;

use App\Models\Web;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JWTMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return response()->json(['error' => 'Authorization token not provided'], 401);
        }

        $jwt = $matches[1];

        try {
            $secretKey = env('JWT_SECRET', 'your-secret-key');
            $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));

            // Ví dụ trong payload có trường api_key
            if (!isset($decoded->api_key)) {
                return response()->json(['error' => 'API key not found in token'], 401);
            }

            if (preg_match('/KEY\s(\S+)/', $decoded->api_key, $matches)) {
                $apiKey = $matches[1];
            }
            // dd($apiKey);
            $webRecord = Web::where('api_key', $apiKey)->first();

            if (!$webRecord) {
                return response()->json(['error' => 'Invalid API Key'], 401);
            }

            // Thêm web_id vào request
            $request->merge(['web_id' => $webRecord->id, 'userId' => $decoded->user_id]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid or expired token', 'message' => $e->getMessage()], 401);
        }

        return $next($request);
    }
}
