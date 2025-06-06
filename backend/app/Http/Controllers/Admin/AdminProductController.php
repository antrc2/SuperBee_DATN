<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductCredential;
use App\Models\ProductGameAttribute;
use App\Models\ProductImage;
use Aws\Glacier\TreeHash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminProductController extends Controller
{
    public function index(Request $request){
        try {
            $products = Product::with('category')->with("images")->with("gameAttributes")->with("credentials")->get(); 

            return response()->json(
                [
                    "status"=>true,
                    "message"=>"Lấy danh sách sản phẩm thành công",
                    "data"=>$products
                ]
            );
        } catch (\Throwable $th) {
            return response()->json(
                [
                    "status"=>false,
                    "message"=>"Lấy danh sách sản phẩm thất bại",
                    "data"=>[]
                ]
            );
        }
    }
    public function show(Request $request, $id){
        try {
            $product = Product::with('category')->with("images")->with("gameAttributes")->with("credentials")->where('id',$id)->get();
            if (count($product) == 0) {
                return response()->json(
                    [
                        "status"=>false,
                        "message"=>"Không tìm thấy sản phẩm",
                        "data"=> []
                    ],404
                );
            }

            return response()->json(
                [
                    "status"=>True,
                    "message"=>"Xem chi tiết sản phẩm thành công",
                    "data"=>$product
                ]
                );
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra",
                'data'=>[]
            ],500);
        }
    }
    public function update(Request $request, $id) {
        try {
            $product = Product::with('category')->with("images")->with("gameAttributes")->with("credentials")->where('id',$id)->get();
            if (!$product) {
                return response()->json([
                    "status" => false,
                    "message" => "Không tìm thấy sản phẩm",
                    "data" => []
                ], 404);
            }

            $validatedData = $request->validate([
                'category_id' => 'nullable|integer',
                'price'       => 'nullable|integer',
                'sale'        => 'nullable|integer',
                'username'    => 'nullable|string',
                'password'    => 'nullable|string',
                'images'      => 'nullable|array',
                'attributes'  => 'nullable|array'
            ]);

            if (isset($validatedData['sale']) && isset($validatedData['price'])) {
                if ($validatedData['price'] <= $validatedData['sale']) {
                    return response()->json([
                        "status" => false,
                        "message" => "Giá sale không được lớn hơn hoặc bằng giá gốc",
                        "data" => []
                    ], 400);
                }
                $sale = $validatedData['sale'];
            } else {
                $sale = null;
            }

            if (isset($validatedData['category_id'])) {
                $categoryExists = Category::where('id', $validatedData['category_id'])->exists();
                if (!$categoryExists) {
                    return response()->json([
                        "status" => false,
                        "message" => "Danh mục không tồn tại",
                        "data" => []
                    ], 404);
                }
            }

            DB::beginTransaction();

            Product::where('id', $id)->update([
                "category_id" => $validatedData['category_id'] ?? $product->category_id,
                "price"       => $validatedData['price'] ?? $product->price,
                "sale"        => $sale,
                "updated_by"  => $request->user_id
            ]);

            $imagesData = $validatedData['images'] ?? [];
            if (!empty($imagesData)) {
                ProductImage::where('product_id', $id)->delete();
                foreach ($imagesData as $image) {
                    ProductImage::create([
                        'product_id' => $id,
                        'alt_text'   => $image['alt_text'],
                        'image_url'  => $image['image_url']
                    ]);
                }
            }

            $attributes = $validatedData['attributes'] ?? [];
            if (!empty($attributes)) {
                ProductGameAttribute::where('product_id', $id)->delete();
                foreach($attributes as $attribute){
                    foreach($attribute as $key=>$value){
                        ProductGameAttribute::create([
                        "product_id"      => $id,
                        "attribute_key"   => $key,
                        "attribute_value" => $value
                    ]);
                    }
                }
            }
            DB::commit();

            return response()->json([
                "status" => true,
                "message" => "Sửa sản phẩm thành công",
            ], 200);

        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                'error'=>$th->getMessage()
            ], 500);
        }
    }

    public function store(Request $request){
        try {
            $validatedData = $request->validate([
                'category_id'      => 'required|integer',
                'price'  =>  'required|integer',
                'sale'    =>  'nullable|integer',
                "username"=>"required|string",
                "password"=>'required|string',
                "images" => "required|array",
                "attributes" => "required|array"
            ]);
            
            if (count(Category::where('id',$request->category_id)->get())==0){
                return response()->json(
                    [
                        "status"=>False,
                        'message'=>"Danh mục không tồn tại"
                    ], 404
                );
            }
            if (isset($validatedData['sale'])) {
                if ($validatedData['price'] <= $validatedData['sale']) {
                    return response()->json([
                        "status" => false,
                        "message" => "Giá sale không được lớn hơn hoặc bằng giá gốc",
                        "data" => []
                    ], 400);
                }
                $sale = $validatedData['sale'];
            } else {
                $sale = null;
            }
            function generate_sku($length = 20){
                $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                $code = '';
                for ($i = 0; $i < $length ; $i++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }
                return $code;
            }

            $sku = "";

            do {
                $sku = generate_sku();
            } while (Product::where('sku',$sku)->first() !== NULL);
            DB::beginTransaction(); 
            $product = Product::create([
                "category_id"=>$validatedData['category_id'],
                "sku"=>$sku,
                "price"=>$validatedData['price'],
                "sale"=>$sale,
                "web_id"=>$request->web_id,
                "created_by"=>$request->user_id,
                "updated_by"=>$request->user_id
            ]);

            foreach ($validatedData['images'] as $image){
                ProductImage::create([
                    'product_id' => $product->id,
                    'alt_text'   => $image['alt_text'],
                    'image_url'  => $image['image_url']
                ]);
            }

            ProductCredential::create(
                [
                    'product_id'=>$product->id,
                    "username" => $validatedData['username'],
                    "password"=>$validatedData['password']
                ]
            );

            foreach ($validatedData['attributes'] as $attribute) {
                foreach ($attribute as $key => $value) {
                    ProductGameAttribute::create([
                        "product_id"      => $product->id,
                        "attribute_key"   => $key,
                        "attribute_value" => $value
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                "status"=>True,
                "message"=>"Thêm sản phẩm thành công",
            ], 201);
        } catch (\Throwable $th) {
            DB::rollBack();
            $response = [
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra",
                
            ];
            $status_code = 500;
        }
        return response()->json($response,$status_code);
    }
}
