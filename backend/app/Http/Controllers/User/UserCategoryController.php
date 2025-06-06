<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Category;
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
                ->where('status', 1)
                ->with(['products' => function($query) {
                    $query->where('status', 1)
                        ->with(['images', 'gameAttributes'])
                        ->orderBy('created_at', 'desc');
                }])
                ->first();

            if (!$category) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy danh mục này'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'category' => $category,
                    'products' => $category->products
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
