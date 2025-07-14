<?php

use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminCategoryPostController;
use App\Http\Controllers\Admin\AdminDonatePromotionController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Partner\PartnerProductController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\User\UserCategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminDiscountCodeController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPostController;
use App\Http\Controllers\AWSController;
use App\Http\Controllers\Callback\BankController;
use App\Http\Controllers\Callback\CallbackPartnerController;
use App\Http\Controllers\Callback\CardController;
use App\Http\Controllers\Partner\PartnerOrderController;
use App\Http\Controllers\User\DiscountCodeController;
use App\Http\Controllers\User\UserCartController;
use App\Http\Controllers\User\UserProductController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\UserOrderController;
use App\Http\Controllers\User\UserBannerController;
use App\Http\Controllers\User\UserProfileController;
use Illuminate\Support\Facades\Route;




// Xác thực trang web
Route::post("/domain/active", [AuthController::class, "active"]);

// Route::post('/upload', [AWSController::class, 'upload']);

Route::prefix("/callback")->group(function () {
    Route::post("/card", [CardController::class, 'callback']);
    // Route::post("/bank2", [BankController::class,'callback2']);
    Route::post("/bank/donate", [BankController::class, 'donate']);
    Route::post("/bank/withdraw", [BankController::class, "withdraw"]);
    Route::post("/partner/money", [CallbackPartnerController::class, 'recieve_money']);
});

Route::get("/partner/money/queue", [PartnerOrderController::class, 'queue_money']);

