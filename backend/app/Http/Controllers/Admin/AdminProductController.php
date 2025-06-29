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
    public function index(Request $request)
    {
        // Bắt đầu với một query cơ bản và eager loading các quan hệ để tránh lỗi N+1
        $query = Product::query()->with(['category', 'images', 'credentials', 'gameAttributes']);

        try {
            // Lọc theo danh mục sản phẩm (category_id)
            // Request::has() chỉ kiểm tra sự tồn tại, nên dùng filled() để chắc chắn có giá trị và không rỗng
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->input('category_id'));
            }

            // Lọc theo giá tối thiểu (price_min)
            if ($request->filled('price_min')) {
                // Đảm bảo giá trị là số trước khi query
                $priceMin = filter_var($request->input('price_min'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '>=', $priceMin);
            }

            // Lọc theo giá tối đa (price_max)
            if ($request->filled('price_max')) {
                $priceMax = filter_var($request->input('price_max'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '<=', $priceMax);
            }

            // Lọc theo trạng thái (ví dụ: 1 = 'còn hàng', 0 = 'đã bán')
            // Dùng `has` thay vì `filled` nếu status có thể là '0'
            if ($request->has('status') && $request->input('status') !== '') {
                 $query->where('status', $request->input('status'));
            }

            // Lấy số lượng item mỗi trang từ request, mặc định là 10
            $perPage = $request->input('per_page', 10);
            $products = $query->latest()->paginate($perPage); // Sắp xếp theo mới nhất và phân trang

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách sản phẩm thành công",
                "data" => $products
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Lấy danh sách sản phẩm thất bại. Có lỗi xảy ra.",
                // "error" => $th->getMessage() // Không nên trả về lỗi chi tiết cho client ở môi trường production
                "data" => []
            ], 500); // Trả về status code 500
        }
    }
    public function show(Request $request, $id)
    {
        try {
            $product = Product::with(['category', "images", "gameAttributes", "credentials", "updater", "creator"])->where('id', $id)->get();
            if (count($product) == 0) {
                return response()->json(
                    [
                        "status" => false,
                        "message" => "Không tìm thấy sản phẩm",
                        "data" => []
                    ],
                    404
                );
            }

            return response()->json(
                [
                    "status" => True,
                    "message" => "Xem chi tiết sản phẩm thành công",
                    "data" => $product
                ]
            );
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra",
                'data' => []
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {
            // Lấy product kèm quan hệ
            $product = Product::with(['category','images','gameAttributes','credentials'])
            ->find($id);
            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }

            // Nếu attributes là JSON string, decode nó
            $attrs = $request->input('attributes');
            if (is_string($attrs)) {
                $attrs = json_decode($attrs, true);
                $request->merge(['attributes' => $attrs]);
            }

            // Validate dữ liệu
            $validated = $request->validate([
                'category_id'                 => 'nullable|integer|exists:categories,id',
                'price'                       => 'nullable|numeric|min:0',
                'sale'                        => 'nullable|numeric|min:0',
                'username'                    => 'nullable|string',
                'password'                    => 'nullable|string',
                'attributes'                  => 'nullable|array',
                'attributes.*.attribute_key'  => 'required_with:attributes|string',
                'attributes.*.attribute_value' => 'required_with:attributes|string',
                'images'                      => 'nullable|array',
                'images.*'                    => 'required_with:images|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
            ]);

            // Kiểm tra sale < price
            if (
                isset($validated['sale'], $validated['price']) &&
                $validated['sale'] >= $validated['price']
            ) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Giá sale phải nhỏ hơn giá gốc',
                ], 400);
            }

            DB::beginTransaction();

            // Cập nhật fields cơ bản
            $product->update([
                'category_id' => $validated['category_id'] ?? $product->category_id,
                'price'       => $validated['price'] ?? $product->price,
                'sale'        => $validated['sale']  ?? $product->sale,
                'updated_by'  => $request->user_id,
            ]);

            // Lấy danh sách đường dẫn ảnh cũ phía client muốn giữ lại (ví dụ: ["/storage/product_images/…", …])
            $keepList = $request->input('existing_images', []);
            if (is_string($keepList)) {
                $keepList = json_decode($keepList, true) ?: [];
            }

            // Đếm số ảnh phía DB
            $dbCount = $product->images->count();
            // Đếm số keepList
            $keepCount = count($keepList);

            // Nếu có file mới upload, hoặc số ảnh giữ lại khác với số ảnh DB => cần xử lý lại
            if ($request->hasFile('images') || $keepCount !== $dbCount) {
                // 1) Xóa những ảnh DB mà client không giữ lại
                foreach ($product->images as $img) {
                    if (! in_array($img->image_url, $keepList, true)) {
                        // Chuyển URL public về đường dẫn relative: "product_images/uuid.jpg"
                        $relative = ltrim(parse_url($img->image_url, PHP_URL_PATH), '/storage/');
                        $this->deleteFile($relative);
                        $img->delete();
                    }
                }

                // 2) Nếu có file mới, upload rồi lưu vào DB
                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $file) {
                        $url = $this->uploadFile($file, 'product_images');
                        if (is_null($url)) {
                            DB::rollBack();
                            return response()->json([
                                'status'  => false,
                                'message' => 'Upload ảnh thất bại',
                            ], 500);
                        }
                        ProductImage::create([
                            'product_id' => $product->id,
                            'alt_text'   => $file->getClientOriginalName(),
                            'image_url'  => $url,
                        ]);
                    }
                }
            }
            // Cập nhật credentials nếu có
            if (isset($validated['username'], $validated['password'])) {
                $cred = $product->credentials()->first();  // trả về ProductCredential|null
                if ($cred) {
                    $cred->update([
                        'username' => $validated['username'],
                        'password' => $validated['password'],
                    ]);
                } else {
                    // Nếu chưa có credential, bạn có thể tạo mới:
                    $product->credentials()->create([
                        'username' => $validated['username'],
                        'password' => $validated['password'],
                    ]);
                }
            }

            // Xử lý attributes nếu có
            if (!empty($validated['attributes'])) {
                // Xóa cũ
                ProductGameAttribute::where('product_id', $product->id)->delete();

                // Thêm mới
                foreach ($validated['attributes'] as $attr) {
                    ProductGameAttribute::create([
                        'product_id'      => $product->id,
                        'attribute_key'   => $attr['attribute_key'],
                        'attribute_value' => $attr['attribute_value'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật sản phẩm thành công',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Đã có lỗi xảy ra',
                'error'   => $th->getMessage(),
            ], 500);
        }
    }


    public function store(Request $request)
    {
        try {
            $data = $request->json()->all();

            // Nếu attributes là chuỗi JSON, chuyển nó thành mảng
            $attributes = is_string($request->input('attributes'))
                ? json_decode($request->input('attributes'), true)
                : $request->input('attributes');
            $request->merge(['attributes' => $attributes]);

            // Validate dữ liệu gửi lên
            $validatedData = $request->validate([
                'category_id' => 'required|integer|exists:categories,id',
                // 'sku' => 'required|string|unique:products,sku',
                'price' => 'required|numeric|min:0',
                'sale' => 'nullable|numeric|min:0',
                'username' => 'required|string',
                'password' => 'required|string',
                'attributes' => 'required|array',
                'attributes.*.attribute_key' => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images' => 'required|array',
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
            ]);

            // Kiểm tra giá sale so với giá gốc
            if (isset($validatedData['sale']) && $validatedData['sale'] >= $validatedData['price']) {
                return response()->json([
                    "status" => false,
                    "message" => "Giá sale phải nhỏ hơn giá gốc",
                ], 400);
            }

            // Bắt đầu transaction
            DB::beginTransaction();
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
            // Tạo sản phẩm
            $product = Product::create([
                "category_id" => $validatedData['category_id'],
                "sku" => generate_sku(8),
                "price" => $validatedData['price'],
                "sale" => $validatedData['sale'] ?? null,
                "web_id" => $request->web_id,
                'status' => 1, // Mặc định là 1 (có sẵn)
                "created_by" => $request->user_id,
                "updated_by" => $request->user_id,
            ]);

            // Xử lý upload hình ảnh
            $images = $request->file('images'); // Lấy mảng các file
            foreach ($images as $image) {
                // Gọi uploadFile cho từng file riêng lẻ
                $imageUrl = $this->uploadFile($image, 'product_images');

                if (is_null($imageUrl)) {
                    // Rollback nếu upload thất bại
                    DB::rollBack();
                    return response()->json(['message' => 'Failed to upload product image.'], 500);
                }

                // Lưu thông tin hình ảnh vào bảng ProductImage
                ProductImage::create([
                    'product_id' => $product->id,
                    'alt_text' => $image->getClientOriginalName(), // Tên file gốc làm alt_text
                    'image_url' => $imageUrl, // Đường dẫn đã upload
                ]);
            }

            // Lưu thông tin đăng nhập
            ProductCredential::create([
                'product_id' => $product->id,
                'username' => $validatedData['username'],
                'password' => $validatedData['password'],
            ]);

            // Lưu attributes
            foreach ($validatedData['attributes'] as $attribute) {
                ProductGameAttribute::create([
                    "product_id" => $product->id,
                    "attribute_key" => $attribute['attribute_key'],
                    "attribute_value" => $attribute['attribute_value'],
                ]);
            }

            // Commit transaction
            DB::commit();

            return response()->json([
                "status" => true,
                "message" => "Thêm sản phẩm thành công",
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Lỗi validate
            return response()->json([
                "status" => false,
                "message" => "Dữ liệu không hợp lệ",
                "errors" => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage(),
            ], 500);
        }
    }

    private function check_isset_product_by_id($id) {
        return Product::where("id", $id)->exists();
    }

    public function cancel(Request $request, $id){
        try {
            if ($this->check_isset_product_by_id($id)){
                $product = Product::where("id",$id)->where("status",1)->update([
                    "status"=>3
                ]);


                if ($product) {
                    return response()->json([
                        "status" => true,
                        "message" => "Đã hủy bán sản phẩm",
                    ]);
                } else {
                    return response()->json([
                        "status" => false,
                        "message" => "Không thể hủy bán sản phẩm",
                    ], 400);
                }
            } else {
                return response()->json([
                    "status"=>False,
                    "message"=>"Sản phẩm không tồn tại",
                ],404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra",
            ],500);
        }
    }

    public function accept(Request $request,$id){
        try {
            $password = $request->password;
            if ($this->check_isset_product_by_id($id)){
                $product = Product::where("id",$id)->where("status",2)->update([
                    "status"=>1
                ]);


                if ($product) {
                    ProductCredential::where("product_id",$id)->update([
                        "password"=>$password
                    ]);
                    return response()->json([
                        "status" => true,
                        "message" => "Chấp nhận bán sản phẩm thành công",
                    ]);
                } else {
                    return response()->json([
                        "status" => false,
                        "message" => "Không thể chấp nhận bán sản phẩm",
                    ], 400);
                }
            } else {
                return response()->json([
                    "status"=>False,
                    "message"=>"Sản phẩm không tồn tại",
                ],404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra",
            ],500);
        }
    }
    public function restore(Request $request,$id){
        try {
            if ($this->check_isset_product_by_id($id)){
                $product = Product::where("id",$id)->where("status",3)->update([
                    "status"=>1
                ]);


                if ($product) {
                    return response()->json([
                        "status" => true,
                        "message" => "Khôi phục sản phẩm thành công",
                    ]);
                } else {
                    return response()->json([
                        "status" => false,
                        "message" => "Không thể Khôi phục sản phẩm",
                    ], 400);
                }
            } else {
                return response()->json([
                    "status"=>False,
                    "message"=>"Sản phẩm không tồn tại",
                ],404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra",
            ],500);
        }
    }
    

    public function deny(Request $request,$id){
        try {
            if ($this->check_isset_product_by_id($id)){
                $product = Product::where("id",$id)->where("status",2)->update([
                    "status"=>0
                ]);


                if ($product) {
                    return response()->json([
                        "status" => true,
                        "message" => "Từ chối sản phẩm thành công",
                    ]);
                } else {
                    return response()->json([
                        "status" => false,
                        "message" => "Không thể từ chối sản phẩm",
                    ], 400);
                }
            } else {
                return response()->json([
                    "status"=>False,
                    "message"=>"Sản phẩm không tồn tại",
                ],404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                'message'=>"Đã có lỗi xảy ra",
            ],500);
        }
    }
}
