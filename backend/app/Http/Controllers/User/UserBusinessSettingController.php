<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Business_setting;
use App\Models\Category;
use App\Models\Categorypost;
use App\Models\Post;
use Illuminate\Http\Request;

class UserBusinessSettingController extends Controller
{
    public function index()
    {
        try {
            $businessSettings = Business_setting::get();
            $generalSettings = Post::where('category_id', 1)->select('id','title','slug')->take(5)->get();
            $productSettings = Category::where('parent_id', null)->where('id', '!=', 1) ->select('id','name','slug')->take(5)->get();
            
            return response()->json([
                "status"=>true,
                "message"=>"Lấy dữ liệu thành công",
                "data"=>[
                    "businessSettings"=>$businessSettings,
                    "generalSettings"=>$generalSettings,
                    "productSettings"=>$productSettings,
                ],
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>false,
                "message"=>"Lỗi khi lấy dữ liệu cấu hình". $th->getMessage(),
            ]);
        }
    }
}