// Những router client chưa và đã đăng nhập
Route::middleware('auth')->group(function () {
    // cấp lại token
    Route::post('/refreshToken', [AuthController::class, "refreshToken"]);
    // xác minh tài khoản
    Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
    // quên mật khẩu
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    // cài lại mật khẩu
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    // gửi lại email kích hoạt tài khoản
    Route::post('/sendActiveAccount', [AuthController::class, 'sendVerifyEmail']);
    // chưa đăng nhập
    Route::prefix('/home')->group(function () {
        Route::get("/", [HomeController::class, 'index']);
        Route::get('/products', [HomeController::class, 'products']);
    });
    Route::prefix("/categories")->group(function () {
        Route::get("/", [UserCategoryController::class, 'index']);
        Route::get("/{id}", [UserCategoryController::class, 'show']);
    });
    Route::prefix('/products')->group(function () {
        Route::get( "/search", [UserProductController::class, 'search']);
        Route::get("/{slug}", [UserProductController::class, 'index']);
        Route::get("/acc/{id}", [UserProductController::class, 'show']);
    });
    Route::prefix('/banners')->group(function () {
        Route::get("/", [UserBannerController::class, 'index']);
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
    Route::get('/notifications', [AdminNotificationController::class, 'getNotificationsForUser']);
    //   đã đăng nhập 
    Route::middleware(['jwt'])->group(function () {
        // đăng xuất
        Route::post("/logout", [AuthController::class, 'logout']);
        // info
        Route::prefix('/user')->group(function () {
            Route::get('/profile', [UserProfileController::class, 'show']);
            Route::get('/money', [UserProfileController::class, 'money']);
            Route::get('/history-trans', [UserProfileController::class, 'history']);
            Route::get('/order', [UserProfileController::class, 'order']);
            Route::post('/profile-update', [UserProfileController::class, 'update']);
            Route::post('/change-password', [UserProfileController::class, 'changePassword']);
        });
        Route::prefix('/discountcode')->group(function () {
            Route::get('/', [DiscountCodeController::class, 'index']);
            Route::get('/{id}', [DiscountCodeController::class, 'show']); // Sửa thành {id}
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
        Route::prefix("/carts")->group(function () {
            Route::get("/", [UserCartController::class, 'index']);
            Route::post("/", [UserCartController::class, 'store']);
            Route::post("/save", [UserCartController::class, 'save']);
            Route::delete("/{id}", [UserCartController::class, 'destroy']);
        });
        Route::prefix('/orders')->group(function () {
            Route::get('/', [UserOrderController::class, 'index']);
            Route::get("/checkout", [UserOrderController::class, 'checkout']);
            Route::get("/{id}", [UserOrderController::class, 'show']);

            // promotion_code
            Route::post("/check", [UserOrderController::class, 'check_promotion']);

            // promotion_code
            Route::post("/purchase", [UserOrderController::class, 'purchase']);



            // Route::post("/checkout",[UserOrderController::class,'checkout']);
            // Dữ liệu gửi lên: product_id: [] - Mảng các id sản phẩm ở trong cart
            // promotion_code: mã giảm giá, có thể null, hoặc không gửi lên cũng đc
            // Route::post("/purchase",[UserOrderController::class,'purchase']);
            // Route::post("/", [UserOrderController::class,'store']);


        });
        Route::prefix("/notifications")->group(function () {
            Route::put('/personal/{id}', [AdminNotificationController::class, 'updatePersonalNotification']);
            Route::post('/global/{globalNotificationId}/read', [AdminNotificationController::class, 'markGlobalNotificationAsRead']);
        });
        Route::get('messages',[HomeController::class,'messages']);
    });
});



// admin
Route::middleware(['jwt'])->group(function () {
    Route::middleware(['role:admin'])->prefix('/admin')->group(function () {
        Route::prefix('/discountcode')->group(function () {
            Route::get('/', [AdminDiscountCodeController::class, 'index']);
            Route::get('/{id}', [AdminDiscountCodeController::class, 'show']); // Sửa thành {id}
            Route::post('/', [AdminDiscountCodeController::class, 'store']);
            Route::put('/{id}', [AdminDiscountCodeController::class, 'update']); // Sửa thành {id}
            Route::patch('/{id}', [AdminDiscountCodeController::class, 'patch']); // Sửa thành {id}
            Route::delete('/{id}', [AdminDiscountCodeController::class, 'destroy']); // Sửa thành {id}
        });
        // Route::prefix('/discountcode')->group(function () {
        //     Route::get('/', [AdminDiscountCodeController::class, 'index']);
        //     Route::get('/{id}', [AdminDiscountCodeController::class, 'show']); // Sửa thành {id}
        //     Route::post('/', [AdminDiscountCodeController::class, 'store']);
        //     Route::put('/{id}', [AdminDiscountCodeController::class, 'update']); // Sửa thành {id}
        //     Route::patch('/{id}', [AdminDiscountCodeController::class, 'patch']); // Sửa thành {id}
        //     Route::delete('/{id}', [AdminDiscountCodeController::class, 'destroy']); // Sửa thành {id}
        // });
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index']);
            Route::post('/', [CategoryController::class, 'store']);
            Route::put('/{id}', [CategoryController::class, 'update']);
            Route::delete('/{id}', [CategoryController::class, 'destroy']);
            Route::get('/{id}', [CategoryController::class, 'show']);
        });
        Route::prefix('/accounts')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::delete('/{id}', [UserController::class, 'destroy']); // Sửa thành {id} và kiểm tra method cho delete
            Route::patch('/key/{id}', [UserController::class, 'key']); // Sửa thành {id}
            Route::patch('/{id}', [UserController::class, 'restore']); // Sửa thành {id}
            Route::put('/{id}/role', [UserController::class, 'updateRoles']); // Cập nhật roles cho user
        });


        Route::prefix("/products")->group(function () {
            Route::get("/", [AdminProductController::class, 'index']);
            Route::get("/browse", [AdminProductController::class, 'getProductsBrowse']);
            Route::get("/{id}", [AdminProductController::class, 'show']);
            Route::post('/', [AdminProductController::class, 'store']); // Thêm sản phẩm mới, chỉ cho partner
            Route::post("/{id}/deny", [AdminProductController::class, 'deny']); // Từ chối sản phẩm
            Route::post("/{id}/accept", [AdminProductController::class, 'accept']); // Chấp nhận sản phẩm 
            Route::post("/{id}/restore", [AdminProductController::class, 'restore']); // Sau khi hủy bán, tôi muốn bán lại
            Route::post("/{id}/cancel", [AdminProductController::class, 'cancel']); // Người bán hủy bán
            Route::put('/{id}', [AdminProductController::class, 'update']);
        });
        Route::prefix("/orders")->group(function () {
            Route::get("/", [AdminOrderController::class, 'index']);
            Route::get("/{id}", [AdminOrderController::class, 'show']);
            // Route::get("/", [OrderController::class, 'index']);
            // Route::get("/{id}", [OrderController::class, 'show']);
        });
        Route::prefix("/notifications")->group(function () {
            // thông báo cá nhân thêm
            Route::post('/personal', [AdminNotificationController::class, 'addPersonalNotification']);
            // thông báo chung thêm
            Route::post('/global', [AdminNotificationController::class, 'addGlobalNotification']);
            // sửa thông báo chung 
            Route::put('/global/{id}', [AdminNotificationController::class, 'updateGlobalNotification']);
        });
        Route::prefix('/banners')->group(function () {
            Route::get('/', [AdminBannerController::class, 'index']);
            Route::get('/{slug}', [AdminBannerController::class, 'show']);
            Route::post('/', [AdminBannerController::class, 'store']);
            Route::put('/{id}', [AdminBannerController::class, 'update']);
            Route::delete('/{id}', [AdminBannerController::class, 'destroy']);
        });
        Route::prefix('/post')->group(function () {
            Route::get('/', [AdminPostController::class, 'index']);
            Route::post('/upload', [AdminPostController::class, 'upload']);
            Route::get('/load-images', [AdminPostController::class, 'loadImages']);
            Route::post('/delete-image', [AdminPostController::class, 'deleteImage']);
            Route::get('/{id}', [AdminPostController::class, 'show']);
            Route::post('/', [AdminPostController::class, 'store']);
            Route::post('/{id}', [AdminPostController::class, 'update']);
            Route::delete('/{id}', [AdminPostController::class, 'destroy']);
            Route::patch('/{id}/publish', [AdminPostController::class, 'publish']);
            Route::patch('/{id}/unpublish', [AdminPostController::class, 'unpublish']);

            // ---- THÊM CÁC ROUTE UPLOAD ẢNH CHO FROALA EDITOR VÀO ĐÂY ----
            // Tùy chọn: Route để tải danh sách ảnh đã upload (cho Image Manager của Froala)
            // Tùy chọn: Route để xóa ảnh từ Image Manager
        });
        Route::prefix('/categoryPost')->group(function () {
            Route::get('/', [AdminCategoryPostController::class, 'getCategoryPost']);
            Route::post('/', [AdminCategoryPostController::class, 'createCategoryPost']);
            Route::get('/{id}', [AdminCategoryPostController::class, 'getCategoryPostBySlug']);
            Route::Post('/{id}', [AdminCategoryPostController::class, 'updateCategoryPost']);
            Route::delete('/{id}', [AdminCategoryPostController::class, 'deleteCategoryPost']);
        });
    });
});

Route::middleware(['jwt'])->group(function () {
    Route::middleware(['role:partner'])->prefix('/partner')->group(function () {
        Route::prefix("/orders")->group(function () {

            Route::post("/purchase", [UserOrderController::class, 'purchase']);
        });
        Route::prefix('/products')->group(function () {
            Route::get('/', [PartnerProductController::class, 'index']);
            Route::get('/{id}', [PartnerProductController::class, 'show']);
            Route::post('/', [PartnerProductController::class, 'store']);
            Route::put('/{id}', [PartnerProductController::class, 'update']);
            Route::post('/{id}/cancel', [PartnerProductController::class, 'cancel']);
            Route::post('/{id}/restore', [PartnerProductController::class, 'restore']);
        });
    });
});
