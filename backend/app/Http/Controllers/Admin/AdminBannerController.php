<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class AdminBannerController extends Controller
{
  public function index(Request $request)
    {
        try {
            $request->validate([
                'status' => 'sometimes|in:0,1',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
            ]);

            $query = Banner::query();

            // Lọc theo trạng thái
            $query->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            });

            // Lọc theo khoảng ngày tạo
            $query->when($request->filled('start_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->start_date);
            });
            $query->when($request->filled('end_date'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->end_date);
            });

            // Sắp xếp và phân trang
            $banners = $query->latest()->paginate(12)->withQueryString();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách banner thành công',
                'data' => $banners
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching banners: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách banner.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy banner'], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Xem chi tiết banner thành công',
            'data' => $banner
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'link' => 'nullable|url',
            'image' => 'required|image|mimes:jpeg,png,jpg,svg|max:10000',
            'alt_text' => 'nullable|string|max:255',
        ]);

         $imageUrl = null;

            // 2. Kiểm tra và tải ảnh nếu có
            if ($request->hasFile('image')) {
                $imageUrl = $this->uploadFile(
                    $request->file('image'),
                    'Banner_image' 
                );

                if (is_null($imageUrl)) {
                    // Xử lý lỗi nếu việc tải ảnh không thành công
                    return response()->json(['message' => 'Failed to upload Banner image.'], 500);
                }
            }

        $banner = Banner::create([
            'title' => $validated['title'] ?? null,
            'link' => $validated['link'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'image_url' => $imageUrl,
            'status' => 1,
            'web_id' => $request->web_id,
            'created_by' => $request->user_id,
            'updated_by' => $request->user_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Thêm banner thành công',
            'data' => $banner
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy banner'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'link' => 'nullable|url',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:10000',
            'alt_text' => 'nullable|string|max:255',
            'status' => 'nullable|in:0,1',
        ]);

        if ($request->hasFile('image')) {
            // Xoá ảnh cũ
            if ($banner->image_url) {
                $old = str_replace('/storage/', '', $banner->image_url);
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('image')->store('banners', 'public');
            $banner->image_url = '/storage/' . $path;
        }

        $banner->update(array_merge(
            $validated,
            ['updated_by' => $request->user_id]
        ));

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật banner thành công',
            'data' => $banner
        ]);
    }

    public function destroy($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy banner'], 404);
        }

        if ($banner->image_url) {
            $old = str_replace('/storage/', '', $banner->image_url);
            Storage::disk('public')->delete($old);
        }

        $banner->delete();

        return response()->json([
            'status' => true,
            'message' => 'Xoá banner thành công'
        ]);
    }
}
