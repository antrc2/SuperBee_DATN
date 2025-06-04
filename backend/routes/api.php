<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;




// Xác thực trang web
Route::post("/domain/active", [AuthController::class, "active"]);
// cấp lại token
Route::post('/refreshToken', [AuthController::class, "refreshToken"]);

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
    Route::get('/abc', function () {
        return response()->json([
            "status" => false,
            "data" => [],
            'message' => "no message"
        ]);
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




















// Route::prefix("/callback")->group(function () {
//     Route::post("/card");
//     Route::post("/bank");
// });
// // use App\Http\Controllers\ImageUploadController;

// Route::post('/upload-image', [AWSController::class, 'upload']);
// Route::post("/domain/active", [HomeController::class, "active"]);


// Route::post("/domain/active", [HomeController::class, "active"]);
// Route::middleware(['authenticate'])->group(function () {


//     Route::prefix("/accounts")->group(function () {
//         Route::post("/login", [AuthController::class, 'login']);
//         Route::post("/register", [AuthController::class, 'register']);
//     });
//     // Categories
//     Route::prefix('/categories')->group(function () {
//         Route::get("/", [CategoryController::class, 'index']);
//         Route::get("/{id}", [CategoryController::class, 'show']);
//     });

//     Route::prefix('/products')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//     });
//     Route::prefix('/news')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//     });
//     Route::prefix('/reviews')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//     });

//     Route::prefix('/donate_promotions')->group(function () {
//         Route::get("/", [DonatePromotionController::class, 'index']);
//         Route::get("/{id}", [DonatePromotionController::class, 'show']);
//     });
//     Route::prefix('/bank_histories')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//     });
//     Route::prefix('/card_histories')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//     });
//     Route::prefix("/domain")->group(function () {
//         Route::get("/", [HomeController::class, "domain"]);
//     });
// });
// Route::middleware(['jwt'])->group(function () {

//     Route::get('/refreshToken', [AuthController::class, 'refreshToken']);

//     Route::get('/me', [AuthController::class, 'me']);
//     Route::get('/logout', [AuthController::class, 'logout']);
//     Route::prefix('/reviews')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix("/discount_codes")->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix('/card_histories')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix('/bank_histories')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     // Categories
//     Route::prefix('/categories')->group(function () {
//         Route::get("/", [CategoryController::class, 'index']);
//         Route::get("/{id}", [CategoryController::class, 'show']);
//         Route::post("/", [CategoryController::class, 'store']);
//         Route::put("/{id}", [CategoryController::class, 'update']);
//         Route::patch("/{id}", [CategoryController::class, 'updatePatch']);
//         Route::delete("/{id}", [CategoryController::class, 'destroy']);
//     });
//     Route::prefix('/news')->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix('/products')->group(function () {
//         // Route::get('/', [ProductController::class, 'index']);
//         Route::get('/', [ProductController::class, 'publicList']); // Công khai
//         Route::get('/list/partner', [ProductController::class, 'partnerList']);
//         Route::get('/list/reseller', [ProductController::class, 'resellerList']);
//         Route::get('/list/admin', [ProductController::class, 'adminList']);
//         Route::get('/{id}', [ProductController::class, 'show']);
//         Route::post('/', [ProductController::class, 'store']);
//         Route::put('/{id}', [ProductController::class, 'update']);
//         Route::post('/{id}/destroy', [ProductController::class, 'destroy']);
//         Route::post('/{id}/cancel', [ProductController::class, 'cancel']);
//         Route::post('/{id}/approve', [ProductController::class, 'approve']);
//         Route::post('/{id}/reject', [ProductController::class, 'reject']);
//     });
//     Route::prefix("/webs")->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });

//     Route::prefix("/accounts")->group(function () {

//         Route::get("/", [UserController::class, 'index']);
//         Route::post("/", [AuthController::class, 'register']); // Tạo mới
//         Route::get("/{id}", [UserController::class, 'show']); // Chi tiết
//         Route::put("/{id}", [UserController::class, 'update']); // cập nhật toàn bộ
//         Route::patch("/{id}", [UserController::class, 'restore']); // cập nhật 1 phần
//         Route::delete("/{id}", [UserController::class, 'destroy']); // xóa mềm

//     });
//     Route::prefix("/cart")->group(function () {
//         Route::get("/", [CartController::class, 'index']);
//         Route::post("/", [CartController::class, 'store']);
//         Route::delete("/{id}", [CartController::class, 'destroy']);
//     });
//     Route::prefix("/order")->group(function () {
//         Route::get("/", [OrderController::class, "index"]);
//         Route::get("/{id}", [OrderController::class, "OrderDetail"]);
//         Route::post("/", [OrderController::class, "Order"]);
//     });

//     Route::prefix("/notifications")->group(function () {

//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix("/chats")->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });
//     Route::prefix("/tickets")->group(function () {
//         Route::get("/");
//         Route::get("/{id}");
//         Route::post("/");
//         Route::put("/{id}");
//         Route::patch("/{id}");
//         Route::delete("/{id}");
//     });




//     Route::prefix("/discount_codes")->group(function () {
//         Route::get("/", [DiscountCodeController::class, 'index']);
//         Route::get("/{id}", [DiscountCodeController::class, 'show']);
//         Route::post("/", [DiscountCodeController::class, 'store']);
//         Route::put("/{id}", [DiscountCodeController::class, 'update']);
//         Route::patch("/{id}", [DiscountCodeController::class, 'partialUpdate']);
//         Route::delete("/{id}", [DiscountCodeController::class, 'destroy']);

//         Route::prefix("/donate_promotions")->group(function () {
//             Route::get("/", [DonatePromotionController::class, 'index']);
//             Route::get("/{id}", [DonatePromotionController::class, 'show']);
//             Route::post("/", [DonatePromotionController::class, 'store']);
//             Route::put("/{id}", [DonatePromotionController::class, 'update']);
//             Route::patch("/{id}", [DonatePromotionController::class, 'undo']);
//             Route::delete("/{id}", [DonatePromotionController::class, 'destroy']);
//         });
//     });
// });
