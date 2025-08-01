<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Illuminate\Support\Facades\Auth;
use App\Models\Web; // Assuming you might use this later, but not directly in this improved auth logic
class JWTMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return response()->json([
                'message' => 'Authorization token not provided.',
                'errorCode' => 'TOKEN_NOT_PROVIDED'
            ], 401);
        }
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
            Auth::guard(name: 'api')->setUser($user); 
            $roles = $user->getRoleNames();
            $request->merge([
                'web_id' => $decoded->web_id,
                'user_id' => $decoded->user_id,
                'role'=> $roles[0],
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
}
