<?php

use App\Http\Controllers\Admin\AdminBannerController;
use App\Http\Controllers\Admin\AdminCategoryPostController;
use App\Http\Controllers\Admin\AdminCommentPostController;
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
use App\Http\Controllers\Admin\AuthorizationDashboardController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserPermissionController;
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
use App\Http\Controllers\User\UserCategoryPostController;
use App\Http\Controllers\User\UserCommentPostController;
use App\Http\Controllers\User\UserCommentPostControllerCommentPostController;
use App\Http\Controllers\User\UserPostController;
use App\Http\Controllers\User\UserProfileController;
use App\Http\Controllers\User\UserWithdrawController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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
    Route::prefix('comment')->group(function () {
        Route::post('/', [UserCommentPostController::class, "create"]);
        Route::get('/post/{id}', [UserCommentPostController::class, "getCommentByPost"]);
    });

    Route::prefix('/post')->group(function () {
        Route::get('/', [UserPostController::class, 'index']);
        Route::get('/{id}', [UserPostController::class, 'show']);
        Route::get('/category/{id}', [UserPostController::class, 'getCategoryById']);
        Route::get('/bycategory/{id}', [UserPostController::class, 'getPostByCategory']);
    });
    Route::prefix('/categoryPost')->group(function () {
        Route::get('/', [UserCategoryPostController::class, 'getCategoryPost']);
    });

    Route::prefix("/categories")->group(function () {
        Route::get("/", [UserCategoryController::class, 'index']);
        Route::get("/{id}", [UserCategoryController::class, 'show']);
    });
    Route::prefix('/products')->group(function () {
        Route::get("/search", [UserProductController::class, 'search']);
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
    // Người dùng xem danh sách khuyến mãi nạp thẻ
    Route::prefix("/donate_promotions")->group(function () {
        Route::get("/", [AdminDonatePromotionController::class, 'index'])->middleware('permission:donate_promotions.view');
        Route::get("/{id}", [AdminDonatePromotionController::class, 'show'])->middleware('permission:donate_promotions.view');
    });
    Route::get('/notifications', [AdminNotificationController::class, 'getNotificationsForUser']);
    //   đã đăng nhập
    Route::middleware(['jwt'])->group(function () {
        // đăng xuất
        Route::post("/logout", [AuthController::class, 'logout']);
        Route::post('/notifications/personal/{id}/read', [AdminNotificationController::class, 'markPersonalAsRead']);
        // Đánh dấu thông báo chung
        Route::post('/notifications/global/{id}/read', [AdminNotificationController::class, 'markGlobalAsRead']);
        // info
        Route::prefix('/user')->group(function () {
            Route::get('/profile', [UserProfileController::class, 'show'])->middleware('permission:profile.view_own');
            Route::get('/money', [UserProfileController::class, 'money'])->middleware('permission:wallet.view');
            Route::get('/history-trans', [UserProfileController::class, 'history'])->middleware('permission:transactions.view');
            Route::get('/order', [UserProfileController::class, 'order'])->middleware('permission:orders.view');
            Route::post('/profile-update', [UserProfileController::class, 'update'])->middleware('permission:profile.edit_own');
            Route::post('/change-password', [UserProfileController::class, 'changePassword'])->middleware('permission:profile.edit_own');
            Route::get('/getHistoryAff', [UserProfileController::class, 'getAllAffHistory']);
        });
        // User xem danh sách mã giảm giá (khuyến mãi sản phẩm)
        Route::prefix('/discountcode')->group(function () {
            Route::get('/', [DiscountCodeController::class, 'index'])->middleware('permission:promotions.view');
            Route::get('/{id}', [DiscountCodeController::class, 'show'])->middleware('permission:promotions.view');
        });

        Route::prefix("/donate")->group(function () {
            Route::prefix("/card")->group(function () {
                Route::post("/", [CardController::class, 'store'])->middleware('permission:recharges.create');
            });
        });

        Route::prefix("/carts")->group(function () {
            Route::get("/", [UserCartController::class, 'index']);
            Route::post("/", [UserCartController::class, 'store']);
            Route::post("/save", [UserCartController::class, 'save']);
            Route::delete("/{id}", [UserCartController::class, 'destroy']);
        });
        Route::prefix('/orders')->group(function () {
            Route::get('/', [UserOrderController::class, 'index'])->middleware('permission:orders.view');
            Route::get("/checkout", [UserOrderController::class, 'checkout'])->middleware('permission:orders.create');
            Route::get("/{id}", [UserOrderController::class, 'show'])->middleware('permission:orders.view');
            Route::post("/check", [UserOrderController::class, 'check_promotion'])->middleware('permission:orders.create');
            Route::post("/purchase", [UserOrderController::class, 'purchase'])->middleware('permission:orders.create');
        });
        Route::prefix("/notifications")->group(function () {
            Route::put('/personal/{id}', [AdminNotificationController::class, 'updatePersonalNotification']);
            Route::post('/global/{globalNotificationId}/read', [AdminNotificationController::class, 'markGlobalNotificationAsRead']);
        });
        Route::prefix('user/withdraws')->group(function () {
            Route::get('/balance', [UserWithdrawController::class, 'showBalance'])->name('user.withdraws.balance')->middleware('permission:wallet.view');
            Route::post('/', [UserWithdrawController::class, 'requestWithdraw'])->name('user.withdraws.request')->middleware('permission:withdrawals.create');
            Route::get('/history', [UserWithdrawController::class, 'listWithdraws'])->name('user.withdraws.history')->middleware('permission:withdrawals.view');
            Route::post('/cancel', [UserWithdrawController::class, 'cancelWithdraw'])->name('user.withdraws.cancel')->middleware('permission:withdrawals.edit'); // Hoặc quyền riêng nếu cần
        });

        Route::get('messages', [HomeController::class, 'messages'])->middleware('permission:chat.view|chat.create');
    });
});



