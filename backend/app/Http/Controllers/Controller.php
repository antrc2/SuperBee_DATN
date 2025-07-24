<?php

namespace App\Http\Controllers;

use App\Events\SystemNotification;
use App\Models\GlobalNotification;
use App\Models\Notification;
use App\Models\RechargeBank;
use App\Models\RechargeCard;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Import facade Log

abstract class Controller
{
    public function donate_promotion($donate_promotion,$user_id)
    {
        if ($donate_promotion !== NULL) {
            if ($donate_promotion->usage_limit == -1) {

            } else {
                if ($donate_promotion->total_used >= $donate_promotion->usage_limit){
                    return ['donate_promotion_id'=>Null,"donate_promotion_amount"=>0];
                }
            }

            $card = RechargeCard::where("user_id",$user_id)->where("donate_promotion_id",$donate_promotion->id)->where('status',1)->get()->count();
            $bank = RechargeBank::where('user_id',$user_id)->where("donate_promotion_id",$donate_promotion->id)->get()->count();

            $total_used = $card + $bank;

            if ($donate_promotion->per_user_limit != -1 && $total_used >= $donate_promotion->per_user_limit) {
                return ['donate_promotion_id'=> null, 'donate_promotion_amount'=> 0];
            }
            $donate_promotion->total_used += 1;
            $donate_promotion->save();
            return ['donate_promotion_id'=>$donate_promotion->id,"donate_promotion_amount"=>$donate_promotion->amount];
            // $donate_promotion_id = $donate_promotion->id;
            // $donate_promotion_amount = $donate_promotion->amount;
        } else {
            return ['donate_promotion_id'=>Null,"donate_promotion_amount"=>0];
            // $donate_promotion_id = NULL;
            // $donate_promotion_amount = 0;
        }
    }
    
