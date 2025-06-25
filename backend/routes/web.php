<?php



use App\Events\EmailNotificationRequested;
use App\Events\SystemNotification;
use Illuminate\Support\Facades\Route;
use Predis\Client;
Route::get('/', function () {    
    event(new SystemNotification(
        'email_welcom', // Loại thông báo
        [
            'order_id' => 3,
            'status' => false,
            'message' => 'Đơn hàng #' . 33 . ' của bạn đã được cập nhật thành ' . "" . '.',
        ],
        
    ));
    
});
