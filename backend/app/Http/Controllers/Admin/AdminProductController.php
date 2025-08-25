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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::query()->where("status", "!=", 2)->with(['category', 'images', 'gameAttributes']);

            // Lọc theo từ khóa tìm kiếm (SKU)
            if ($request->filled('search')) {
                $searchTerm = $request->input('search');
                $query->where('sku', 'like', '%' . $searchTerm . '%');
            }

            // Lọc theo danh mục sản phẩm (category_id)
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->input('category_id'));
            }

            // Lọc theo giá tối thiểu (price_min)
            if ($request->filled('price_min')) {
                $priceMin = filter_var($request->input('price_min'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '>=', $priceMin);
            }

            // Lọc theo giá tối đa (price_max)
            if ($request->filled('price_max')) {
                $priceMax = filter_var($request->input('price_max'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '<=', $priceMax);
            }

            // Lọc theo trạng thái
            if ($request->has('status') && $request->input('status') !== '') {
                $query->where('status', $request->input('status'));
            }

            $perPage = $request->input('per_page', 10);
            $products = $query->latest()->paginate($perPage);

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách sản phẩm thành công",
                "data" => $products
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Lấy danh sách sản phẩm thất bại. Có lỗi xảy ra.",
                "data" => []
            ], 500);
        }
    }

    public function getProductsBrowse(Request $request)
    {
        // Bắt đầu với một query cơ bản và eager loading các quan hệ để tránh lỗi N+1
        $query = Product::query()->where("status", "=", 2)->with(['category', 'images', 'gameAttributes']);

        try {
            // Lọc theo danh mục sản phẩm (category_id)
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->input('category_id'));
            }

            // Lọc theo giá tối thiểu (price_min)
            if ($request->filled('price_min')) {
                $priceMin = filter_var($request->input('price_min'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '>=', $priceMin);
            }

            // Lọc theo giá tối đa (price_max)
            if ($request->filled('price_max')) {
                $priceMax = filter_var($request->input('price_max'), FILTER_SANITIZE_NUMBER_INT);
                $query->where('price', '<=', $priceMax);
            }

            // Lọc theo trạng thái
            if ($request->has('status') && $request->input('status') !== '') {
                $query->where('status', $request->input('status'));
            }

            $perPage = $request->input('per_page', 10);
            $products = $query->latest()->paginate($perPage);

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách sản phẩm thành công",
                "data" => $products
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Lấy danh sách sản phẩm thất bại. Có lỗi xảy ra.",
                "data" => []
            ], 500);
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
            $product = Product::with(['category', 'images', 'gameAttributes', 'credentials', 'creator'])
                ->find($id);

            if (!$product) {
                return response()->json(['status'  => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
            }
            if ($product->status == 4 || $product->status == 2) {
                return response()->json(["status" => False, "message" => "Không thể sửa sản phẩm"], 400);
            }

            $attrs = $request->input('attributes');
            if (is_string($attrs)) {
                $attrs = json_decode($attrs, true);
                $request->merge(['attributes' => $attrs]);
            }

            $sku = $product->sku;

            $rules = [
                'category_id'                 => 'required|integer|exists:categories,id',
                'import_price'                => 'required|numeric|min:0|max:999999999999999',
                'price'                       => 'required|numeric|min:0|max:999999999999999',
                'sale'                        => 'nullable|numeric|min:0|max:999999999999999',
                'username'                    => 'required|string',
                'password'                    => 'required|string',
                'email'                       => 'nullable|string',
                'phone'                       => 'nullable|string',
                'cccd'                        => 'nullable|string',
                'attributes'                  => 'required|array',
                'attributes.*.attribute_key'  => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images'                      => 'nullable|array',
                'images.*'                    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
                'description'                 => 'nullable|string',
            ];

            $messages = [
                'import_price.max'      => 'Giá nhập không được vượt quá 15 chữ số.',
                'price.max'      => 'Giá bán không được vượt quá 15 chữ số.',
                'sale.max'     => 'Giảm giá không được vượt quá 15 chữ số.',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $validated = $validator->validated();

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
                'description' => $validated['description'] ?? $product->description,
                'price'       => $validated['price'] ?? $product->price,
                'sale' => (isset($validated['sale']) && $validated['sale'] != 0) ? $validated['sale'] : null,
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
                $delete_images = [];
                foreach ($product->images as $img) {
                    if (! in_array($img->image_url, $keepList, true)) {
                        // Chuyển URL public về đường dẫn relative: "product_images/uuid.jpg"
                        $relative = parse_url($img->image_url, PHP_URL_PATH);
                        // $this->deleteFile($relative);
                        $delete_images[] = $relative;
                        $img->delete();
                    }
                }
                $this->deleteFiles($delete_images);

                // 2) Nếu có file mới, upload rồi lưu vào DB
                // if ($request->hasFile('images')) {
                //     foreach ($request->file('images') as $file) {
                //         $url = $this->uploadFile($file, 'product_images/'.$product->sku);
                //         if (is_null($url)) {
                //             DB::rollBack();
                //             return response()->json([
                //                 'status'  => false,
                //                 'message' => 'Upload ảnh thất bại',
                //             ], 500);
                //         }
                //         ProductImage::create([
                //             'product_id' => $product->id,
                //             'alt_text'   => $file->getClientOriginalName(),
                //             'image_url'  => $url,
                //         ]);
                //     }
                // }
                $response = $this->uploadFiles($request->file('images'), 'product_images/' . $product->sku);
                foreach ($response as $image) {
                    if (is_null($image['url'])) {
                        DB::rollBack();
                        return response()->json([
                            'message' => $image['message'],
                            "status" => False
                        ], 500);
                    }

                    ProductImage::create([
                        'product_id' => $product->id,
                        "alt_text" => $image['filename'],
                        "image_url" => $image['url']
                    ]);
                }
            }
            // Cập nhật credentials nếu có
            if (isset($validated['username'], $validated['password'], $validated['email'], $validated['phone'], $validated['cccd'])) {
                $cred = $product->credentials()->first();  // trả về ProductCredential|null
                if ($cred) {
                    $cred->update([
                        'username' => $validated['username'],
                        'password' => $validated['password'],
                        "email"      => $validated['email'] ?? null,
                        "phone"      => $validated['phone'] ?? null,
                        "cccd"       => $validated['cccd'] ?? null
                    ]);
                } else {
                    // Nếu chưa có credential, bạn có thể tạo mới:
                    $product->credentials()->create([
                        'username' => $validated['username'],
                        'password' => $validated['password'],
                        "email"      => $validated['email'] ?? null,
                        "phone"      => $validated['phone'] ?? null,
                        "cccd"       => $validated['cccd'] ?? null
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


            $frontend_link = env("FRONTEND_URL");
            $this->sendNotification(1, "Sản phẩm {$sku} đã sửa thành công", "{$frontend_link}/admin/products/{$product->id}/edit", null, 'products.view');
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
                // 'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status'  => false,
                'message' => 'Đã có lỗi xảy ra',
                // 'error'   => $th->getMessage(),
            ], 500);
        }
    }


    public function store(Request $request)
    {
        try {
            $attributes = is_string($request->input('attributes'))
                ? json_decode($request->input('attributes'), true)
                : $request->input('attributes');
            $request->merge(['attributes' => $attributes]);

            $rules = [
                'category_id'                 => 'required|integer|exists:categories,id',
                'import_price'                => 'required|numeric|min:0|max:999999999999999',
                'price'                       => 'required|numeric|min:0|max:999999999999999',
                'sale'                        => 'nullable|numeric|min:0|max:999999999999999',
                'username'                    => 'required|string',
                'password'                    => 'required|string',
                'email'                       => 'nullable|string',
                'phone'                       => 'nullable|string',
                'cccd'                        => 'nullable|string',
                'attributes'                  => 'required|array',
                'attributes.*.attribute_key'  => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images'                      => 'required|array',
                'images.*'                    => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
                'description'                 => 'nullable|string',
            ];

            $messages = [
                'import_price.max'      => 'Giá nhập không được vượt quá 15 chữ số.',
                'price.max'      => 'Giá bán không được vượt quá 15 chữ số.',
                'sale.max'     => 'Giảm giá không được vượt quá 15 chữ số.',
            ];

            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(),
                ], 422);
            }
            $validatedData = $validator->validated();

            if (isset($validatedData['sale']) && $validatedData['sale'] >= $validatedData['price']) {
                return response()->json([
                    "status" => false,
                    "message" => "Giá sale phải nhỏ hơn giá gốc",
                ], 400);
            }

            // Bắt đầu transaction
            DB::beginTransaction();
            function generate_sku($length = 20)
            {
                $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                $code = '';
                for ($i = 0; $i < $length; $i++) {
                    $code .= $characters[random_int(0, strlen($characters) - 1)];
                }
                return $code;
            }

            $sku = "";

            do {
                $sku = generate_sku(8);
            } while (Product::where('sku', $sku)->first() !== NULL);
            // Tạo sản phẩm
            $product = Product::create([
                "category_id" => $validatedData['category_id'],
                "sku" => $sku,
                "import_price" => $validatedData['import_price'],
                "price" => $validatedData['price'],
                "sale" => (isset($validatedData['sale']) && $validatedData['sale'] != 0) ? $validatedData['sale'] : null,
                "web_id" => $request->web_id,
                'status' => 1, // Mặc định là 1 (có sẵn)
                "created_by" => $request->user_id,
                "updated_by" => $request->user_id,
                "description" => $validatedData['description'] ?? $request->description
            ]);

            // Xử lý upload hình ảnh
            $images = $request->file('images'); // Lấy mảng các file
            // foreach ($images as $image) {
            //     // Gọi uploadFile cho từng file riêng lẻ
            //     $imageUrl = $this->uploadFile($image, 'product_images/'.$sku);

            //     if (is_null($imageUrl)) {
            //         // Rollback nếu upload thất bại
            //         DB::rollBack();
            //         return response()->json(['message' => 'Failed to upload product image.'], 500);
            //     }

            //     // Lưu thông tin hình ảnh vào bảng ProductImage
            //     ProductImage::create([
            //         'product_id' => $product->id,
            //         'alt_text' => $image->getClientOriginalName(), // Tên file gốc làm alt_text
            //         'image_url' => $imageUrl, // Đường dẫn đã upload
            //     ]);
            // }
            $response = $this->uploadFiles($images, 'product_images/' . $sku);
            foreach ($response as $image) {
                if ($image['url'] == "") {
                    DB::rollBack();
                    return response()->json([
                        "status" => False,
                        "message" => $image['message'],
                    ], 500);
                }
                // if (is_null($image['url'])){
                //     DB::rollBack();
                //     return response()->json(['message' => $image['messsage'],'status'=>False], 500);
                // }

                ProductImage::create([
                    'product_id' => $product->id,
                    "alt_text" => $image['filename'],
                    "image_url" => $image['url']
                ]);
            }

            // Lưu thông tin đăng nhập
            ProductCredential::create([
                'product_id' => $product->id,
                'username' => $validatedData['username'],
                'password' => $validatedData['password'],
                "email"      => $validatedData['email'] ?? null,
                "phone"      => $validatedData['phone'] ?? null,
                "cccd"       => $validatedData['cccd'] ?? null
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
            $frontend_link = env("FRONTEND_URL");
            $this->sendNotification(1, "Sản phẩm {$sku} đã được thêm thành công", "{$frontend_link}/admin/products/{$product->id}", null, 'products.view');
            return response()->json([
                "status" => true,
                "message" => "Thêm sản phẩm thành công",
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Lỗi validate
            return response()->json([
                "status" => false,
                "message" => "Dữ liệu không hợp lệ",
                // "errors" => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            // Rollback nếu có lỗi
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                // "error" => $th->getMessage(),
            ], 500);
        }
    }

    private function   check_isset_product_by_id($id)
    {
        return Product::where("id", $id)->exists();
    }

    public function cancel(Request $request, $id)
    {
        try {
            if ($this->check_isset_product_by_id($id)) {
                $product = Product::where("id", $id)->where("status", 1)->update([
                    "status" => 3
                ]);

                if ($product) {
                    return response()->json([
                        "status" => true,
                        "message" => "Đã hủy bán sản phẩm",
                    ]);
                }

                return response()->json([
                    "status" => false,
                    "message" => "Không thể hủy bán sản phẩm",
                ], 400);
            }

            return response()->json([
                "status" => False,
                "message" => "Sản phẩm không tồn tại",
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }

    public function accept(Request $request, $id)
    {
        try {
            $password = $request->password;
            $price = $request->price;
            $sale = $request->sale;
            if ($sale == 0) {
                $sale = null;
            }
            if ($this->check_isset_product_by_id($id)) {
                $product = Product::where("id", $id)->where("status", 2)->update([
                    "status" => $request->status,
                    "price" => $price,
                    "sale" => $sale
                ]);


                if ($product) {
                    ProductCredential::where("product_id", $id)->update([
                        "password" => $password
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
                    "status" => False,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }
    public function restore(Request $request, $id)
    {
        try {
            if ($this->check_isset_product_by_id($id)) {
                $product = Product::where("id", $id)->where("status", 3)->update([
                    "status" => 1
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
                    "status" => False,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }


    public function deny(Request $request, $id)
    {
        try {
            if ($this->check_isset_product_by_id($id)) {
                $product = Product::where("id", $id)->where("status", 2)->update([
                    "status" => 0
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
                    "status" => False,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }
}
