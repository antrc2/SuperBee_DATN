<?php

namespace App\Http\Controllers;

use App\Models\BankHistory;
use App\Models\CardHistory;
use App\Models\DonatePromotion;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DonatePromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

            // Cập nhật các khuyến mãi hết hạn

            DonatePromotion::where('end_date', '<', DB::raw('NOW()'))
                ->where('status', 1)
                ->update(['status' => 0]);

            $query = DonatePromotion::where("web_id", $request->web_id);

            // Nếu có tham số limit và offset thì áp dụng
            if ($request->has('limit')) {
                $limit = (int) $request->query('limit');
                $query->limit($limit);
            }

            if ($request->has('offset')) {
                $offset = (int) $request->query('offset');
                $query->offset($offset);
            }

            $donate_promotions = $query->get();

            return response()->json([
                "status" => True,
                "message" => "Lấy danh sách khuyến mãi thành công",
                "data" => $donate_promotions
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {


            $web_id = $request->web_id;
            // Kiểm tra xem đã có dữ liệu chưa theo web_id
            $existingPromotion = DonatePromotion::where('web_id', $web_id)->where("status", 1)->first();
            if ($existingPromotion) {
                return response()->json([
                    "status" => False,
                    "message" => "Khuyến mãi nạp thẻ đã tồn tại"
                ], 409);
            }
            $validatedData = $request->validate([
                'amount'      => 'required|integer',
                'start_date'  => 'required|date|before:end_date',
                'end_date'    => 'required|date|after:start_date',
            ]);
            DonatePromotion::create([
                'web_id'      => $web_id,
                'amount'      => $validatedData['amount'],
                'start_date'  => $validatedData['start_date'],
                'end_date'    => $validatedData['end_date'],
            ]);
            return response()->json([
                "status" => True,
                "message" => "Tạo khuyến mãi nạp thẻ thành công"
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra khi lưu dữ liệu",
                "errors" => $e->getMessage()
            ], 500);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => False,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            DonatePromotion::where('end_date', '<', DB::raw('NOW()'))
                ->where('status', 1)
                ->update(['status' => 0]);

            // $donate_promotions
            $donatePromotion = DonatePromotion::findOrFail($id);
            return response()->json([
                "status" => true,
                "message" => "Lấy thông tin khuyến mãi thành công",
                "data" => $donatePromotion
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy khuyến mãi"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra"
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // 1. Tự động cập nhật các khuyến mãi đã hết hạn
            DonatePromotion::where('end_date', '<', DB::raw('NOW()'))
                ->where('status', 1)
                ->update(['status' => 0]);
            if (DonatePromotion::where('id', $id)->where('end_date', '>', DB::raw('NOW()'))->first() == NULL) {
                return response()->json([
                    "status" => False,
                    "message" => "Đã hết hạn sử dụng nên không thể sửa"
                ]);
                // Khuyến mãi đã hết hạn
            }

            if (
                BankHistory::where("donate_promotion_id", $id)->first() == NULL &&
                CardHistory::where("donate_promotion_id", $id)->first() == NULL
            ) {
                $donatePromotion = DonatePromotion::findOrFail($id);

                // Chỉ validate những field được gửi đến
                $validatedData = $request->validate([
                    'amount'     => 'sometimes|integer',
                    'start_date' => 'sometimes|date|before:end_date',
                    'end_date'   => 'sometimes|date|after:start_date',
                ]);
                $donatePromotion->update($validatedData);

                return response()->json([
                    "status" => true,
                    "message" => "Cập nhật khuyến mãi nạp thẻ thành công"
                ], 200);
            } else {
                return response()->json([
                    "status" => False,
                    "message" => "Khuyến mãi đã được sử dụng, không thể sửa"
                ]);
            }
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy khuyến mãi"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã có lỗi xảy ra",

            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            if (
                BankHistory::where("donate_promotion_id", $id)->first() == NULL &&
                CardHistory::where("donate_promotion_id", $id)->first() == NULL
            ) {
                // Nếu chưa có bản ghi nào liên quan, xóa hẳn
                DonatePromotion::findOrFail($id)->delete();

                return response()->json([
                    "status" => true,
                    "message" => "Xóa khuyến mãi thành công"
                ], 200);
            } else {
                DonatePromotion::where("id", $id)->update(["status" => 0]);

                return response()->json([
                    "status" => true,
                    "message" => "Không thể xóa, đã có lịch sử liên quan — đã chuyển trạng thái về không hoạt động"
                ], 200);
            }
            //code...
        } catch (ModelNotFoundException $e) {
            return response()->json([
                "status" => false,
                "message" => "Không tìm thấy khuyến mãi"
            ], 404);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => false,
                "message" => "Đã xảy ra lỗi hệ thống",
            ], 500);
        }
    }
    public function undo(String $id){
        try {
            if (DonatePromotion::where('id',$id)->first() == NULL) {
                return response()->json([
                    'status'=>False,
                    'message'=>"Không tìm thấy khuyến mãi"
                ],404);
            } else {
                DonatePromotion::where("id",$id)->update(['status'=>0]);
            }
            
            return response()->json([
                'status'=>True,
                'message'=>"Khôi phục thành công"
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                'message'=>"Khôi phục thất bại"
            ]);
        }
    }
}
