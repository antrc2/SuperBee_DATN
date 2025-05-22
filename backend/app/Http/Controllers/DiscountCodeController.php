<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DiscountCode;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class DiscountCodeController extends Controller
{
    // GET /discount_codes
    public function index(Request $request)
    {
        try {
            $query = DiscountCode::orderBy('created_at', 'desc');

            // Xử lý phân trang
            $limit = $request->query('limit', 10);
            $offset = $request->query('offset', 0);

            $total = $query->count();
            $codes = $query->skip($offset)->take($limit)->get();

            return response()->json([
                'message' => 'Lấy danh sách mã giảm giá thành công',
                'status' => true,
                'data' => [
                    'codes' => $codes,
                    'total' => $total,
                    'limit' => (int) $limit,
                    'offset' => (int) $offset
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }

    }

    // GET /discount_codes/{id}
    public function show($id)

    {
        try {
            $code = DiscountCode::find($id);

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

    // POST /discount_codes
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string',
                'usage_limit' => 'nullable|integer',
                'discount_amount' => 'required|integer|min:0',
                'min_discount_amount' => 'required|integer|min:0',
                'max_discount_amount' => 'required|integer|min:0|gt:min_discount_amount',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'user_id' => 'required|exists:users,id',
                'web_id' => 'required|exists:webs,id',
            ], [
                'max_discount_amount.gt' => 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Gán mặc định nếu thiếu usage_limit
            if (!isset($validated['usage_limit'])) {
                $validated['usage_limit'] = -1;
            } elseif ($validated['usage_limit'] < 1 && $validated['usage_limit'] != -1) {
                $validated['usage_limit'] = 1;
            }

            // Gán used_count ban đầu = 0
            $validated['used_count'] = 0;

            // created_by và updated_by lấy từ user_id (truyền trong request)
            $validated['created_by'] = $request->user_id;
            $validated['updated_by'] = $request->user_id;

            DB::beginTransaction();
            $code = DiscountCode::create($validated);
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
            $code = DiscountCode::find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:discount_codes,code,' . $id,
                'usage_limit' => 'nullable|integer',
                'discount_amount' => 'required|integer|min:0',
                'min_discount_amount' => 'nullable|integer|min:0',
                'max_discount_amount' => 'nullable|integer|min:0|gt:min_discount_amount',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'user_id' => 'nullable|exists:users,id',
                'web_id' => 'nullable|exists:webs,id',
            ], [
                'max_discount_amount.gt' => 'Giá trị tối đa phải lớn hơn giá trị tối thiểu',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Xử lý usage_limit
            if (!isset($validated['usage_limit'])) {
                $validated['usage_limit'] = -1;
            } elseif ($validated['usage_limit'] < 1 && $validated['usage_limit'] != -1) {
                $validated['usage_limit'] = 1;
            }

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
            $code = DiscountCode::onlyTrashed()->find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá đã bị xóa',
                    'status' => false
                ], 404);
            }

            // Chỉ cho phép cập nhật status = active (gỡ soft delete)
            $request->validate([
                'status' => 'required|in:active'
            ]);

            $code->restore(); // Gỡ deleted_at

            $code->update([
                'status' => $request->status,
                'updated_by' => Auth::id()
            ]);

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
    public function destroy($id)
    {
        try {
            $code = DiscountCode::find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            DB::beginTransaction();

            // Kiểm tra xem mã đã được sử dụng chưa
            if ($code->used_count > 0) {
                // Nếu đã sử dụng, thực hiện soft delete
                $code->delete(); // Soft delete (cần đảm bảo model đã setup SoftDeletes)
                $message = 'Xóa mềm mã giảm giá thành công (mã đã được sử dụng)';
            } else {
                // Nếu chưa sử dụng, thực hiện hard delete
                $code->forceDelete(); // Hard delete
                $message = 'Xóa mã giảm giá thành công';
            }

            DB::commit();

            return response()->json([
                'message' => $message,
                'status' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi xóa mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }

    // Phương thức kiểm tra mã giảm giá có hợp lệ hay không
    public function validateCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string',
                'user_id' => 'nullable|exists:users,id',
                'web_id' => 'nullable|exists:webs,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $code = DiscountCode::where('code', $request->code)
                ->where(function ($query) use ($request) {
                    $query->whereNull('user_id')
                        ->orWhere('user_id', $request->user_id);
                })
                ->where(function ($query) use ($request) {
                    $query->whereNull('web_id')
                        ->orWhere('web_id', $request->web_id);
                })
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where(function ($query) {
                    $query->where(function ($q) {
                        $q->where('usage_limit', '>', DB::raw('used_count'))
                            ->where('usage_limit', '>', 0);
                    })->orWhere('usage_limit', -1);
                })
                ->first();

            if (!$code) {
                return response()->json([
                    'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn',
                    'status' => false
                ], 404);
            }

            return response()->json([
                'message' => 'Mã giảm giá hợp lệ',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi kiểm tra mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }

    // Phương thức sử dụng mã giảm giá
    public function useDiscountCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string',
                'user_id' => 'nullable|exists:users,id',
                'web_id' => 'nullable|exists:webs,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $code = DiscountCode::where('code', $request->code)
                ->where(function ($query) use ($request) {
                    $query->whereNull('user_id')
                        ->orWhere('user_id', $request->user_id);
                })
                ->where(function ($query) use ($request) {
                    $query->whereNull('web_id')
                        ->orWhere('web_id', $request->web_id);
                })
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where(function ($query) {
                    $query->where(function ($q) {
                        $q->where('usage_limit', '>', DB::raw('used_count'))
                            ->where('usage_limit', '>', 0);
                    })->orWhere('usage_limit', -1);
                })
                ->lockForUpdate()
                ->first();

            if (!$code) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn',
                    'status' => false
                ], 404);
            }

            // Tăng số lần sử dụng
            $code->used_count += 1;
            $code->save();

            DB::commit();

            return response()->json([
                'message' => 'Sử dụng mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi sử dụng mã giảm giá: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }

    }
}