// =================== ADMIN ROUTES ===================
Route::middleware(['jwt'])->prefix('/admin')->group(function () {

    /**
     * Quản lý Mã giảm giá (Khuyến mãi sản phẩm)
     * Router name: discountcode, Permission: promotions.*
     */
    Route::prefix('/discountcode')->group(function () {
        Route::get('/', [AdminDiscountCodeController::class, 'index'])->middleware('permission:promotions.view');
        Route::get('/user', [AdminDiscountCodeController::class, 'getUserByWebId'])->middleware('permission:promotions.view');
        Route::get('/{id}', [AdminDiscountCodeController::class, 'show'])->middleware('permission:promotions.view');
        Route::post('/', [AdminDiscountCodeController::class, 'store'])->middleware('permission:promotions.create');
        Route::put('/{id}', [AdminDiscountCodeController::class, 'update'])->middleware('permission:promotions.edit');
        Route::patch('/{id}', [AdminDiscountCodeController::class, 'patch'])->middleware('permission:promotions.edit');
        Route::delete('/{id}', [AdminDiscountCodeController::class, 'destroy'])->middleware('permission:promotions.delete');
        Route::get('/user/{id}', [AdminDiscountCodeController::class, 'getUserByWebId'])->middleware('permission:promotions.view');
        Route::get('/web/{id}', [AdminDiscountCodeController::class, 'getWebId'])->middleware('permission:promotions.view');
    });

    /**
     * Quản lý Danh mục sản phẩm - === BỔ SUNG: SỬ DỤNG QUYỀN categories.* ===
     */
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->middleware('permission:categories.view');
        Route::post('/', [CategoryController::class, 'store'])->middleware('permission:categories.create');
        Route::put('/{id}', [CategoryController::class, 'update'])->middleware('permission:categories.edit');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete');
        Route::get('/{id}', [CategoryController::class, 'show'])->middleware('permission:categories.view');
    });

    /**
     * Quản lý Người dùng
     */
    Route::prefix('/accounts')->group(function () {
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.delete');
        // key và restore là hành động chỉnh sửa user
        Route::patch('/key/{id}', [UserController::class, 'key'])->middleware('permission:users.edit');
        Route::patch('/{id}', [UserController::class, 'restore'])->middleware('permission:users.edit');
        // Gán vai trò cho user là quyền sửa vai trò
        Route::put('/{id}/role', [UserController::class, 'updateRoles'])->middleware('permission:roles.edit');
    });

    /**
     * Quản lý Sản phẩm
     */
    Route::prefix("/products")->group(function () {
        Route::get("/", [AdminProductController::class, 'index'])->middleware('permission:products.view');
        Route::get("/browse", [AdminProductController::class, 'getProductsBrowse'])->middleware('permission:products.view');
        Route::get("/{id}", [AdminProductController::class, 'show'])->middleware('permission:products.view');
        Route::post('/', [AdminProductController::class, 'store'])->middleware('permission:products.create');
        // deny, accept, restore, cancel là các hành động sửa sản phẩm
        Route::post("/{id}/deny", [AdminProductController::class, 'deny'])->middleware('permission:products.edit');
        Route::post("/{id}/accept", [AdminProductController::class, 'accept'])->middleware('permission:products.edit');
        Route::post("/{id}/restore", [AdminProductController::class, 'restore'])->middleware('permission:products.edit');
        Route::post("/{id}/cancel", [AdminProductController::class, 'cancel'])->middleware('permission:products.edit');
        Route::put('/{id}', [AdminProductController::class, 'update'])->middleware('permission:products.edit');
    });

    /**
     * Quản lý Đơn hàng
     */
    Route::prefix("/orders")->group(function () {
        Route::get("/", [AdminOrderController::class, 'index'])->middleware('permission:orders.view');
        Route::get("/{id}", [AdminOrderController::class, 'show'])->middleware('permission:orders.view');
    });

    /**
     * Quản lý Thông báo
     */
    Route::prefix("/notifications")->group(function () {
        Route::post('/personal', [AdminNotificationController::class, 'addPersonalNotification'])->middleware('permission:notifications.create');
        Route::post('/global', [AdminNotificationController::class, 'addGlobalNotification'])->middleware('permission:notifications.create');
        Route::put('/global/{id}', [AdminNotificationController::class, 'updateGlobalNotification'])->middleware('permission:notifications.edit');
    });

    /**
     * Quản lý Banner
     */
    Route::prefix('/banners')->group(function () {
        Route::get('/', [AdminBannerController::class, 'index'])->middleware('permission:banners.view');
        Route::get('/{slug}', [AdminBannerController::class, 'show'])->middleware('permission:banners.view');
        Route::post('/', [AdminBannerController::class, 'store'])->middleware('permission:banners.create');
        Route::put('/{id}', [AdminBannerController::class, 'update'])->middleware('permission:banners.edit');
        Route::delete('/{id}', [AdminBannerController::class, 'destroy'])->middleware('permission:banners.delete');
    });

    /**
     * Quản lý Bài viết
     */
    Route::prefix('/post')->group(function () {
        Route::get('/', [AdminPostController::class, 'index'])->middleware('permission:posts.view');
        Route::get('/{id}', [AdminPostController::class, 'show'])->middleware('permission:posts.view');
        Route::post('/', [AdminPostController::class, 'store'])->middleware('permission:posts.create');
        Route::post('/{id}', [AdminPostController::class, 'update'])->middleware('permission:posts.edit');
        Route::delete('/{id}', [AdminPostController::class, 'destroy'])->middleware('permission:posts.delete');
        // publish/unpublish là hành động sửa bài viết
        Route::patch('/{id}/publish', [AdminPostController::class, 'publish'])->middleware('permission:posts.edit');
        Route::patch('/{id}/unpublish', [AdminPostController::class, 'unpublish'])->middleware('permission:posts.edit');

        // Các route tiện ích yêu cầu quyền tạo hoặc sửa
        Route::post('/upload', [AdminPostController::class, 'upload'])->middleware('permission:posts.create|posts.edit');
        Route::get('/load-images', [AdminPostController::class, 'loadImages'])->middleware('permission:posts.create|posts.edit');
        Route::post('/delete-image', [AdminPostController::class, 'deleteImage'])->middleware('permission:posts.create|posts.edit');
    });

    /**
     * Quản lý Danh mục Bài viết - === BỔ SUNG: SỬ DỤNG QUYỀN post_categories.* ===
     */
    Route::prefix('/categoryPost')->group(function () {
        Route::get('/', [AdminCategoryPostController::class, 'getCategoryPost'])->middleware('permission:post_categories.view');
        Route::post('/', [AdminCategoryPostController::class, 'createCategoryPost'])->middleware('permission:post_categories.create');
        Route::get('/{id}', [AdminCategoryPostController::class, 'getCategoryPostBySlug'])->middleware('permission:post_categories.view');
        Route::post('/{id}', [AdminCategoryPostController::class, 'updateCategoryPost'])->middleware('permission:post_categories.edit');
        Route::delete('/{id}', [AdminCategoryPostController::class, 'deleteCategoryPost'])->middleware('permission:post_categories.delete');
    });

    /**
     * Quản lý Khuyến mãi Nạp thẻ (Donate Promotions)
     */
    Route::prefix("/donate_promotions")->group(function () {
        Route::get("/", [AdminDonatePromotionController::class, 'index'])->middleware('permission:donate_promotions.view');
        Route::get("/{id}", [AdminDonatePromotionController::class, 'show'])->middleware('permission:donate_promotions.view');
        Route::post("/", [AdminDonatePromotionController::class, 'store'])->middleware('permission:donate_promotions.create');
        Route::delete("/{id}", [AdminDonatePromotionController::class, 'destroy'])->middleware('permission:donate_promotions.delete');
        // undo là hành động sửa
        Route::post("/{id}/undo", [AdminDonatePromotionController::class, 'undo'])->middleware('permission:donate_promotions.edit');
    });

    /**
     * Quản lý Phân quyền (Authorization)
     */
    Route::prefix('/authorization')->group(function () {
        Route::get('dashboard', [AuthorizationDashboardController::class, 'index'])->middleware('permission:roles.view|permissions.view');

        // Quản lý chi tiết vai trò & quyền cho 1 user -> yêu cầu quyền sửa vai trò
        Route::get('users/{id}/manage', [AuthorizationDashboardController::class, 'getUserDetails'])->middleware('permission:roles.edit');
        Route::post('users/{id}/manage/roles', [AuthorizationDashboardController::class, 'syncRoles'])->middleware('permission:roles.edit');
        Route::post('users/{id}/manage/permissions', [AuthorizationDashboardController::class, 'syncDirectPermissions'])->middleware('permission:roles.edit');

        // Quản lý định nghĩa Permissions (chỉ xem)
        Route::get('permissions', [PermissionController::class, 'index'])->middleware('permission:permissions.view');

        // Quản lý định nghĩa Roles
        Route::get('roles', [RoleController::class, 'index'])->middleware('permission:roles.view');
        Route::post('roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
        Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
        Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermissions'])->middleware('permission:roles.edit');
    });
});

