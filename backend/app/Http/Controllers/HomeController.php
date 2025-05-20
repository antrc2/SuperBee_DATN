<?php

namespace App\Http\Controllers;

use App\Models\Web;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    //
    public function domain(Request $request)
    {
        $a =   $request->header('authorization');
        return response()->json([$a]);
    }
    public function active(Request $request)
    {
        $shopKey = $request->keyShop;
        $shop = Web::where('api_key', $shopKey)->first();
        if ($shop == null) {
            return response()->json(["message" => "Key không tồn tại hoặc sai", "status" => false], 401);
        }
        $shop->status = 1;
        $shop->save();
        return response()->json(["message" => "Kích Hoạt web thành công", "status" => true], 200);
    }
}
