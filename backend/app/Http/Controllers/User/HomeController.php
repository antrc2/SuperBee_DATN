<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    //
    public function index(Request $request)
    {
        $banner = Banner::where('web_id', $request->web_id)
            ->where('status', 1)
            ->orderBy('id', 'asc')
            ->get();
        $category = new UserCategoryController();
        $categories = $category->index()->getData();
        $data = [
            'banners' => $banner,
            'categories' => $categories->data
        ];
        return response()->json([
            'status' => 200,
            'message' => 'thanh cong',
            'data' => $data
        ]);
    }
}