// =================== PARTNER ROUTES ===================
// === BỔ SUNG: THÊM MIDDLEWARE PERMISSION CHI TIẾT ===
Route::middleware(['jwt', 'role:partner'])->prefix('/partner')->group(function () {
    // Các quyền của partner được định nghĩa sẵn trong vai trò, nhưng kiểm tra chi tiết sẽ chặt chẽ hơn
    Route::prefix("/orders")->group(function () {
        // Partner có thể không tự mua hàng, nhưng nếu có thì cần quyền orders.create
        Route::post("/purchase", [UserOrderController::class, 'purchase'])->middleware('permission:orders.create');
    });
    Route::prefix('/products')->group(function () {
        Route::get('/', [PartnerProductController::class, 'index'])->middleware('permission:products.view');
        Route::get('/{id}', [PartnerProductController::class, 'show'])->middleware('permission:products.view');
        Route::post('/', [PartnerProductController::class, 'store'])->middleware('permission:products.create');
        Route::put('/{id}', [PartnerProductController::class, 'update'])->middleware('permission:products.edit');
        Route::post('/{id}/cancel', [PartnerProductController::class, 'cancel'])->middleware('permission:products.edit');
        Route::post('/{id}/restore', [PartnerProductController::class, 'restore'])->middleware('permission:products.edit');
    });
});