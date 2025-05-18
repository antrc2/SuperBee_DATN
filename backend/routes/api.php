<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware(['authenticate', 'api'])->group(function () {

    Route::prefix("/accounts")->group(function () {
        Route::post("/login", [AuthController::class, 'login']);
        Route::post("/register");
    });

    Route::prefix('/categories')->group(function () {
        Route::get("/");
        Route::get("/{id}");
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
});

Route::middleware(['jwt'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::prefix('/reviews')->group(function () {
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
    Route::prefix('/categories')->group(function () {
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
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
        Route::get("/");
        Route::get("/{id}");
        Route::post("/");
        Route::put("/{id}");
        Route::patch("/{id}");
        Route::delete("/{id}");
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

Route::prefix("/domain")->group(function () {
    Route::get("/", function () {
        return response()->json(['message' => "lay thanh cong", 'status' => true, 'data' => []]);
    });
});
