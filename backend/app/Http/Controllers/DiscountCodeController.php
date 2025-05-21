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
                'code' => 'required|string|unique:discount_codes,code',
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

            // Tự set giá trị used_count = 0 khi tạo mới
            $validated['used_count'] = 0;

            // Xử lý usage_limit, nếu không có giá trị thì mặc định là -1 (không giới hạn)
            if (!isset($validated['usage_limit'])) {
                $validated['usage_limit'] = -1;
            } elseif ($validated['usage_limit'] < 1 && $validated['usage_limit'] != -1) {
                $validated['usage_limit'] = 1; // Đảm bảo nếu có giá trị thì tối thiểu là 1
            }

            // Lấy user_id từ người dùng đang đăng nhập nếu có
            if (Auth::check()) {
                $validated['created_by'] = Auth::id();
                $validated['updated_by'] = Auth::id();
            } else {
                // Hoặc lấy từ request nếu được cung cấp
                $validated['created_by'] = $request->user_id;
                $validated['updated_by'] = $request->user_id;
            }

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
            $code = DiscountCode::find($id);

            if (!$code) {
                return response()->json([
                    'message' => 'Không tìm thấy mã giảm giá',
                    'status' => false
                ], 404);
            }

            $rules = [];
            $data = $request->all();

            // Chỉ áp dụng validation cho các trường được gửi lên
            if (isset($data['code'])) {
                $rules['code'] = 'string|unique:discount_codes,code,' . $id;
            }

            if (isset($data['usage_limit'])) {
                $rules['usage_limit'] = 'nullable|integer';
            }

            if (isset($data['discount_amount'])) {
                $rules['discount_amount'] = 'integer|min:0';
            }

            if (isset($data['min_discount_amount'])) {
                $rules['min_discount_amount'] = 'nullable|integer|min:0';
            }

            if (isset($data['max_discount_amount'])) {
                $rules['max_discount_amount'] = 'nullable|integer|min:0';

                // Nếu có cả min và max hoặc nếu đã có min trong DB
                if (isset($data['min_discount_amount']) || $code->min_discount_amount) {
                    $min_value = isset($data['min_discount_amount']) ? $data['min_discount_amount'] : $code->min_discount_amount;
                    if ($min_value && isset($data['max_discount_amount']) && $data['max_discount_amount'] <= $min_value) {
                        return response()->json([
                            'message' => 'Dữ liệu không hợp lệ',
                            'status' => false,
                            'errors' => ['max_discount_amount' => ['Giá trị tối đa phải lớn hơn giá trị tối thiểu']]
                        ], 422);
                    }
                }
            }

            if (isset($data['start_date'])) {
                $rules['start_date'] = 'date';

                // Kiểm tra với end_date nếu có
                if (isset($data['end_date'])) {
                    $rules['end_date'] = 'date|after_or_equal:start_date';
                } elseif ($code->end_date) {
                    // Kiểm tra với end_date trong DB
                    $end_date = new \DateTime($code->end_date);
                    $start_date = new \DateTime($data['start_date']);

                    if ($start_date > $end_date) {
                        return response()->json([
                            'message' => 'Dữ liệu không hợp lệ',
                            'status' => false,
                            'errors' => ['start_date' => ['Ngày bắt đầu phải trước hoặc bằng ngày kết thúc']]
                        ], 422);
                    }
                }
            }

            if (isset($data['end_date'])) {
                $rules['end_date'] = 'date';

                // Kiểm tra với start_date
                $start_date_value = isset($data['start_date']) ? $data['start_date'] : $code->start_date;
                $start_date = new \DateTime($start_date_value);
                $end_date = new \DateTime($data['end_date']);

                if ($end_date < $start_date) {
                    return response()->json([
                        'message' => 'Dữ liệu không hợp lệ',
                        'status' => false,
                        'errors' => ['end_date' => ['Ngày kết thúc phải sau hoặc bằng ngày bắt đầu']]
                    ], 422);
                }
            }

            if (isset($data['user_id'])) {
                $rules['user_id'] = 'nullable|exists:users,id';
            }

            if (isset($data['web_id'])) {
                $rules['web_id'] = 'nullable|exists:webs,id';
            }

            $validator = Validator::make($data, $rules);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Xử lý usage_limit nếu được gửi lên
            if (isset($validated['usage_limit'])) {
                if ($validated['usage_limit'] === null) {
                    $validated['usage_limit'] = -1;
                } elseif ($validated['usage_limit'] < 1 && $validated['usage_limit'] != -1) {
                    $validated['usage_limit'] = 1;
                }
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
                'message' => 'Cập nhật một phần mã giảm giá thành công',
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