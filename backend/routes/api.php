<?php

use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AuthController as ControllersAuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\User\UserProfileController;
use Illuminate\Support\Facades\Route;




// Xác thực trang web
Route::post("/domain/active", [AuthController::class, "active"]);
// cấp lại token
Route::post('/refreshToken', [AuthController::class, "refreshToken"]);
// xác minh tài khoản
Route::get('/verify-email', [AuthController::class, 'verifyEmail']); // Sử dụng GET vì nó là link từ email
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::middleware('authenticate')->group(function () {
    Route::get('/', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
    });

    Route::prefix('/products')->group(function(){
        Route::get("/",[UserProductController::class,'index']);
        Route::get("/{id}", [UserProductController::class,'show']);
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
    });
    Route::prefix("/products")->group(function(){
        Route::get("/",[AdminProductController::class,'index']);
        Route::get("/{id}",[AdminProductController::class,'show']);
    });
});

// admin
Route::middleware(['role:admin', 'jwt'])->prefix('/admin')->group(function () {
    Route::get('/', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
    });

// {
//     "category_id": 1,
//     "price": 123,
//     "sale": 123,
//     "username": "abc",
//     "password": "abc",
//     "images": [
//         {   
//             "alt_text": "abc",
//             "image_url": "abc"
//         },
//         {
//             "alt_text": "abc",
//             "image_url": "abc"
//         }
//     ],
//     "attributes": [
//         {
//             "attribute_key": "attribute_value"
//         },
//         {
//             "attribute_key": "attribute_value"
//         }
//     ]
// }

    Route::prefix("/products")->group(function(){
        Route::get("/",[AdminProductController::class,'index']);
        Route::get("/{id}",[AdminProductController::class,'show']);
        Route::post('/',[AdminProductController::class,'store']);
        Route::put('/{id}',[AdminProductController::class,'update']);
    });
});

Route::prefix("/callback")->group(function () {
    Route::post("/card");
    Route::post("/bank");
});