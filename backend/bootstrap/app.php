<?php

use App\Http\Middleware\AuthenticateMiddleware;
use App\Http\Middleware\JWTMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Middleware\HandleCors;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    // Đăng ký alias và nhóm middleware
    ->withMiddleware(function (Middleware $middleware) {
        // alias cho các middleware hiện có
        $middleware->alias([
            'authenticate'          => AuthenticateMiddleware::class,
            'jwt'                   => JWTMiddleware::class,        // định nghĩa alias 'cors'
            'role'                  => RoleMiddleware::class,
            'permission'            => PermissionMiddleware::class,
            'role_or_permission'    => RoleOrPermissionMiddleware::class,
        ]);

        // Đưa CORS vào nhóm api để chạy trước mọi middleware khác
        // $middleware->append(HandleCors::class);
        $middleware->group('api',  [
            HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
