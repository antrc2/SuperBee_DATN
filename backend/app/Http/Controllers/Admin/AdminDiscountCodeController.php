<?php

namespace App\Http\Controllers\Admin;

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
                'message' => 'Đã có lỗi xảy ra.',
                'status' => false,
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
                'message' => 'Đã có lỗi xảy ra.',
                'status' => false
            ], 500);
        }
    }
    public function store(Request $request)
    {
        try {
            // 1. Validate input
            $rules = [
                'code'                  => 'required|string|unique:promotions,code',
                'description'           => 'nullable|string|max:255',
                'discount_value'        => 'required|integer|min:0',
                'min_discount_amount'   => 'nullable|integer|min:0',
                'max_discount_amount'   => 'nullable|integer|min:0',
                'start_date'            => 'required|date',
                'end_date'              => 'required|date|after_or_equal:start_date',
                'usage_limit'           => 'nullable|integer|min:-1|not_in:0',
                'per_user_limit'        => 'nullable|integer|min:-1|not_in:0',
                'target_user_id'        => 'required|integer',
            ];

            $messages = [
                'code.required'                 => 'Vui lòng nhập mã khuyến mãi.',
                'code.string'                   => 'Mã khuyến mãi phải là chuỗi ký tự.',
                'code.unique'                   => 'Mã khuyến mãi này đã tồn tại.',

                'description.string'            => 'Mô tả phải là chuỗi ký tự.',
                'description.max'               => 'Mô tả không được vượt quá 255 ký tự.',

                'discount_value.required'       => 'Vui lòng nhập giá trị giảm giá.',
                'discount_value.integer'        => 'Giá trị giảm giá phải là số nguyên.',
                'discount_value.min'            => 'Giá trị giảm giá phải lớn hơn hoặc bằng 0.',

                'min_discount_amount.integer'   => 'Số tiền giảm giá tối thiểu phải là số nguyên.',
                'min_discount_amount.min'       => 'Số tiền giảm giá tối thiểu phải lớn hơn hoặc bằng 0.',

                'max_discount_amount.integer'   => 'Số tiền giảm giá tối đa phải là số nguyên.',
                'max_discount_amount.min'       => 'Số tiền giảm giá tối đa phải lớn hơn hoặc bằng 0.',

                'start_date.required'           => 'Vui lòng chọn ngày bắt đầu.',
                'start_date.date'               => 'Ngày bắt đầu không đúng định dạng.',

                'end_date.required'             => 'Vui lòng chọn ngày kết thúc.',
                'end_date.date'                 => 'Ngày kết thúc không đúng định dạng.',
                'end_date.after_or_equal'       => 'Ngày kết thúc phải cùng hoặc sau ngày bắt đầu.',

                'usage_limit.integer'           => 'Giới hạn sử dụng phải là số nguyên.',
                'usage_limit.min'               => 'Giới hạn sử dụng phải lớn hơn hoặc bằng -1.',
                'usage_limit.not_in'            => 'Giới hạn sử dụng không được là 0.',

                'per_user_limit.integer'        => 'Giới hạn mỗi người dùng phải là số nguyên.',
                'per_user_limit.min'            => 'Giới hạn mỗi người dùng phải lớn hơn hoặc bằng -1.',
                'per_user_limit.not_in'         => 'Giới hạn mỗi người dùng không được là 0.',

                'target_user_id.required'       => 'Vui lòng chọn người dùng mục tiêu.',
                'target_user_id.integer'        => 'ID người dùng mục tiêu phải là số nguyên.',
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
            // $validatedData = $validator->validated();

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
            $validated['user_id'] = $request->target_user_id;
            $validated['created_by'] = $request->user_id;
            $validated['updated_by'] = $request->user_id;

            // 6. Lưu dữ liệu
            DB::beginTransaction();
            $code = Promotion::create($validated);
            DB::commit();
            if ($request->target_user_id == -1) {
                $this->sendNotification(1,"Khuyến mãi {$request->discount_value}% từ {$request->start_date} đến {$request->end_date} khi sử dụng mã giảm giá {$request->code}");
            } else {
                $this->sendNotification(1,"Khuyến mãi {$request->discount_value}% từ {$request->start_date} đến {$request->end_date} khi sử dụng mã giảm giá {$request->code}",null,$request->user_id);
            }
            return response()->json([
                'message' => 'Tạo mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'status' => false,
                // 'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã có lỗi xảy ra.',
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

            $rules = [
                'code'                 => 'required|string|unique:promotions,code,' . $id,
                'description'          => 'nullable|string|max:255',
                'usage_limit'          => 'nullable|integer|min:-1|not_in:0',
                'per_user_limit'       => 'nullable|integer|min:-1|not_in:0',
                'discount_value'       => 'required|integer|min:0',
                'min_discount_amount'  => 'nullable|integer|min:0',
                'max_discount_amount'  => 'nullable|integer|min:0|gt:min_discount_amount',
                'start_date'           => 'required|date',
                'end_date'             => 'required|date|after_or_equal:start_date',
                'status'               => 'required|in:0,1',
                'target_user_id'       => 'required|integer',
            ];

            $messages = [
                'code.required'                 => 'Vui lòng nhập mã khuyến mãi.',
                'code.string'                   => 'Mã khuyến mãi phải là chuỗi ký tự.',
                'code.unique'                   => 'Mã khuyến mãi này đã tồn tại.',

                'description.string'            => 'Mô tả phải là chuỗi ký tự.',
                'description.max'               => 'Mô tả không được vượt quá 255 ký tự.',

                'usage_limit.integer'           => 'Giới hạn sử dụng phải là số nguyên.',
                'usage_limit.min'               => 'Giới hạn sử dụng phải lớn hơn hoặc bằng -1.',
                'usage_limit.not_in'            => 'Giới hạn sử dụng không được là 0.',

                'per_user_limit.integer'        => 'Giới hạn mỗi người dùng phải là số nguyên.',
                'per_user_limit.min'            => 'Giới hạn mỗi người dùng phải lớn hơn hoặc bằng -1.',
                'per_user_limit.not_in'         => 'Giới hạn mỗi người dùng không được là 0.',

                'discount_value.required'       => 'Vui lòng nhập giá trị giảm giá.',
                'discount_value.integer'        => 'Giá trị giảm giá phải là số nguyên.',
                'discount_value.min'            => 'Giá trị giảm giá phải lớn hơn hoặc bằng 0.',

                'min_discount_amount.integer'   => 'Giá trị giảm giá tối thiểu phải là số nguyên.',
                'min_discount_amount.min'       => 'Giá trị giảm giá tối thiểu phải lớn hơn hoặc bằng 0.',

                'max_discount_amount.integer'   => 'Giá trị giảm giá tối đa phải là số nguyên.',
                'max_discount_amount.min'       => 'Giá trị giảm giá tối đa phải lớn hơn hoặc bằng 0.',
                'max_discount_amount.gt'        => 'Giá trị tối đa phải lớn hơn giá trị tối thiểu.',

                'start_date.required'           => 'Vui lòng chọn ngày bắt đầu.',
                'start_date.date'               => 'Ngày bắt đầu không đúng định dạng.',

                'end_date.required'             => 'Vui lòng chọn ngày kết thúc.',
                'end_date.date'                 => 'Ngày kết thúc không đúng định dạng.',
                'end_date.after_or_equal'       => 'Ngày kết thúc phải cùng hoặc sau ngày bắt đầu.',

                'status.required'               => 'Vui lòng chọn trạng thái.',
                'status.in'                     => 'Trạng thái không hợp lệ (phải là 0 hoặc 1).',

                'target_user_id.required'       => 'Vui lòng chọn người dùng mục tiêu.',
                'target_user_id.integer'        => 'ID người dùng mục tiêu phải là số nguyên.',
            ];

            // Áp dụng validator
            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Dữ liệu không hợp lệ',
                    'status'  => false,
                    'errors'  => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            $validated['user_id'] = $request->per_user_limit;
            $validated["created_by"] = $code->created_by;
            $validated['updated_by'] = $request->user_id;


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
                'message' => 'Đã có lỗi xảy ra.',
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
            $code->updated_by = $request->user_id;
            $code->save();

            return response()->json([
                'message' => 'Khôi phục mã giảm giá thành công',
                'status' => true,
                'data' => $code
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã có lỗi xảy ra.',
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
                'message' => 'Đã có lỗi xảy ra.',
                'status' => false
            ], 500);
        }
    }
    public function getUserByWebId(Request $request)
    {
        try {
            $user = User::where('web_id', $request->web_id)->get();

            if (!$user) {
                return response()->json([
                    'message' => 'Lấy danh sách user không thành công.',
                    'status' => false
                ], 400);
            }
            return response()->json([
                'message' => 'Lấy danh sách user thành công.',
                'status' => true,
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã có lỗi xảy ra. ',
                'status' => false
            ], 500);
        }
    }
}
