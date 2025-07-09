<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Product;
use App\Models\Wallet;
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
        $topNap = Wallet::with(['user' => function($query) {
            $query->select('id','username');
        }])
        ->select('balance','user_id')->orderBy('balance', 'desc') 
        ->limit(5)
        ->get();
        $topProduct =Product::with("images")->with('category')->with("gameAttributes")->where('status', 1)->orderBy('price', 'asc')->get();
        return response()->json([
            'status' => 200,
            'message' => 'thanh cong',
            'banners' => $banner,
            'categories' => $categories->data,
            'top'=>$topNap,
            'products'=>$topProduct
        ],200);
    }
}
