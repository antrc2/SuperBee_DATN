<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Product;
use Illuminate\Http\Request;

class UserBannerController extends Controller
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
}