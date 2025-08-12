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
            $categories = Category::where('id','!=',1)->where('status',1)->with(['products' => function ($query) {
                $query->select('sku', 'category_id')->where('status',1); // Phải có khóa ngoại để Eloquent ánh xạ đúng
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
    public function show(Request $request,$id){
        try {
            $category = Category::where('id',$id)->where('status',1)->where('id','!=',1)->with('products.gameAttributes')->with("products.images")->get();
            $frontend_link = env("FRONTEND_URL");
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách sản phẩm theo id danh mục {$id} thành công",
                'data'=>$category,
                "link"=>"{$frontend_link}/mua-acc/{$category->slug}"
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách sản phẩm theo id danh mục {$id} thất bại",
                'data'=>[]
            ]);
            //throw $th;
        }
    }
    public function get_category_name(Request $request){
        try {
            $categories = Category::all('name');
            return response()->json([
                'status'=>True,
                'message'=>"Lấy danh sách danh mục thành công",
                'data'=>$categories
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>False,
                'message'=>"Lấy danh sách danh mục thất bại",
                'data'=> []
            ]);
        }
    }
}
