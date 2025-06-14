<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class UserCategoryController extends Controller
{
    
    public function index()
    {
        try {
            $categories = Category::where('status', 1)->get();

            $buildTree = function ($categories, $parentId = null) use (&$buildTree) {
                $tree = [];

                foreach ($categories as $category) {
                    if ($category->parent_id === $parentId) {
                        $children = $buildTree($categories, $category->id);

                        $tree[] = [
                            'id' => $category->id,
                            'name' => $category->name,
                            'image' => $category->image_url,
                            'parent_id' => $category->parent_id,
                            'slug' => $category->slug,
                            'children' => $children
                        ];
                    }
                }

                return $tree;
            };

            $treeCategories = $buildTree($categories);

            return response()->json([
                'status' => true,
                'data' => $treeCategories
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    
    public function show($id)
    {
        try {
            // Validate ID is numeric
            if (!is_numeric($id)) {
                return response()->json([
                    'status' => false,
                    'message' => 'ID danh mục không hợp lệ'
                ], 400);
            }

            $category = Category::where('id', $id)
                ->where('status', 1)->first();
               

            if (!$category) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy danh mục này'
                ], 404);
            }
            if($category->parent_id !== null) {
             $data = Product::with(['images','gameAttributes'])->where('status', 1)->where('category_id',$category->id)->get();
            }else{
                $data = $category->where('parent_id',$category->id)->get();
            }
            return response()->json([
                'status' => true,
                'data' => [
                    'category' => $category,
                    'dataProducts' => $data
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

}
