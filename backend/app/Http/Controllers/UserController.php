<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use function Illuminate\Events\queueable;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();

            //lọc theo tên nếu có field
            // Tìm kiếm theo field nếu có
            if ($request->filled('field') && trim($request->field) !== '') {
                $search = $request->field;

                $query->where(function ($q) use ($search) {
                    $q->where('username', 'like', "%$search%")
                        ->orWhere('fullname', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhere('phone', 'like', "%$search%")
                        ->orWhere('avatar_url', 'like', "%$search%");
                });
            }

            if ($request->filled('web_id')) {
                $query->where('web_id', $request->web_id);
            }

            //phân trang 
            $offset = (int) $request->input('offset', 0);
            $limit = (int) $request->input('limit', 10);

            // Lấy các trường cần select, mặc định là lấy tất cả
            $fields = $request->input('fields');
            if (!empty($fields)) {
                $fields = explode(',', $fields);
                $query->select($fields);
            }
            $accounts = $query->offset($offset)->limit($limit)->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách tài khoản',
                'data' => $accounts
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
    public function store(Request $request, $id) {}

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {

            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Lấy tài khoản',
                'data' => $query
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy ra tài khoản',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            // Lấy các field hợp lệ    
            $input = $request->only($query->getfillable());
            if ($request->filled('password')) {
                $input['password'] = Hash::make($request->input('password'));
            }

            $query->update($input);
            return response()->json([
                'status' => true,
                'message' => 'Cập nhật tài khoản',
                'data' => $query
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi lấy ra tài khoản',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            $query->status = 0;
            $query->save();

            return response()->json([
                'status' => true,
                'message' => 'Xóa tài khoản',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi xóa tài khoản',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function restore(string $id)
    {
        try {
            $query = User::find($id);
            if (!$query) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản'
                ]);
            }

            $query->status = 1;
            $query->save();

            return response()->json([
                'status' => true,
                'message' => 'Đã Khôi phục tài khoản',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi khôi phục tài khoản',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
