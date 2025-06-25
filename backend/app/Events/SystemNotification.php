<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SystemNotification
{
    use Dispatchable, SerializesModels;

    public $type;       // Loại thông báo (e.g., 'new_order', 'user_registered', 'item_sold')
    public $data;       // Dữ liệu chi tiết của thông báo (mảng kết hợp)
    /**
     * Tạo một instance Event mới.
     *
     * @param string $type Loại thông báo.
     * @param array $data Dữ liệu liên quan đến thông báo.
     * @param int|null $userId ID người dùng nhận (null nếu là thông báo chung).
     * @param string|null $webId Web ID của phiên nhận (null nếu cho tất cả các phiên của user).
     * @return void
     */
    public function __construct(string $type, array $data)
    {
        $this->type = $type;
        $this->data = $data;
    }
}