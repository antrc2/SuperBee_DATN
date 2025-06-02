<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AWSController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function upload(Request $request)
    {
        // Validate file ảnh
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->messages()->first(),
                'messageType' => 'error',
                'status' => 400
            ], 400);
        }

        // Lấy file ảnh từ request
        $image = $request->file('image');
        $uploadFolder = 'uploads'; // Thư mục lưu trữ trên S3
        $fileName = time() . '_' . $image->getClientOriginalName();

        // Upload file lên S3
        $path = $image->storeAs($uploadFolder, $fileName, 's3');

        // Đặt quyền công khai cho file
        Storage::disk('s3')->setVisibility($path, 'public');

        // Lấy URL của file trên S3
        $url = Storage::disk('s3')->url($path);

        // Trả về response
        return response()->json([
            'message' => 'File uploaded successfully',
            'messageType' => 'success',
            'status' => 200,
            'data' => [
                'image_name' => $fileName,
                'image_url' => $url,
                'mime' => $image->getClientMimeType(),
            ]
        ], 200);
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
