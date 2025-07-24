<?php



use App\Events\EmailNotificationRequested;
use App\Events\SystemNotification;
use Illuminate\Support\Facades\Route;
use Predis\Client;

Route::get('/', function () {
//     $domain = "http:lllll";
//     $linkToKeyDetail = env("FRONTEND_URL");
//     $messageContent = "Chúng tôi nhận thấy rằng API key của website {$domain} của bạn đang được sử dụng, nhưng trạng thái của website hiện không hoạt động. Vui lòng kiểm tra lại để đảm bảo website của bạn hoạt động bình thường. Click vào link này để kích hoạt: <a href=\"{$linkToKeyDetail}\"></a>";
// $payload = [
//     'email' => "hairobet15092005@gmail.com",
//     "username" => "Trần Văn Long",
//     "domainName" => $domain,
//     "message" => $messageContent
// ];
//     event(new SystemNotification(
//         'EMAIL_DOMAIN', // Loại thông báo
//         $payload
//     ));
//     event(new SystemNotification(
//         'EMAIL_ACTIVE_USER', // Loại thông báo
//         [
//             'email' => "hairobet15092005@gmail.com",
//             "username" => "Trần Văn Long",
//             "verificationToken" => "sfdgsgsfgsfgsgr43562"
//         ],
//     ));
event(new SystemNotification(
    "EMAIL_DONATE",
    [
        "email"=>'antrc2gamer@gmail.com',
        "username"=>"Nguyen Ngoc An",
        "amount"=>9000
    ]
    ));
    // event(new SystemNotification(
    //     'EMAIL_WELCOME', // Loại thông báo
    //     [
    //         'email' => "hairobet15092005@gmail.com",
    //         "username" => "Trần Văn Long",
    //         "loginUrl" => "http://localhost:5173/auth/login"
    //     ],
    // ));
    // event(new SystemNotification(
    //     'NOTIFICATION_PUBLIC', // Loại thông báo
    //     [
    //         "id"=> 3,
    //         "type"=> 1,
    //         "content"=> "Thông báo chung loại 1 khác. Đừng bỏ lỡ ưu đãi này!",
    //         "published_at"=> "2025-06-25T15:53:26.000000Z",
    //         "link"=> null,
    //         "is_read"=> false,
        
    //     ]
    // ));
    // event(new SystemNotification(
    //     'NOTIFICATION_PRIVATE', // Loại thông báo
    //     [
    //         "id"=> 3,
    //         "type"=> 1,
    //         "content"=> "Thông báo chung loại 1 khác. Đừng bỏ lỡ ưu đãi này!",
    //         "published_at"=> "2025-06-25T15:53:26.000000Z",
    //         "link"=> null,
    //         "is_read"=> false,
    //         'user_id'=>1
    //     ]
    // ));
});
