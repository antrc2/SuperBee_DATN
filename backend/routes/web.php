<?php

use App\Events\NewMessage;
use App\Events\SystemNotification;
use Illuminate\Support\Facades\Route;
use Predis\Client;
Route::get('/', function () {
    $userId = "admin";
    $user = [
        "id"=>1,
        "name"=>"admin"
    ];
    
    event(new SystemNotification(
        'order_status_updated', // Loại thông báo
        [
            'order_id' => 3,
            'status' => false,
            'message' => 'Đơn hàng #' . 33 . ' của bạn đã được cập nhật thành ' . "" . '.',
        ],
        $userId // Gửi userId để Node.js biết gửi cho ai
    ));
    
});
Route::get('/test', function () {
    $message ="hello";
    $user = [
        "id"=>1,
        "name"=>"HaiTran"
    ];
   $a = event(new NewMessage($message, $user));
   var_dump($a);

});
