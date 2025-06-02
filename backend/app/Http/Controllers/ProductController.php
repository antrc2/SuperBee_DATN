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
    // public function publicList(Request $request)
    // {
    //     try {
    //         $products = Product::with(['productDetails', 'productImages'])
    //             ->where('status', 1)
    //             ->when($request->has('web_id'), function ($query) use ($request) {
    //                 $query->where('web_id', $request->web_id);
    //             })
    //             ->orderBy('created_at', 'desc')
    //             ->get();

    //         return response()->json([
    //             "status" => true,
    //             "message" => "Danh sách sản phẩm công khai",
    //             "data" => $products
    //         ]);
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             "status" => false,
    //             "message" => "Đã có lỗi xảy ra",
    //             "error" => $th->getMessage()
    //         ], 500);
    //     }
    // }

    // public function partnerList(Request $request)
    // {
    //     try {
    //         $user = User::findOrFail($request->user_id);

    //         if ($user->role_id != 2) {
    //             return response()->json([
    //                 "status" => false,
    //                 "message" => "Chỉ cộng tác viên mới được phép xem"
    //             ], 403);
    //         }

    //         $products = Product::with(['productDetails', 'productImages'])
    //             ->where('created_by', $user->id)
    //             ->orderBy('created_at', 'desc')
    //             ->get();

    //         return response()->json([
    //             "status" => true,
    //             "message" => "Danh sách sản phẩm của cộng tác viên",
    //             "data" => $products
    //         ]);
    //     } catch (ModelNotFoundException $e) {
    //         return response()->json([
    //             "status" => false,
    //             "message" => "Không tìm thấy người dùng"
    //         ], 404);
    //     } catch (\Throwable $th) {
    //         return response()->json([
    //             "status" => false,
    //             "message" => "Đã có lỗi xảy ra",
    //             "error" => $th->getMessage()
    //         ], 500);
    //     }
    // }


        /**
     * Hiển thị danh sách sản phẩm công khai
     * GET /products/
     * - User chưa đăng nhập: xem sản phẩm công khai của web cụ thể
     * - Admin muốn xem danh sách sản phẩm của web: truyền web_id
     */
    public function publicList(Request $request)
    {
        try {
            // Validate web_id nếu có
            if ($request->has('web_id')) {
                $validator = Validator::make($request->all(), [
                    'web_id' => 'required|integer|exists:webs,id'
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        "status" => false,
                        "message" => "Web ID không hợp lệ",
                        "errors" => $validator->errors()
                    ], 422);
                }
            }

            $query = Product::with(['productDetails', 'productImages'])
                ->where('status', 1); // Chỉ lấy sản phẩm đang bán

            // Nếu có web_id thì lọc theo web
            if ($request->has('web_id')) {
                $query->where('web_id', $request->web_id);
            }

            $products = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                "status" => true,
                "message" => "Danh sách sản phẩm công khai",
                "data" => $products,
                "total" => $products->count()
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Hiển thị danh sách sản phẩm của cộng tác viên
     * GET /products/partner
     * - Partner chỉ xem được sản phẩm do mình tạo
     */
    public function partnerList(Request $request)
    {
        try {
            // Validate user_id
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "status" => false,
                    "message" => "Dữ liệu không hợp lệ",
                    "errors" => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($request->user_id);

            // Kiểm tra role
            if ($user->role_id != 2) {
                return response()->json([
                    "status" => false,
                    "message" => "Chỉ cộng tác viên mới được phép xem"
                ], 403);
            }

            // Lấy tất cả sản phẩm do partner tạo (bao gồm cả các trạng thái khác nhau)
            $products = Product::with(['productDetails', 'productImages'])
                ->where('created_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Thống kê theo trạng thái
            $statusCount = [
                'total' => $products->count(),
                'approved' => $products->where('status', 1)->count(), // Đang bán
                'pending' => $products->where('status', 2)->count(),   // Đợi duyệt
                'rejected' => $products->where('status', 0)->count(),  // Bị từ chối
                'cancelled' => $products->where('status', 3)->count(), // Đã hủy
                'sold' => $products->where('status', 4)->count()       // Đã bán
            ];

            return response()->json([
                "status" => true,
                "message" => "Danh sách sản phẩm của cộng tác viên",
                "data" => $products,
                "statistics" => $statusCount
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy người dùng"
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
     * Hiển thị danh sách sản phẩm cho reseller
     * GET /products/reseller
     * - Reseller xem được tất cả sản phẩm thuộc web của mình
     */
    public function resellerList(Request $request)
    {
        try {
            // Validate user_id
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    "status" => false,
                    "message" => "Dữ liệu không hợp lệ",
                    "errors" => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($request->user_id);

            // Kiểm tra role
            if ($user->role_id != 3) {
                return response()->json([
                    "status" => false,
                    "message" => "Chỉ reseller mới được phép xem"
                ], 403);
            }

            // Lấy tất cả sản phẩm thuộc web của reseller
            $products = Product::with(['productDetails', 'productImages'])
                ->where('web_id', $user->web_id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Thống kê theo trạng thái
            $statusCount = [
                'total' => $products->count(),
                'approved' => $products->where('status', 1)->count(),
                'pending' => $products->where('status', 2)->count(),
                'rejected' => $products->where('status', 0)->count(),
                'cancelled' => $products->where('status', 3)->count(),
                'sold' => $products->where('status', 4)->count()
            ];

            return response()->json([
                "status" => true,
                "message" => "Danh sách sản phẩm của web " . $user->web_id,
                "data" => $products,
                "statistics" => $statusCount
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy người dùng"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage()
            ], 500);
        }
    }
    public function adminList(Request $request)
    {
        try {
            $user = User::findOrFail($request->user_id);

            if ($user->role_id != 4) {
                return response()->json([
                    "status" => false,
                    "message" => "Chỉ admin mới được phép xem toàn bộ sản phẩm"
                ], 403);
            }

            $products = Product::with(['productDetails', 'productImages'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                "status" => true,
                "message" => "Danh sách sản phẩm cho admin",
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
                "message" => "Đã có lỗi xảy ra",
                "error" => $th->getMessage()
            ], 500);
        }
    }
    /**
     * Xem chi tiết sản phẩm
     */

    public function show(Request $request, $id)
    {
        try {
            $user = User::findOrFail($request->user_id);
            $role = $user->role_id;

            $product = Product::with(['productDetails', 'productImages'])->findOrFail($id);

            // Phân quyền xem chi tiết
            if ($role == 1) { // User
                if ($product->web_id != $request->web_id || $product->status != 1) {
                    return response()->json([
                        "status" => false,
                        "message" => "Bạn không có quyền xem sản phẩm này"
                    ], 403);
                }
            } elseif ($role == 2) { // Partner
                if ($product->created_by != $user->id) {
                    return response()->json([
                        "status" => false,
                        "message" => "Bạn chỉ được xem sản phẩm do mình tạo"
                    ], 403);
                }
            } elseif ($role == 3) { // Reseller
                if ($product->web_id != $request->web_id) {
                    return response()->json([
                        "status" => false,
                        "message" => "Bạn chỉ được xem sản phẩm thuộc web của bạn"
                    ], 403);
                }
            } elseif ($role == 4) {
                // Admin được xem tất cả
            } else {
                return response()->json([
                    "status" => false,
                    "message" => "Vai trò không hợp lệ"
                ], 403);
            }

            return response()->json([
                "status" => true,
                "message" => "Lấy thông tin sản phẩm thành công",
                "data" => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy sản phẩm hoặc người dùng1"
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
