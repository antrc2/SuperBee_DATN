<?php

namespace App\Http\Controllers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request; // Không cần thiết nếu đây là abstract Controller và Request không được dùng trong hàm này
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Import facade Log

abstract class Controller
{
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

    public function uploadFiles(array $files, string $directory): array
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
                    'images',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                );
            }
        }

        // Gửi 1 lần duy nhất
        $response = $request->post("{$apiUrl}/upload_files", [
            'folder' => $directory,
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

    public function uploadFile(UploadedFile $file, string $directory): ?string
    {
        try {
            $api_url = env('PYTHON_API');
            $response = Http::attach(
                'image',
                file_get_contents($file->getRealPath()),
                $file->getClientOriginalName()
            )->post("{$api_url}/upload_file",["folder"=>$directory]);
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
    public function  deleteFiles(array $paths){
        try {
            $api_url = env('PYTHON_API');
            $response = Http::post("{$api_url}/delete_files",["paths"=>$paths]);
            $response = json_decode($response);
            return $response->status;
        } catch (\Throwable $th) {
            // throw $th;
            return false;
        }
    }
    public function deleteFile(string $relativePath ){
        try {
            $api_url = env('PYTHON_API');
            $response = Http::post("{$api_url}/delete_file",["path"=>$relativePath]);
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
}