    public function generateCode(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $max)];
        }
        return $code;
    }
    /**
     * Lưu một file và trả về đường dẫn công khai.
     * Hàm sẽ tự động tạo thư mục nếu nó chưa tồn tại.
     *
     * @param UploadedFile $file Đối tượng file đã upload.
     * @param string $directory Thư mục đích trong storage/app/public (ví dụ: 'images', 'documents').
     * @return string|null Đường dẫn công khai của file đã lưu, hoặc null nếu có lỗi.
     */

    public function uploadFiles(array $files, string $directory,bool $thread = True ): array
    {
        try {
            $apiUrl = env('PYTHON_API');

            // Bắt đầu builder request
            $request = Http::withHeaders([
                'Accept' => 'application/json',
            ]);

            // Attach tất cả các file vào mảng images[]
            foreach ($files as $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile) {
                    // attach dùng để thêm dữ liệu dạng multi part vào form
                    $request = $request->attach(
                        'files',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    );
                }
            }

            // Gửi 1 lần duy nhất
            $response = $request->post("{$apiUrl}/upload_files", [
                'folder' => $directory, "thread"=>$thread
            ]);

            $response = $response->json();
            // $response = json_encode($response);

            // Giả sử API trả về key 'urls' là mảng đường dẫn
            return $response;
        } catch (\Throwable $e) {
            // \Log::error('UploadFiles error: '.$e->getMessage());
            return [];
        }
    }

    public function uploadFile(UploadedFile $file, string $directory, bool $thread = True): ?string
    {
        try {
            $api_url = env('PYTHON_API');
            $response = Http::attach(
                'file',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post("{$api_url}/upload_file", ["folder" => $directory,'thread' => $thread ? 'true' : 'false',]);
            $response = json_decode($response);
            return $response->url;
        } catch (\Throwable $th) {
            return null;
        }
        // try {
        //     // Kiểm tra và tạo thư mục nếu nó chưa tồn tại
        //     // Storage::disk('public')->path() trả về đường dẫn vật lý đến thư mục gốc của disk 'public'
        //     $fullPath = Storage::disk('public')->path($directory);
        //     if (!file_exists($fullPath)) {
        //         // Tạo thư mục đệ quy với quyền 0755
        //         mkdir($fullPath, 0755, true);
        //     }

        //     // Lấy phần mở rộng của file gốc
        //     $extension = $file->getClientOriginalExtension();

        //     // Tạo tên file duy nhất bằng UUID
        //     $filename = Str::uuid() . '.' . $extension;

        //     // Đường dẫn tương đối của file trong storage/app/public
        //     $relativePath = $directory . '/' . $filename;

        //     // Lưu file vào disk 'public'
        //     // storePubliclyAs tự động xử lý quyền truy cập công khai
        //     $file->storePubliclyAs($directory, $filename, 'public');

        //     // Trả về URL công khai của file đã lưu
        //     return Storage::url($relativePath);

        // } catch (\Exception $e) {
        //     // Ghi log lỗi để dễ dàng debug
        //     Log::error('Error uploading file: ' . $e->getMessage(), [
        //         'file_name' => $file->getClientOriginalName(),
        //         'directory' => $directory,
        //         'exception_trace' => $e->getTraceAsString() // Ghi thêm trace để debug sâu hơn
        //     ]);
        //     return null; // Trả về null nếu có lỗi
        // }
    }
    public function  deleteFiles(array $paths)
    {
        try {
            $api_url = env('PYTHON_API');
            $response = Http::post("{$api_url}/delete_files", ["paths" => $paths]);
            $response = json_decode($response);
            return $response->status;
        } catch (\Throwable $th) {
            // throw $th;
            return false;
        }
    }
    public function deleteFile(string $relativePath)
    {
        try {
            $api_url = env('PYTHON_API');
            $response = Http::post("{$api_url}/delete_file", ["path" => $relativePath]);
            $response = json_decode($response);
            return $response->status;
        } catch (\Throwable $th) {
            // throw $th;
            return false;
        }
    }
    // public function deleteFile(string $relativePath, string $disk = 'public'): bool
    // {
    //     try {
    //         // Kiểm tra file tồn tại
    //         if (!Storage::disk($disk)->exists($relativePath)) {
    //             // File không tồn tại xem như đã xóa thành công
    //             return true;
    //         }

    //         // Xóa file
    //         return Storage::disk($disk)->delete($relativePath);
    //     } catch (\Exception $e) {
    //         Log::error('Error deleting file: ' . $e->getMessage(), [
    //             'relative_path' => $relativePath,
    //             'disk' => $disk,
    //             'exception_trace' => $e->getTraceAsString()
    //         ]);
    //         return false;
    //     }
    // }
// /**

 /* Gửi thông báo (riêng cho user hoặc toàn bộ).
 *
 * @param array $data [
 *     'user_id' => int|null, // Nếu có -> gửi riêng, nếu không -> gửi toàn bộ
 *     'type' => int,          // 
 *         Với thông báo riêng (Notification):
 *             1: Hoạt động cá nhân
 *             2: Đơn hàng
 *             3: Điểm thưởng
 *             4: Cảnh báo
 *             5: Tin nhắn từ Admin
 * 
 *         Với thông báo toàn bộ (GlobalNotification):
 *             1: Khuyến mãi - Giảm giá
 *             2: Bảo trì hệ thống
 *             3: Sự kiện toàn hệ thống
 *             4: Tin tức - Cập nhật mới
 *             5: Quy định - Chính sách mới
 * 
 *     'content' => string,     // Nội dung thông báo
 *     'link' => string|null,   // Link khi người dùng click
 *     'published_at' => Carbon|null, // Thời gian hiển thị (default: now)
 *     'expires_at' => Carbon|null    // Thời gian hết hạn (default: +3 ngày)
 * ]
 *
 * @return bool Trả về true nếu tạo thành công, false nếu có lỗi
 */
    public function sendNotification(
        int $type,
        string $content,
        
        ?string $link = null,
        ?int $user_id = null,
    ): bool {
        try {
            $published_at =  Carbon::now();
            $expires_at =  Carbon::now()->addDays(3);

            if ($user_id !== null) {
                // Gửi thông báo riêng cho user
                if (!User::where('id', $user_id)->exists()) {
                    Log::warning("Gửi thông báo thất bại: người dùng không tồn tại - $user_id");
                    return false;
                }
                $noti = Notification::create([
                    'user_id'      => $user_id,
                    'type'         => $type,
                    'content'      => $content,
                    'link'         => $link,
                    'is_read'      => 0,
                    'published_at' => $published_at,
                    'expires_at'   => $expires_at,
                ]);
                event(new SystemNotification(
                'NOTIFICATION_PRIVATE', // Loại thông báo
                [
                    "id"=> $noti->id,
                    "type"=> $type,
                    "content"=> $content,
                    "published_at"=> $published_at,
                    "link"=> $link,
                    "is_read"=> 0,
                    'user_id'=>$user_id
                ]
            ));
                return true;
            } else {
                // Gửi thông báo toàn bộ
                $global_noti =  GlobalNotification::create([
                    'type'         => $type,
                    'content'      => $content,
                    'link'         => $link,
                    'published_at' => $published_at,
                    'expires_at'   => $expires_at,
                ]);
                    event(new SystemNotification(
        'NOTIFICATION_PUBLIC', // Loại thông báo
        [
            "id"=> $global_noti->id,
            "type"=> $type,
            "content"=> $content,
            "published_at"=> $published_at,
            "link"=> $link,
            "is_read"=> 0,
        
        ]
    ));
    return true;
            }
        } catch (\Throwable $e) {
            Log::error('Lỗi khi gửi thông báo: ' . $e->getMessage());
            return false;
        }
    }

    // Ví dụ: 
   /* Gửi thông báo toàn bộ
    $this->sendNotification(
        type: 1,
        content: "Bạn có vâu chờ mới",
        link: "/vaucho"
    );

    // Gửi thông báo với user chỉ định
    $this->sendNotification(
        user_id: 7,
        type: 1,
        content: "Thêm giỏ hàng thành công",
        link: "/cart"
    );

    */

}
