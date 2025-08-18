<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business_setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
    public function update(Request $request, $id)
    {
        try {
            $data = Business_setting::find($id);
        if (!$data) {
            return response()->json([
                "status" => false,
                "message" => "Không timd thấy dữ liệu",
            ]);
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
            'template_name' => ['required', 'string'],
            'header_settings' => 'nullable|json',
            'footer_settings' => 'nullable|json',
            'auto_post' => 'boolean',
            'auto_transaction' => 'boolean',
            'auto_post_interval' => 'integer|min:1|max:1440',
        ]);
        $data->update($validated);
        return response()->json([

            "status" => true,
            "message" => "Cập nhật thành công",
            "data" => $data
        ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>false,
                "message"=>"Cập nhật thất bại",
            ]);
        }
    }
}
