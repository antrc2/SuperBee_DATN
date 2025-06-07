<?php

use App\Http\Controllers\Admin\AdminDonatePromotionController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AuthController as ControllersAuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\User\UserCategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Callback\CardController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\User\UserProfileController;
use App\Models\User;
use Illuminate\Support\Facades\Route;




// Xác thực trang web
Route::post("/domain/active", [AuthController::class, "active"]);
// cấp lại token
Route::post('/refreshToken', [AuthController::class, "refreshToken"]);
// xác minh tài khoản
Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
// quên mật khẩu
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
// cài lại mật khẩu
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

    Route::prefix("/donate_promotions")->group(function(){
        Route::get("/",[AdminDonatePromotionController::class,'index']);
        Route::get("/{id}",[AdminDonatePromotionController::class,'show']);
    });
    

});


// user
Route::middleware(['jwt'])->group(function () {
    // đăng xuất
    Route::post("/logout", [AuthController::class, 'logout']);
    // info
    Route::prefix('/user')->group(function () {
        Route::get('/profile', [UserProfileController::class, 'show']);
        Route::post('/profile-update', [UserProfileController::class, 'update']);
        Route::post('/change-password', [UserProfileController::class, 'changePassword']);
    });
    Route::prefix('/accounts')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']); // Sửa thành {id}
        Route::delete('/{id}', [UserController::class, 'destroy']); // Sửa thành {id} và kiểm tra method cho delete
        Route::patch('/{id}', [UserController::class, 'restore']); // Sửa thành {id}
        Route::patch('/key/{id}', [UserController::class, 'key']); // Sửa thành {id}
    });


    Route::prefix("/donate")->group(function(){
        Route::prefix("/card")->group(function(){
            Route::post("/",[CardController::class,'store']);
        });
        Route::prefix("/bank")->group(function(){
            // Route::post()
        });
    });

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
        // User Category
        Route::get("/getCate",[UserCategoryController::class,'index']);
        Route::get("/getCate/{id}",[UserCategoryController::class,'show']);
    Route::prefix("/products")->group(function(){
        Route::get("/",[AdminProductController::class,'index']);
        Route::get("/{id}",[AdminProductController::class,'show']);

    });
});
    Route::prefix('/donate_promotions')->group(function(){
        Route::get("/",[AdminDonatePromotionController::class,'index']);
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
    Route::post("/card", [CardController::class,'callback']);
    Route::post("/bank");
});
