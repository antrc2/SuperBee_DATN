<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
// use Illuminate\Support\Facades\Validator;

class AWSController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function upload(Request $request)
    {
        // Validate file
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Lấy file từ request
            $file = $request->file('image');
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Upload lên S3
            $path = Storage::disk('s3')->putFileAs('uploads', $file, $fileName, 'public');

            // Kiểm tra xem upload có thành công không
            if ($path) {
                // Kiểm tra sự tồn tại của file trên S3 (tùy chọn)
                if (Storage::disk('s3')->exists($path)) {
                    // Lấy URL của ảnh
                    $url = Storage::disk('s3')->url($path);

                    return response()->json([
                        'success' => true,
                        'url' => $url,
                        'message' => 'Ảnh đã được upload thành công!'
                    ], 200);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Upload thất bại: File không tồn tại trên S3.'
                    ], 500);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload thất bại: Không thể lưu file lên S3.'
                ], 500);
            }
        } catch (S3Exception $e) {
            // Xử lý lỗi từ AWS S3
            return response()->json([
                'success' => false,
                'message' => 'Lỗi từ AWS S3: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            // Xử lý các lỗi khác
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
