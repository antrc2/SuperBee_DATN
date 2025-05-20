<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Exception;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Account::query();

            //lọc theo tên nếu có filed
            if ($request->filled('filed')) {
                $query->where('name', 'like', '%' . $request->filed . '%');
            }

            //phân trang 
            $offset = (int) $request->input('offset', 0);
            $limit = (int) $request->input('limit', 10);

            $account = $query->offset($offset)->limit($limit)->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách tài khoản',
                'data' => $account
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách tài khoản',
                'error' => $e->getMessage()
            ], 500);
        }
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
