<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminBannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách banner thành công',
            'data' => $banners
        ]);
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

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('banners', 'public');
            $url = '/storage/' . $path;
        }

        $banner = Banner::create([
            'title' => $validated['title'] ?? null,
            'link' => $validated['link'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'image_url' => $url,
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
