<?php

namespace App\Http\Controllers;

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
                "status"=>True,
                "message"=>"Lấy danh sách khuyến mãi thành công",
                "data"=>$donate_promotions
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra"
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
                    "status"=>False,
                    "message"=>"Khuyến mãi nạp thẻ đã tồn tại"
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
                "status"=>True,
                "message"=>"Tạo khuyến mãi nạp thẻ thành công"
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra khi lưu dữ liệu",
                "errors"=>$e->getMessage()
            ], 500);
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Đã có lỗi xảy ra"
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
