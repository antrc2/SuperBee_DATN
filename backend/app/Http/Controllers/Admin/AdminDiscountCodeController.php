<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\User;
use App\Models\Web;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AdminDiscountCodeController extends Controller
{
    // GET /discount_codes
    public function index(Request $request)
    {
        try {
            // $query = DiscountCode::orderBy('created_at', 'desc');
            $codes = Promotion::withCount(['orders'])->orderBy('created_at', 'desc')->get();
            if ($codes->count() == 0) {
                return response()->json([
                    'message' => 'Không có mã giảm giá nào',
                    'status' => true,
                    'data' => []
                ]);
            }
            return response()->json([
                'message' => 'Lấy danh sách mã giảm giá thành công',
                'status' => true,
                'data' => $codes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã có lỗi xảy ra',
                'status' => false,
                'error' => $e->getMessage(),  // Thêm dòng này để xem lỗi thật
            ], 500);
        }
    }

    // GET /discount_codes/{id}
    public function show($id)

    {
        try {
            $code = Promotion::with("user.web")->find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            return response()->json([
                'message' => 'Lấy chi tiết mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy chi tiết mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            // 1. Validate input
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:promotions,code',
                'discount_value' => 'required|integer|min:0',
                'min_discount_amount' => 'nullable|integer|min:0',
                'max_discount_amount' => 'nullable|integer|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'usage_limit' => 'nullable|integer|min:-1|not_in:0',
                'per_user_limit' => 'nullable|integer|min:-1|not_in:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // 2. Lấy dữ liệu đã validate
            $validated = $validator->validated();

            // 3. Kiểm tra nếu cả hai giá trị giảm đều tồn tại thì max phải > min
            if (
                isset($validated['min_discount_amount'], $validated['max_discount_amount']) &&
                $validated['max_discount_amount'] <= $validated['min_discount_amount']
            ) {
                return response()->json([
                    'message' => 'Giá trị giảm tối đa phải lớn hơn giá trị tối thiểu',
                    'status' => false,
                ], 422);
            }

            // 4. Gán mặc định nếu thiếu
            $validated['min_discount_amount'] = $validated['min_discount_amount'] ?? null;
            $validated['max_discount_amount'] = $validated['max_discount_amount'] ?? null;
            $validated['usage_limit'] = $validated['usage_limit'] ?? -1;
            $validated['per_user_limit'] = $validated['per_user_limit'] ?? -1;
            $validated['total_used'] = 0;

            // 5. Gán người tạo nếu có đăng nhập
            if (Auth::check()) {
                $validated['created_by'] = Auth::id();
                $validated['updated_by'] = Auth::id();
            } else {
                $validated['created_by'] = $request->user_id;
                $validated['updated_by'] = $request->user_id;
            }

            // 6. Lưu dữ liệu
            DB::beginTransaction();
            $code = Promotion::create($validated);
            DB::commit();

            return response()->json([
                'message' => 'Tạo mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'status' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi tạo mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }



    // PUT /discount_codes/{id} (Cập nhật toàn bộ)
    public function update(Request $request, $id)
    {
        try {
            $code = Promotion::find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:promotions,code,' . $id,
                'usage_limit' => 'nullable|integer|min:-1', // Cho phép -1 (không giới hạn) hoặc >=1
                'per_user_limit' => 'nullable|integer|min:-1', // Cho phép -1 (không giới hạn) hoặc >=1
                'discount_value' => 'required|integer|min:0',
                'min_discount_amount' => 'nullable|integer|min:0',
                'max_discount_amount' => 'nullable|integer|min:0|gt:min_discount_amount',
                'start_date' => 'required|date',
                "status" => 'required|in:0,1', // Thêm kiểm tra trạng thái
                'end_date' => 'required|date|after_or_equal:start_date',
            ], [
                'max_discount_amount.gt' => 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
                'usage_limit' => 'nullable|integer|min:-1|not_in:0',
                'per_user_limit' => 'nullable|integer|min:-1|not_in:0',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();
            // Lấy user_id từ người dùng đăng nhập nếu có
            if (Auth::check()) {
                $validated['updated_by'] = Auth::id();
            } else {
                // Hoặc lấy từ request nếu được cung cấp
                $validated['updated_by'] = $request->user_id;
            }

            DB::beginTransaction();
            $code->update($validated);
            DB::commit();

            return response()->json([
                'message' => 'Cập nhật mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'status' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi cập nhật mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }

    // PATCH /discount_codes/{id} (Cập nhật một phần)
    public function patch(Request $request, $id)
    {
        try {
            $code = Promotion::find($id);

            if (!$code || $code->status == 1) {
                return response()->json([
                    'message' => 'Không tìm thấy mã hoặc mã đã hoạt động',
                    'status' => false
                ], 404);
            }

            $code->status = 1;
            $code->updated_by = Auth::id();
            $code->save();

            return response()->json([
                'message' => 'Khôi phục mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi hệ thống: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }



    // DELETE /discount_codes/{id}
    public function destroy(Request $request, $id)
    {
        try {
            $code = Promotion::find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            // Kiểm tra mã đã được dùng trong đơn hàng
            $order_code = Order::where('promo_code', $code->code)->first();

            if ($order_code) {
                // Đã sử dụng → không xoá, chỉ đổi trạng thái
                $code->status = 0;
                $code->save();

                return response()->json([
                    'message' => 'Mã giảm giá đã được sử dụng nên chỉ bị vô hiệu hoá (status = 0)',
                    'status' => true,
                    'data' => $code
                ], 200);
            } else {
                // Chưa dùng → xoá hẳn
                DB::beginTransaction();
                $code->forceDelete(); // Hard delete
                DB::commit();

                return response()->json([
                    'message' => 'Xóa mã giảm giá thành công',
                    'status' => true
                ], 200);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi xóa mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }
}
