<?php

namespace App\Http\Controllers\Admin;
use App\Models\Withdraw;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminWithdrawController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $withdraws = Withdraw::with('user')->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách yêu cầu rút tiền thành công',
                'data' => $withdraws
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi truy vấn rút tiền',
                'data'=>[]
                // 'error' => $e->getMessage()
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function export()
    {

    }
}
