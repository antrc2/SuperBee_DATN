<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DiscountCode;
use Illuminate\Support\Facades\Auth;

class DiscountCodeController extends Controller
{
    // GET /discount_codes
    public function index()
    {
        $codes = DiscountCode::all();
        return response()->json([
            'message' => 'Lấy danh sách mã giảm giá thành công',
            'status' => true,
            'data' => $codes
        ]);
    }

    // GET /discount_codes/{id}
    public function show($id)
    {
        $code = DiscountCode::find($id);
        if (!$code) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá', 'status' => false], 404);
        }
        return response()->json([
            'message' => 'Lấy chi tiết mã giảm giá thành công',
            'status' => true,
            'data' => $code
        ]);
    }

    // POST /discount_codes
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:discount_codes,code',
            'usage_limit' => 'required|integer|min:1',
            'discount_amount' => 'required|integer|min:0',
            'min_discount_amount' => 'nullable|integer|min:0',
            'max_discount_amount' => 'nullable|integer|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'web_id' => 'nullable|exists:webs,id',
        ]);

        // Tự set giá trị used_count = 0 khi tạo mới
        $validated['used_count'] = 0;

        // Gán người tạo (nếu có Auth)
        if (Auth::check()) {
            $validated['created_by'] = Auth::id();
            $validated['updated_by'] = Auth::id();
        }

        $code = DiscountCode::create($validated);

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công',
            'status' => true,
            'data' => $code
        ], 201);
    }

    // PUT/PATCH /discount_codes/{id}
    public function update(Request $request, $id)
    {
        $code = DiscountCode::find($id);
        if (!$code) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá', 'status' => false], 404);
        }

        $validated = $request->validate([
            'code' => 'sometimes|required|string|unique:discount_codes,code,' . $id,
            'usage_limit' => 'sometimes|required|integer|min:1',
            'discount_amount' => 'sometimes|required|integer|min:0',
            'min_discount_amount' => 'nullable|integer|min:0',
            'max_discount_amount' => 'nullable|integer|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id',
            'web_id' => 'nullable|exists:webs,id',
        ]);

        // Cập nhật người sửa
        if (Auth::check()) {
            $validated['updated_by'] = Auth::id();
        }

        $code->update($validated);

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công',
            'status' => true,
            'data' => $code
        ]);
    }

    // DELETE /discount_codes/{id}
    public function destroy($id)
    {
        $code = DiscountCode::find($id);
        if (!$code) {
            return response()->json(['message' => 'Không tìm thấy mã giảm giá', 'status' => false], 404);
        }

        $code->delete();

        return response()->json([
            'message' => 'Xóa mã giảm giá thành công',
            'status' => true
        ]);
    }
}
