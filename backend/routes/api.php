<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AuthController as ControllersAuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\User\UserCategoryController;
use App\Http\Controllers\User\UserProfileController;
use App\Models\User;
use Illuminate\Support\Facades\Route;




// Xác thực trang web
Route::post("/domain/active", [AuthController::class, "active"]);
// cấp lại token
Route::post('/refreshToken', [AuthController::class, "refreshToken"]);
// xác minh tài khoản
Route::get('/verify-email', [AuthController::class, 'verifyEmail']); // Sử dụng GET vì nó là link từ email
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
// chưa đăng nhập
Route::middleware('authenticate')->group(function () {
    Route::get('/', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
    });
    Route::prefix("/domain")->group(function () {
        Route::get("/", [AuthController::class, "domain"]);
    });
    Route::prefix("/accounts")->group(function () {
        Route::post("/login", [AuthController::class, 'login']);
        Route::post("/register", [AuthController::class, 'register']);
    });
});


// user
Route::middleware(['jwt'])->group(function () {
    Route::post("/logout", [AuthController::class, 'logout']);
    Route::get('/user/profile', [UserProfileController::class, 'show']);
    Route::post('/user/profile-update', [UserProfileController::class, 'update']);
    Route::post('/user/change-password', [UserProfileController::class, 'changePassword']); // <-- Thêm dòng này
    Route::get('/abc', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
    });
    Route::prefix('categories')->group(function(){
        Route::get('/',[CategoryController::class,'index']);
        Route::post('/',[CategoryController::class,'store']);
        Route::put('/{id}',[CategoryController::class,'update']);
        Route::delete('/{id}',[CategoryController::class,'destroy']);
        Route::get('/{id}',[CategoryController::class,'show']);
        // User Category
        Route::get("/getCate",[UserCategoryController::class,'index']);
        Route::get("/getCate/{id}",[UserCategoryController::class,'show']);
    });
});

// admin
Route::middleware(['role:admin', 'jwt'])->prefix('/')->group(function () {
    Route::get('/', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
    });
    
});

Route::prefix("/callback")->group(function () {
    Route::post("/card");
    Route::post("/bank");
});