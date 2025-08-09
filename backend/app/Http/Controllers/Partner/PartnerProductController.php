<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductCredential;
use App\Models\ProductGameAttribute;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PartnerProductController extends Controller
{
    public function index(Request $request)
    {
        // Bắt đầu với một query cơ bản và eager loading các quan hệ để tránh lỗi N+1
        $query = Product::query()->where("created_by", $request->user_id)->with(['category', 'images', 'gameAttributes','credentials']);

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

            // 6) Lấy số bản ghi mỗi trang (mặc định 10)
            $perPage = (int) $request->input('per_page', 10);

            // 7) Chạy query phân trang và sắp xếp mới nhất
            $products = $query->latest()->paginate($perPage);

            // 8) Override credentials: chỉ giữ nếu status == 2
            // 4) Transform mỗi product trong page để thay đổi credentials
            $products->getCollection()->transform(function ($product) {
                // Lấy collection gốc của credentials
                $creds = $product->getRelation('credentials');

                // Map lại: nếu status == 2 thì giữ username/password thật,
                // ngược lại trả về blank.
                $newCreds = $creds->map(function ($c) use ($product) {
                    if ($product->status == 2) {
                        return [
                            'username' => $c->username,
                            'password' => $c->password,
                        ];
                    }
                    return [
                        'username' => '',
                        'password' => '',
                    ];
                });

                // Ép relation credentials thành collection mới
                $product->setRelation('credentials', $newCreds);

                return $product;
            });

            // 9) Trả về JSON chuẩn
            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách sản phẩm thành công',
                'data'    => $products,
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Lấy danh sách sản phẩm thất bại. Có lỗi xảy ra.",
                "data" => [],
                "error"=>$th->getMessage(),
                "line"=>$th->getLine()
            ], 500); // Trả về status code 500
        }
    }
    public function show(Request $request, $id)
    {
        try {
            $product = Product::with(['category', "images", "gameAttributes", "updater", "creator"])
                ->where('id', $id)
                ->where('created_by', $request->user_id)
                ->first();
            if (!$product) {
                return response()->json(
                    [
                        "status" => false,
                        "message" => "Không tìm thấy sản phẩm",
                        "data" => []
                    ],
                    404
                );
            }

            if (in_array($product->status, [0, 2], true)) {
                $product->load('credentials');
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
            $product = Product::with(['category', 'images', 'gameAttributes', 'credentials'])
                ->find($id);
            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }
            $sku = $product->skuy;
            // Nếu attributes là JSON string, decode nó
            $attrs = $request->input('attributes');
            if (is_string($attrs)) {
                $attrs = json_decode($attrs, true);
                $request->merge(['attributes' => $attrs]);
            }

            // Validate dữ liệu
            $rules = [
                'category_id'                 => 'required|integer|exists:categories,id',
                // 'sku'                      => 'required|string|unique:products,sku',
                'import_price'                => 'required|numeric|min:0',
                // 'price'                       => 'required|numeric|min:0',
                // 'sale'                        => 'nullable|numeric|min:0',
                'username'                    => 'required|string',
                'password'                    => 'required|string',
                'attributes'                  => 'required|array',
                'attributes.*.attribute_key'  => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images'                      => 'nullable|array',
                'images.*'                    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
                'description'                 => 'nullable|string',
            ];
            $messages = [
                'category_id.required' => 'Vui lòng chọn danh mục.',
                'category_id.integer'  => 'Danh mục không hợp lệ.',
                'category_id.exists'   => 'Danh mục đã chọn không tồn tại.',

                // 'sku.required'        => 'Vui lòng nhập SKU.',
                // 'sku.string'          => 'SKU phải là chuỗi ký tự.',
                // 'sku.unique'          => 'SKU này đã tồn tại.',

                'import_price.required' => 'Giá nhập bắt buộc.',
                'import_price.numeric'  => 'Giá nhập phải là số.',
                'import_price.min'      => 'Giá nhập không được âm.',

                'price.required' => 'Giá bán bắt buộc.',
                'price.numeric'  => 'Giá bán phải là số.',
                'price.min'      => 'Giá bán không được âm.',

                'sale.numeric' => 'Giảm giá phải là số.',
                'sale.min'     => 'Giảm giá không được âm.',

                'username.required' => 'Vui lòng nhập username.',
                'username.string'   => 'Username phải là chuỗi ký tự.',

                'password.required' => 'Vui lòng nhập mật khẩu.',
                'password.string'   => 'Mật khẩu phải là chuỗi ký tự.',

                'attributes.required'                 => 'Bạn phải nhập ít nhất một thuộc tính.',
                'attributes.array'                    => 'Thuộc tính phải ở dạng mảng.',
                'attributes.*.attribute_key.required' => 'Thiếu tên thuộc tính.',
                'attributes.*.attribute_key.string'   => 'Tên thuộc tính phải là chuỗi.',
                'attributes.*.attribute_value.required' => 'Thiếu giá trị thuộc tính.',
                'attributes.*.attribute_value.string'   => 'Giá trị thuộc tính phải là chuỗi.',

                'images.required' => 'Bạn phải tải lên ít nhất một ảnh.',
                'images.array'    => 'Danh sách ảnh phải là mảng.',
                'images.*.image'  => 'Tệp tải lên phải là hình ảnh.',
                'images.*.mimes'  => 'Ảnh phải có định dạng: jpeg, png, jpg, gif hoặc svg.',
                'images.*.max'    => 'Ảnh không được lớn hơn 10MB.',

                'description.string' => 'Mô tả phải là chuỗi ký tự.',
            ];
            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                // Trả về JSON (API)
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(), // message đầu tiên
                    // 'errors'  => $validator->errors(),          // toàn bộ lỗi theo field
                ], 422);
            }
            $validated = $validator->validated();
            // if (isset($validated['sale']) && $validated['sale'] == 0) {
            //     $validated['sale'] = null;
            // }

            if ($product->status === 1 ) {
                if ($request->import_price !== $product->import_price) {
                    return response()->json([
                        "status"=>False,
                        "message"=>"Bạn không thể sửa giá bán"
                    ],422);
                }
            } elseif ($product->status === 4) {
                return response()->json([
                    "status"=>False,
                    "message"=>"Sản phẩm đã được bán"
                ],422);
            }

            // if (isset($validated['import_price']) && $product->status !== 1 && $product->status !== 4) {

            // } else {
            //     return response()->json([
            //         "status"=>False,
            //         "message"=>"Không được sửa giá muốn bán nữa"
            //     ]);
            // }



            // Kiểm tra sale < price
            // if (
            //     isset($validated['sale'], $validated['price']) &&
            //     $validated['sale'] >= $validated['price']
            // ) {
            //     return response()->json([
            //         'status' => false,
            //         'message' => 'Giá sale phải nhỏ hơn giá gốc',
            //     ], 400);
            // }

            DB::beginTransaction();

            // Cập nhật fields cơ bản
            $product->update([
                'category_id' => $validated['category_id'] ?? $product->category_id,
                "import_price" => $validated['import_price'],
                 "description"=>$validated['description'] ?? null,
                // 'price' => $validated['price'] ?? $product->price,
                // 'sale' => $validated['sale'] ?? $product->sale,
                'updated_by' => $request->user_id,
                "status" => 2, // Mặc định là 2 (chờ duyệt)
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
                    if (!in_array($img->image_url, $keepList, true)) {
                        // Chuyển URL public về đường dẫn relative: "product_images/uuid.jpg"
                        $relative = ltrim(parse_url($img->image_url, PHP_URL_PATH), '/storage/');
                        // $this->deleteFile($relative);
                        $delete_images[] = $relative;
                        $img->delete();
                    }
                }
                $this->deleteFiles($delete_images);

                // 2) Nếu có file mới, upload rồi lưu vào DB
                if ($request->hasFile('images')) {
                    // foreach ($request->file('images') as $file) {
                    //     $url = $this->uploadFile($file, 'product_images');
                    //     if (is_null($url)) {
                    //         DB::rollBack();
                    //         return response()->json([
                    //             'status' => false,
                    //             'message' => 'Upload ảnh thất bại',
                    //         ], 500);
                    //     }
                    //     ProductImage::create([
                    //         'product_id' => $product->id,
                    //         'alt_text' => $file->getClientOriginalName(),
                    //         'image_url' => $url,
                    //     ]);
                    // }
                    $images = $request->file('images');
                    $response = $this->uploadFiles($images,"product_images/".$product->sku);
                    foreach ($response as $image){
                        if (is_null($image['url'])){
                            DB::rollBack();
                            return response()->json(['message' => $image['messsage'],'status'=>False], 500);
                        }
                        ProductImage::create([
                            "product_id"=>$product->id,
                            "alt_text"=>$image['filename'],
                            "image_url"=>$image['url']
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
                        'product_id' => $product->id,
                        'attribute_key' => $attr['attribute_key'],
                        'attribute_value' => $attr['attribute_value'],
                    ]);
                }
            }
            $frontend_link = env("FRONTEND_URL");
            $this->sendNotification(1,"Sản phẩm {$sku} đang chờ duyệt","{$frontend_link}/admin/pendingProducts/{$product->id}",null,'products.view');
            
            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật sản phẩm thành công',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đã có lỗi xảy ra',
            ], 500);
        }
    }

    private function generate_sku($length = 20)
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, strlen($characters) - 1)];
        }
        return $code;
    }

    private function generateUniqueSku($length = 8, $maxTries = 100)
    {
        $tries = 0;
        do {
            $sku = $this->generate_sku($length);
            $tries++;
            if ($tries >= $maxTries) {
                throw new \Exception('Không thể tạo SKU duy nhất sau ' . $maxTries . ' lần thử');
            }
        } while (Product::where('sku', $sku)->exists());

        return $sku;
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
            $rules = [
                'category_id'                 => 'required|integer|exists:categories,id',
                // 'sku'                      => 'required|string|unique:products,sku',
                'import_price'                => 'required|numeric|min:0',
                // 'price'                       => 'required|numeric|min:0',
                // 'sale'                        => 'nullable|numeric|min:0',
                'username'                    => 'required|string',
                'password'                    => 'required|string',
                'attributes'                  => 'required|array',
                'attributes.*.attribute_key'  => 'required|string',
                'attributes.*.attribute_value' => 'required|string',
                'images'                      => 'required|array',
                'images.*'                    => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
                'description'                 => 'nullable|string',
            ];
            $messages = [
                'category_id.required' => 'Vui lòng chọn danh mục.',
                'category_id.integer'  => 'Danh mục không hợp lệ.',
                'category_id.exists'   => 'Danh mục đã chọn không tồn tại.',

                // 'sku.required'        => 'Vui lòng nhập SKU.',
                // 'sku.string'          => 'SKU phải là chuỗi ký tự.',
                // 'sku.unique'          => 'SKU này đã tồn tại.',

                'import_price.required' => 'Giá nhập bắt buộc.',
                'import_price.numeric'  => 'Giá nhập phải là số.',
                'import_price.min'      => 'Giá nhập không được âm.',

                'price.required' => 'Giá bán bắt buộc.',
                'price.numeric'  => 'Giá bán phải là số.',
                'price.min'      => 'Giá bán không được âm.',

                'sale.numeric' => 'Giảm giá phải là số.',
                'sale.min'     => 'Giảm giá không được âm.',

                'username.required' => 'Vui lòng nhập username.',
                'username.string'   => 'Username phải là chuỗi ký tự.',

                'password.required' => 'Vui lòng nhập mật khẩu.',
                'password.string'   => 'Mật khẩu phải là chuỗi ký tự.',

                'attributes.required'                 => 'Bạn phải nhập ít nhất một thuộc tính.',
                'attributes.array'                    => 'Thuộc tính phải ở dạng mảng.',
                'attributes.*.attribute_key.required' => 'Thiếu tên thuộc tính.',
                'attributes.*.attribute_key.string'   => 'Tên thuộc tính phải là chuỗi.',
                'attributes.*.attribute_value.required' => 'Thiếu giá trị thuộc tính.',
                'attributes.*.attribute_value.string'   => 'Giá trị thuộc tính phải là chuỗi.',

                'images.required' => 'Bạn phải tải lên ít nhất một ảnh.',
                'images.array'    => 'Danh sách ảnh phải là mảng.',
                'images.*.image'  => 'Tệp tải lên phải là hình ảnh.',
                'images.*.mimes'  => 'Ảnh phải có định dạng: jpeg, png, jpg, gif hoặc svg.',
                'images.*.max'    => 'Ảnh không được lớn hơn 10MB.',

                'description.string' => 'Mô tả phải là chuỗi ký tự.',
            ];
            $validator = Validator::make($request->all(), $rules, $messages);
            if ($validator->fails()) {
                // Trả về JSON (API)
                return response()->json([
                    'status'  => false,
                    'message' => $validator->errors()->first(), // message đầu tiên
                    // 'errors'  => $validator->errors(),          // toàn bộ lỗi theo field
                ], 422);
            }
            $validatedData = $validator->validated();     
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
                "description"=>$validatedData['description']??null,
                "price"=>0,
                "import_price" => $validatedData['import_price'], 
                "web_id" => $request->web_id,
                'status' => 2,
                "created_by" => $request->user_id,
                "updated_by" => $request->user_id,
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
            $response = $this->uploadFiles($images,'product_images/'.$sku);
            foreach ($response as $image){
                
                if (is_null($image['url'])){
                    DB::rollBack();
                    return response()->json(['message' => 'Failed to upload product image.'], 500);
                }

                ProductImage::create([
                    'product_id'=>$product->id,
                    "alt_text"=>$image['filename'],
                    "image_url"=>$image['url']
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
            $frontend_link = env("FRONTEND_URL");
            $this->sendNotification(1,"Sản phẩm {$sku} đang chờ duyệt","{$frontend_link}/admin/pendingProducts/{$product->id}",null,'products.view');
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
    private function check_isset_product_by_id($id)
    {
        return Product::where("id", $id)->exists();
    }

    public function cancel(Request $request, $id)
    {
        try {
            $product = Product::where("id", $id)
                ->where("created_by", $request->user_id)
                ->first();
            if (!$product) {
                return response()->json([
                    "status" => False,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }
            if (in_array($product->status, [1, 4])) {
                return response()->json([
                    "status" => false,
                    "message" => "Sản phẩm đang được giao bán hoặc đã bán, không thể hủy bán!",
                ], 400);
            }
            if (in_array($product->status, [2, 3])) {
                $updated = Product::where("id", $id)
                    ->where("created_by", $request->user_id)
                    ->whereIn("status", [2, 3])
                    ->update([
                        "status" => 3
                    ]);
                if ($updated) {
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
            }
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }

    public function accept(Request $request, $id)
    {
        try {
            $request->validate([
                'password' => 'required|string|min:6'
            ]);

            $password = $request->password;

            if (!$this->check_isset_product_by_id($id)) {
                return response()->json([
                    "status" => false,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }

            DB::beginTransaction();

            $product = Product::where("id", $id)
                ->where("created_by", $request->user_id)
                ->where("status", 2)
                ->update([
                    "status" => 1
                ]);

            if ($product) {
                ProductCredential::where("product_id", $id)->update([
                    "password" => $password
                ]);

                DB::commit();

                return response()->json([
                    "status" => true,
                    "message" => "Chấp nhận bán sản phẩm thành công",
                ]);
            } else {
                DB::rollBack();
                return response()->json([
                    "status" => false,
                    "message" => "Không thể chấp nhận bán sản phẩm",
                ], 400);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Dữ liệu không hợp lệ",
                "errors" => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status" => False,
                'message' => "Đã có lỗi xảy ra",
            ], 500);
        }
    }
    public function restore(Request $request, $id)
    {
        try {
            $product = Product::where("id", $id)
                ->where("created_by", $request->user_id)
                ->first();
            if (!$product) {
                return response()->json([
                    "status" => False,
                    "message" => "Sản phẩm không tồn tại",
                ], 404);
            }
            if (in_array($product->status, [1, 4])) {
                return response()->json([
                    "status" => false,
                    "message" => "Sản phẩm đang được giao bán hoặc đã bán, không thể khôi phục!",
                ], 400);
            }
            if ($product->status === 3) {
                $updated = Product::where("id", $id)
                    ->where("created_by", $request->user_id)
                    ->where("status", 3)
                    ->update([
                        "status" => 2
                    ]);
                if ($updated) {
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
                $product = Product::where("id", $id)
                    ->where("created_by", $request->user_id)
                    ->where("status", 2)
                    ->update([
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
