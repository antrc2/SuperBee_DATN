<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssistantCategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            // $categories = Category::all(['name','slug']);
            $categories = Category::with(['products' => function ($query) {
                $query->select('sku', 'category_id'); // Phải có khóa ngoại để Eloquent ánh xạ đúng
            }])->get(['id', 'name']); // Phải lấy 'id' để match với 'category_id'
            return response()->json([
                "status" => False,
                'message' => "Lấy danh sách danh mục sản phẩm thành công",
                'data' => $categories
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status' => False,
                'message' => "Lấy danh sách danh mục sản phẩm thất bại",
                'data' => []
            ]);
        }
    }
    public function show(Request $request,$category_name){
        try {
            $category = Category::where('name',$category_name)->with('products.gameAttributes')->with("products.images")->get();
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách sản phẩm theo danh mục thành công",
                'data'=>$category
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách sản phẩm theo danh mục thất bại",
                'data'=>[]
            ]);
            //throw $th;
        }
    }
}
