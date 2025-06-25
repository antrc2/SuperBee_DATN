<?php

namespace App\Listeners;

use App\Events\SystemNotification;
use Illuminate\Support\Facades\Redis;
// use Illuminate\Contracts\Queue\ShouldQueue; // Bỏ comment nếu muốn dùng queue

class PublishNotificationToRedis // implements ShouldQueue
{
    // use InteractsWithQueue; // Bỏ comment nếu muốn dùng queue

    /**
     * Xử lý Event.
     *
     * @param  \App\Events\SystemNotification  $event
     * @return void
     */
    public function handle(SystemNotification $event)
    {
        $payload = [
            'type' => $event->type,
            'data' => $event->data,
        ];

        // Chuyển đổi mảng thành chuỗi JSON
        $jsonPayload = json_encode($payload);

        // Publish lên một channel chung mà Node.js sẽ subscribe
        Redis::publish('global_notifications_channel', $jsonPayload);

        // \Log::info('Published notification to Redis:', $payload);
    }
}