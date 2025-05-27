<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductDetail;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Hiển thị danh sách sản phẩm
     */
    public function index(Request $request)
    {
        try {
            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;
            $web_id = $request->web_id;

            $query = Product::with(['productDetails', 'productImages']);

            if ($role == 1) { // User
                $query->where('web_id', $web_id)->where('status', 1);
            } elseif ($role == 2) { // Partner
                $query->where('created_by', $user->id);
            } elseif ($role == 3) { // Reseller
                $query->where('web_id', $web_id);
            } elseif ($role == 4) { // Admin
                // Xem tất cả sản phẩm
            } else {
                return response()->json([
                    "status" => false,
                    "message" => "Vai trò không hợp lệ"
                ], 403);
            }

            $products = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách sản phẩm thành công",
                "data" => $products
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Tạo sản phẩm mới
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id', // Bổ sung validate user_id
                'category_id' => 'required|exists:categories,id',
                'username' => 'required|string',
                'password' => 'required|string',
                'web_id' => 'required|integer|exists:webs,id',
                'price' => 'required|integer|min:0',
                'image_urls' => 'nullable|array',
                'image_urls.*' => 'url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "status" => false,
                    "message" => "Dữ liệu không hợp lệ",
                    "errors" => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;

            if ($role == 1) {
                return response()->json([
                    "status" => false,
                    "message" => "Người dùng thường không được phép tạo sản phẩm"
                ], 403);
            }

            $status = $this->determineStatus($role, $request->web_id, $user);

            DB::beginTransaction();

            $product = Product::create([
                'category_id' => $request->category_id,
                'username' => $request->username,
                'password' => $request->password,
                'web_id' => $request->web_id,
                'status' => $status,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            ProductDetail::create([
                'product_id' => $product->id,
                'price' => $request->price,
                'web_id' => $request->web_id,
            ]);

            if ($request->has('image_urls')) {
                foreach ($request->image_urls as $url) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $url,
                    ]);
                }
            }

            DB::commit();

            $product->load(['productDetails', 'productImages']);

            return response()->json([
                "status" => true,
                "message" => "Tạo sản phẩm thành công",
                "data" => $product
            ], 201);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy người dùng"
            ], 404);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage(), // Gỡ ra khi chạy production
            ], 500);
        }
    }


    /**
     * Cập nhật sản phẩm
     */
    public function update(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $user = User::findOrFail($request->user_id);

            if ($product->created_by != $user->id) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn chỉ có thể sửa sản phẩm của mình"
                ], 403);
            }

            if ($product->status == 4) {
                return response()->json([
                    "status" => false,
                    "message" => "Không thể sửa sản phẩm đã bán"
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'category_id' => 'sometimes|exists:categories,id',
                'username' => 'sometimes|string',
                'password' => 'sometimes|string',
                'price' => 'sometimes|integer|min:0',
                'image_urls' => 'sometimes|array',
                'image_urls.*' => 'url'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "status" => false,
                    "message" => "Dữ liệu không hợp lệ",
                    "errors" => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Cập nhật thông tin cơ bản
            $product->fill($request->only(['category_id', 'username', 'password']));
            $product->status = $this->determineStatus($user->role_id, $product->web_id, $user);
            $product->updated_by = $user->id;
            $product->save();

            // Cập nhật giá
            if ($request->has('price')) {
                $productDetail = ProductDetail::where('product_id', $product->id)->first();
                if ($productDetail) {
                    $productDetail->update(['price' => $request->price]);
                } else {
                    ProductDetail::create([
                        'product_id' => $product->id,
                        'price' => $request->price,
                        'web_id' => $product->web_id
                    ]);
                }
            }

            // Cập nhật hình ảnh
            if ($request->has('image_urls')) {
                ProductImage::where('product_id', $product->id)->delete();
                foreach ($request->image_urls as $url) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $url
                    ]);
                }
            }

            DB::commit();

            $product->load(['productDetails', 'productImages']);

            return response()->json([
                "status" => true,
                "message" => "Cập nhật sản phẩm thành công",
                "data" => $product
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng"
            ], 404);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage() // Gợi ý thêm để debug dễ hơn
            ], 500);
        }
    }

    /**
     * Xóa sản phẩm (cập nhật status = 3 - hủy mềm)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;

            // Admin hoặc chính chủ mới được xóa
            if ($role != 4 && $product->created_by != $user->id) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không có quyền xóa sản phẩm này"
                ], 403);
            }

            // Không cho xóa sản phẩm đã bán
            if ($product->status == 4) {
                return response()->json([
                    "status" => false,
                    "message" => "Không thể xóa sản phẩm đã bán"
                ], 403);
            }

            $product->status = 3; // Coi như xoá mềm
            $product->updated_by = $user->id;
            $product->save();

            return response()->json([
                "status" => true,
                "message" => "Xóa sản phẩm thành công (status = 3)"
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy sản phẩm (chuyển status = 3)
     */
    public function cancel(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $user = User::findOrFail($request->user_id);

            if ($product->created_by != $user->id) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn chỉ có thể hủy sản phẩm của mình"
                ], 403);
            }

            if ($product->status == 4) {
                return response()->json([
                    "status" => false,
                    "message" => "Không thể hủy sản phẩm đã bán"
                ], 403);
            }

            $product->status = 3; // Đã hủy
            $product->updated_by = $user->id;
            $product->save();

            return response()->json([
                "status" => true,
                "message" => "Hủy sản phẩm thành công"
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Duyệt sản phẩm (chuyển status = 1)
     */
    public function approve(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;

            if ($product->status != 2) {
                return response()->json([
                    "status" => false,
                    "message" => "Sản phẩm không ở trạng thái đợi duyệt"
                ], 400);
            }

            if ($product->web_id == 1) { // Web mẹ
                if ($role != 4) { // Chỉ admin
                    return response()->json([
                        "status" => false,
                        "message" => "Chỉ admin mới có thể duyệt trên web mẹ"
                    ], 403);
                }
            } else { // Web con
                if ($role != 3 || $user->web_id != $product->web_id) {
                    return response()->json([
                        "status" => false,
                        "message" => "Chỉ người bán của web này mới có thể duyệt"
                    ], 403);
                }
            }

            $product->status = 1; // Đang bán
            $product->updated_by = $user->id;
            $product->save();

            return response()->json([
                "status" => true,
                "message" => "Duyệt sản phẩm thành công"
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Từ chối sản phẩm (chuyển status = 0)
     */
    public function reject(Request $request, $id)
    {
        try {
            $product = Product::findOrFail($id);
            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;

            if ($product->web_id == 1) { // Web mẹ
                if ($role != 4) { // Chỉ admin
                    return response()->json([
                        "status" => false,
                        "message" => "Chỉ admin mới có thể từ chối trên web mẹ"
                    ], 403);
                }
            } else { // Web con
                if ($role != 3 || $user->web_id != $product->web_id) {
                    return response()->json([
                        "status" => false,
                        "message" => "Chỉ reseller của web này mới có thể từ chối"
                    ], 403);
                }
            }

            $product->status = 0; // Bị từ chối
            $product->updated_by = $user->id;
            $product->save();

            return response()->json([
                "status" => true,
                "message" => "Từ chối sản phẩm thành công"
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Xác định trạng thái sản phẩm khi thêm/sửa
     */
    private function determineStatus($role, $web_id, $user)
    {
        if ($role == 2) { // Partner
            return 2; // Đợi duyệt
        } elseif ($role == 3) { // Reseller
            return ($web_id == $user->web_id) ? 1 : 2; // 1 nếu trên web của mình, 2 nếu trên web mẹ
        } elseif ($role == 4) { // Admin
            return 1; // Đang bán
        }
        return 2; // Mặc định đợi duyệt
    }
}
