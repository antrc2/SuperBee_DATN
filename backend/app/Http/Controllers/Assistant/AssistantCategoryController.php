<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssistantCategoryController extends Controller
{
    public function index(Request $request){
        try {
            $categories = Category::all(['name','slug']);
            return response()->json([
                "status"=>False,
                'message'=>"Lấy danh sách danh mục sản phẩm thành công",
                'data'=>$categories
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách danh mục sản phẩm thất bại",
                'data'=>[]
            ]);
        }
    }
}
