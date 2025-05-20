<?php





use App\Http\Controllers\DiscountCodeController;


use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::middleware(['authenticate'])->group(function () {


    Route::prefix("/accounts")->group(function () {
        Route::post("/login", [AuthController::class, 'login']);
        Route::post("/register", [AuthController::class, 'register']);

    });
    // Categories
    Route::prefix('/categories')->group(function () {
        Route::get("/", [CategoryController::class, 'index']);
        Route::get("/{id}", [CategoryController::class, 'show']);
    });

    Route::prefix('/products')->group(function () {
        Route::get("/");
        Route::get("/{id}");
    });
    Route::prefix('/news')->group(function () {
        Route::get("/");
        Route::get("/{id}");
    });
    Route::prefix('/reviews')->group(function () {
        Route::get("/");
        Route::get("/{id}");
    });
    Route::prefix('/bank_histories')->group(function () {
        Route::get("/");
        Route::get("/{id}");
    });
    Route::prefix('/card_histories')->group(function () {
        Route::get("/");
        Route::get("/{id}");
    });
    Route::prefix("/domain")->group(function () {
        Route::get("/", [HomeController::class, "domain"]);
    });
});
Route::middleware(['jwt'])->group(function () {


    
    Route::prefix('/reviews')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix("/discount_codes")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix('/card_histories')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix('/bank_histories')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    // Categories
    Route::prefix('/categories')->group(function () {
        Route::post("/", [CategoryController::class, 'store']);
        Route::put("/{id}", [CategoryController::class, 'update']);
        // Route::patch("/{id}", [CategoryController::class, 'partialUpdate']);
        Route::delete("/{id}", [CategoryController::class, 'destroy']);
    });
    Route::prefix('/news')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix('/products')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix("/webs")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });

    Route::prefix("/accounts")->group(function () {
        Route::get("/", [UserController::class, 'index']);
        Route::post("/", [UserController::class, 'store']); // Tạo mới
        Route::get("/{id}", [UserController::class, 'show']); // Chi tiết   
        Route::put("/{id}", [UserController::class, 'update']); // cập nhật toàn bộ
        Route::patch("/{id}", [UserController::class, 'restore']); // cập nhật 1 phần 
        Route::delete("/{id}", [UserController::class, 'destroy']); // xóa mềm 
    });
    Route::prefix("/cart")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix("/order")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });

    Route::prefix("/notifications")->group(function () {

        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix("/chats")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });
    Route::prefix("/tickets")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });

    Route::prefix("/discount_codes")->group(function () {
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
    });

    
});
