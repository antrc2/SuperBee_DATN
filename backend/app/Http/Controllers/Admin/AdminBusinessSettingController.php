<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business_setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminBusinessSettingController extends Controller
{
    public function index()
    {
        try {
            $data = Business_setting::get();
            if ($data->isEmpty()) {
                return response()->json([
                    "status" => false,
                    "message" => "Không có dữ liệu"
                ]);
            }
            return response()->json([
                "status" => true,
                "message" => "Lấy dữ liệu thành công",
                "data" => $data
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Có lỗi xảy ra",
            ]);
        }
    }

    public function update(Request $request)
    {
        // Log::info('Request data:', $request->all());
        // Log::info('Request files:', $request->allFiles());
        try {
            $validated = $request->validate([
                'shop_name'        => 'required|string|max:255',
                'slogan'           => 'nullable|string|max:255',
                'phone_number'     => 'nullable|string|max:50',
                'email'            => 'nullable|email|max:255',
                'address'          => 'nullable|string|max:500',
                'zalo_link'        => 'nullable|url|max:500',
                'facebook_link'    => 'nullable|url|max:500',
                'template_name'    => 'required|string|max:100',
                'auto_post'        => 'nullable|boolean',
                'auto_transaction' => 'nullable|boolean',
                'auto_post_interval' => 'nullable|integer|min:1|max:1440',
                'logo_url'         => 'nullable|image|mimes:jpeg,png,jpg,svg|max:10000',
                'favicon_url'      => 'nullable|image|mimes:jpeg,png,jpg,svg,ico|max:10000',
                'keep_image_logo'     => 'nullable|boolean',
                'keep_image_favicon'  => 'nullable|boolean',
            ]);

            $setting = Business_setting::first();

            if (!$setting) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy cấu hình'], 404);
            }

            //logo
            if (empty($validated['keep_image_logo']) && !empty($setting->logo_url)) {
                $relative = ltrim(parse_url($setting->logo_url, PHP_URL_PATH), '/');
                $this->deleteFile($relative);
                $setting->logo_url = null;
            }
            if ($request->hasFile('logo_url')) {
                $logoUrl = $this->uploadFile($request->file('logo_url'), 'BusinessSetting_logo');
                if (is_null($logoUrl)) {
                    return response()->json(['status' => false, 'message' => 'Upload logo thất bại.'], 500);
                }
                $validated['logo_url'] = $logoUrl;
            }

            //favicon
            if (empty($validated['keep_image_favicon']) && !empty($setting->favicon_url)) {
                $relative = ltrim(parse_url($setting->favicon_url, PHP_URL_PATH), '/');
                $this->deleteFile($relative);
                $setting->favicon_url = null;
            }
            if ($request->hasFile('favicon_url')) {
                $faviconUrl = $this->uploadFile($request->file('favicon_url'), 'BusinessSetting_favicon');
                if (is_null($faviconUrl)) {
                    return response()->json(['status' => false, 'message' => 'Upload favicon thất bại.'], 500);
                }
                $validated['favicon_url'] = $faviconUrl;
            }

            $validated['auto_post'] = filter_var($validated['auto_post'] ?? 0, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $validated['auto_transaction'] = filter_var($validated['auto_transaction'] ?? 0, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

            unset($validated['keep_image_logo'], $validated['keep_image_favicon']);

            $validated['updated_by'] = $request->user_id ?? null;

            $setting->update($validated);

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật cấu hình thành công',
                'data'    => $setting
            ]);
        } catch (\Throwable $th) {
            Log::error('Update failed: ' . $th->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Cập nhật thất bại: ' . $th->getMessage(),
            ]);
        }
    }
}
