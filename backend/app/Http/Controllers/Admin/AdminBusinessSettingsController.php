<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminBusinessSettingsController extends Controller
{
    public function show(Request $request)
    {
        $web_id = $request->web_id;
        $settings = BusinessSetting::get();

        if (!$settings) {
            return response()->json(['message' => 'Cấu hình không tồn tại'], 404);
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $web_id = $request->web_id;
        $settings = BusinessSetting::where('web_id', $web_id)->first();

        if (!$settings) {
            return response()->json(['message' => 'Cấu hình không tồn tại'], 404);
        }

        $validated = $request->validate([
            'shop_name' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|url',
            'favicon_url' => 'nullable|string|url',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'zalo_link' => 'nullable|string|url',
            'facebook_link' => 'nullable|string|url',
            'template_name' => ['required', 'string', Rule::in(['default', 'template1', 'template2'])],
            'header_settings' => 'nullable|json',
            'footer_settings' => 'nullable|json',
            'auto_post' => 'boolean',
            'auto_transaction' => 'boolean',
            'auto_post_interval' => 'integer|min:1|max:1440',
        ]);

        $settings->update($validated);

        return response()->json(['message' => 'Cấu hình đã được cập nhật', 'data' => $settings]);
    }
}