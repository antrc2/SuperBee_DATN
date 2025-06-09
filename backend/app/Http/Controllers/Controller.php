<?php

namespace App\Http\Controllers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Request; // Không cần thiết nếu đây là abstract Controller và Request không được dùng trong hàm này
use Illuminate\Support\Facades\Log; // Import facade Log

abstract class Controller
{
    /**
     * Lưu một file và trả về đường dẫn công khai.
     * Hàm sẽ tự động tạo thư mục nếu nó chưa tồn tại.
     *
     * @param UploadedFile $file Đối tượng file đã upload.
     * @param string $directory Thư mục đích trong storage/app/public (ví dụ: 'images', 'documents').
     * @return string|null Đường dẫn công khai của file đã lưu, hoặc null nếu có lỗi.
     */
    public function uploadFile(UploadedFile $file, string $directory): ?string
    {
        try {
            // Kiểm tra và tạo thư mục nếu nó chưa tồn tại
            // Storage::disk('public')->path() trả về đường dẫn vật lý đến thư mục gốc của disk 'public'
            $fullPath = Storage::disk('public')->path($directory);
            if (!file_exists($fullPath)) {
                // Tạo thư mục đệ quy với quyền 0755
                mkdir($fullPath, 0755, true);
            }

            // Lấy phần mở rộng của file gốc
            $extension = $file->getClientOriginalExtension();

            // Tạo tên file duy nhất bằng UUID
            $filename = Str::uuid() . '.' . $extension;

            // Đường dẫn tương đối của file trong storage/app/public
            $relativePath = $directory . '/' . $filename;

            // Lưu file vào disk 'public'
            // storePubliclyAs tự động xử lý quyền truy cập công khai
            $file->storePubliclyAs($directory, $filename, 'public');

            // Trả về URL công khai của file đã lưu
            return Storage::url($relativePath);

        } catch (\Exception $e) {
            // Ghi log lỗi để dễ dàng debug
            Log::error('Error uploading file: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'directory' => $directory,
                'exception_trace' => $e->getTraceAsString() // Ghi thêm trace để debug sâu hơn
            ]);
            return null; // Trả về null nếu có lỗi
        }
    }
}