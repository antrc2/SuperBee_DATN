<?php

use App\Http\Controllers\Admin\AdminDonatePromotionController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\User\UserCategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Callback\BankController;
use App\Http\Controllers\Callback\CardController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\UserProfileController;
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

Route::prefix("/callback")->group(function () {

    Route::post("/card", [CardController::class, 'callback']);



    // Route::post("/bank2", [BankController::class,'callback2']);
    Route::post("/bank/donate", [BankController::class, 'donate']);
    Route::post("/bank/withdraw", [BankController::class, "withdraw"]);
});

// Những router client chưa và đã đăng nhập
Route::middleware('authenticate')->group(function () {
    // chưa đăng nhập
    Route::prefix('/home')->group(function () {
        Route::get("/", [HomeController::class, 'index']);
    });
    Route::prefix("/categories")->group(function(){
        Route::get("/", [UserCategoryController::class, 'index']);
        Route::get("/{id}", [UserCategoryController::class, 'show']);
    });
    Route::prefix('/products')->group(function () {
        Route::get("/{slug}", [UserProductController::class, 'index']);
        Route::get("/acc/{id}", [UserProductController::class, 'show']);
    });
    Route::prefix("/domain")->group(function () {
        Route::get("/", [AuthController::class, "domain"]);
    });
    Route::prefix("/accounts")->group(function () {
        Route::post("/login", [AuthController::class, 'login']);
        Route::post("/register", [AuthController::class, 'register']);
    });
    Route::prefix("/donate_promotions")->group(function () {
        Route::get("/", [AdminDonatePromotionController::class, 'index']);
        Route::get("/{id}", [AdminDonatePromotionController::class, 'show']);
    });
//   đã đăng nhập 
Route::middleware(['jwt'])->group(function () {
    // đăng xuất
    Route::post("/logout", [AuthController::class, 'logout']);
    // info
    Route::prefix('/user')->group(function () {
        Route::get('/profile', [UserProfileController::class, 'show']);
        Route::post('/profile-update', [UserProfileController::class, 'update']);
        Route::post('/change-password', [UserProfileController::class, 'changePassword']);
    });
        // Dữ liệu gửi vào đây nhé 
    // {
    //     "telco": "VIETTEL",
    //     "amount": 10000,
    //     "serial": "2161199621343",
    //     "code": "369404179833759"
    // }
    Route::prefix("/donate")->group(function () {
        Route::prefix("/card")->group(function () {
            Route::post("/", [CardController::class, 'store']);
        });
    });
    Route::prefix('/donate_promotions')->group(function () {
        Route::get("/", [AdminDonatePromotionController::class, 'index']);
    });

     Route::prefix("/cart")->group(function () {
        Route::get("/", [UserCartController::class, 'index']);
        Route::post("/", [UserCartController::class, 'store']);
        Route::delete("/{id}", [UserCartController::class, 'destroy']);
    });
});



// admin
Route::middleware(['jwt'])->group(function () {
    Route::middleware(['role:admin'])->prefix('/admin')->group(function () {
        Route::get('/', function () {
            return response()->json([
                "status" => false,
                "data" => [],
                'message' => "no message"
            ]);
        });

        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
            Route::get('/{id}', [CategoryController::class, 'show']);
            // User Category


        });
        Route::prefix('/accounts')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::delete('/{id}', [UserController::class, 'destroy']); // Sửa thành {id} và kiểm tra method cho delete
            Route::patch('/key/{id}', [UserController::class, 'key']); // Sửa thành {id}
            Route::patch('/{id}', [UserController::class, 'restore']); // Sửa thành {id}
    });
        Route::prefix("/products")->group(function () {
            Route::get("/", [AdminProductController::class, 'index']);
            Route::get("/{id}", [AdminProductController::class, 'show']);
            Route::post('/', [AdminProductController::class, 'store']);
            
            Route::post("/{id}/deny", [AdminProductController::class,'deny']); // Từ chối sản phẩm
            Route::post("/{id}/accept", [AdminProductController::class,'accept']); // Chấp nhận sản phẩm 
            Route::post("/{id}/restore", [AdminProductController::class,'restore']); // Sau khi hủy bán, tôi muốn bán lại
            Route::post("/{id}/cancel",[AdminProductController::class,'cancel']); // Người bán hủy bán
            Route::put('/{id}', [AdminProductController::class, 'update']);
            // Route::post("/")
        });
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


});


