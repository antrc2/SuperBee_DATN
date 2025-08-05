<?php

namespace App\Http\Controllers\Admin;

use App\Events\SystemNotification;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function generateCode(int $length = 16): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        $max = strlen($characters) - 1;
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $max)];
        }
        return $code;
    }
    //
    public function index(Request $request)
    {
        try {
            // Validate request parameters for sorting
            $request->validate([
                'sort_by' => 'sometimes|in:username,email,balance,created_at',
                'sort_direction' => 'sometimes|in:asc,desc',
                'status' => 'sometimes|in:0,1,2',
                'role_id' => 'sometimes|integer|exists:roles,id',
                'page' => 'sometimes|integer|min:1',
            ]);

            // Start building the query
            $query = User::query();

            // Eager load relationships
            $query->with(['roles', 'wallet']);

            // Handle combined search for username and email
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('username', 'like', $searchTerm)
                        ->orWhere('email', 'like', $searchTerm);
                });
            });

            // Handle status filtering
            $query->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            });

            // Handle role filtering
            $query->when($request->filled('role_id'), function ($q) use ($request) {
                $q->whereHas('roles', function ($subQuery) use ($request) {
                    $subQuery->where('id', $request->role_id);
                });
            });

            // Handle sorting
            if ($request->filled('sort_by')) {
                $direction = $request->input('sort_direction', 'asc');

                if ($request->sort_by === 'balance') {
                    // Join with wallets table to sort by balance
                    $query->leftJoin('wallets', 'users.id', '=', 'wallets.user_id')
                        ->orderBy('wallets.balance', $direction)
                        ->select('users.*'); // Avoid ambiguity
                } else {
                    $query->orderBy($request->sort_by, $direction);
                }
            } else {
                // Default sort
                $query->latest(); // Sort by created_at desc
            }

            // Paginate the results
            $users = $query->paginate(15)->withQueryString();

            // Get all roles for the filter dropdown
            $roles = Role::all(['id', 'name', 'description']);

            return response()->json([
                'message' => 'Lấy danh sách tài khoản thành công',
                'status' => true,
                'data' => [
                    'users' => $users,
                    'roles' => $roles,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching accounts: ' . $e->getMessage());
            return response()->json([
                'message' => 'Đã có lỗi xảy ra ở phía máy chủ.',
                'status' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function show($id)
    {
        try {
            $user = User::with([
                "wallet.transactions", // Lấy ví và tất cả giao dịch của ví
                // "wallet.transactions.rechargeCard", // Chi tiết nạp thẻ (nếu là giao dịch loại recharge_card)
                // "wallet.transactions.rechargeBank",  // Chi tiết nạp bank (nếu là giao dịch loại recharge_bank)
                // "wallet.transactions.withdraw",    // Chi tiết rút tiền (nếu là giao dịch loại withdraw)
                "wallet.transactions.order",         // Chi tiết đơn hàng (nếu là giao dịch loại purchase)
                "orders.items",          // Lấy các đơn hàng và chi tiết từng sản phẩm trong đơn hàng
                "rechargeCards", // Lịch sử nạp thẻ và khuyến mãi áp dụng
                "rechargeBanks", // Lịch sử nạp bank và khuyến mãi áp dụng
                "withdraw",           // Lịch sử rút tiền
                "roles",                 // Vai trò của người dùng (từ Spatie/Permission)
                "web",                   // Website mà user thuộc về
                "referredUsers", // Các user mà user này đã giới thiệu (nếu cần xem ai)
            ])->find($id);
            $role = Role::where('name', '!=', 'admin')->get();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản người dùng.'
                ], 404); // Trả về 404 nếu không tìm thấy
            }

            // Có thể thêm logic xử lý dữ liệu trước khi gửi về FE tại đây
            // Ví dụ: tính toán tổng tiền đã nạp/rút

            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu tài khoản người dùng thành công.',
                'data' => [
                    'user' => $user->toArray(), // Chuyển đổi Eloquent Collection/Model sang array
                    'role' => $role
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy dữ liệu tài khoản.',
            ], 500); // Trả về 500 cho lỗi server
        }
    }
    public function destroy(Request $request, $id)
    {
        try {
            $requester = User::find($request->user_id);
            // Lấy tài khoản mục tiêu cần khóa (target user)
            $targetUser = User::find($id);

            // 1. Kiểm tra tài khoản mục tiêu có tồn tại không
            if (!$targetUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản cần khóa.'
                ], 404); // 404 Not Found
            }

            // 2. Không ai được tự khóa tài khoản của mình
            if ($requester->id == $targetUser->id) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không thể tự khóa tài khoản của mình."
                ], 422); // 422 Unprocessable Entity
            }

            // 3. Kiểm tra quyền hạn cơ bản: Người thực hiện có quyền "xóa" người dùng không?
            // Điều này áp dụng cho tất cả các vai trò, kể cả nhân viên.
            if (!$requester->can('users.delete')) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không có quyền thực hiện hành động này."
                ], 403); // 403 Forbidden
            }


            // Nếu người thực hiện là 'admin', họ có toàn quyền (trừ tự khóa đã check ở trên)
            if ($requester->hasRole('admin')) {
            }
            //  Nếu người thực hiện là 'admin-super'
            elseif ($requester->hasRole('admin-super')) {
                // 'admin-super' không được khóa 'admin' hoặc 'admin-super' khác
                if ($targetUser->hasRole('admin') || $targetUser->hasRole('admin-super')) {
                    return response()->json([
                        "status" => false,
                        "message" => "Bạn không có quyền thao tác với tài khoản quản trị"
                    ], 403); // 403 Forbidden
                }
            }

            $targetUser->status = 2;
            $targetUser->save();

            // Gửi email hoặc thông báo hệ thống
            event(new SystemNotification(
                "EMAIL_BAN_ACCOUNT",
                [
                    "email" => $targetUser->email,
                    "username" => $targetUser->username,
                ]
            ));

            return response()->json([
                'status' => true,
                'message' => 'Khóa tài khoản thành công.'
            ], 200); // 200 OK

        } catch (Exception $e) {
            // Ghi lại log lỗi để debug
            return response()->json([
                'status' => false,
                'message' => 'Đã có lỗi từ máy chủ xảy ra.'
            ], 500); // 500 Internal Server Error
        }
    }
    public function restore(Request $req, $id)
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
            event(new SystemNotification(
                "EMAIL_RESTORE_ACCOUNT",
                [
                    "email" => $query->email,
                    "username" => $query->username,
                    // "amount"=>9000
                ]
            ));
            return response()->json([
                'status' => true,
                'message' => 'Khôi phục tài khoản thành công',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi khôi phục tài khoản',
            ], 500);
        }
    }
    public function updateRoles(Request $request, $id)
    {
        try {
            // Bước 1: Validate đầu vào (Giữ nguyên, đã rất tốt)
            $validator = Validator::make($request->all(), [
                'roles' => 'present|array',
                'roles.*' => 'string|exists:roles,name',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Dữ liệu không hợp lệ.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $rolesToSync = $request->input('roles', []);

            // Bước 2: Lấy thông tin các đối tượng
            $targetUser = User::find($id);
            if (!$targetUser) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy tài khoản người dùng.'], 404);
            }

            // Lấy người dùng đang thực hiện hành động từ request đã được xác thực
            $actingUser = User::find($request->user_id);

            // Kiểm tra quyền hạn cơ bản
            if (!$actingUser->can('roles.edit')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
            }

            // ---- Logic cho ADMIN ----
            if ($actingUser->hasRole('admin')) {
                // Quy tắc an toàn duy nhất cho admin: không cho phép tự tước quyền admin của chính mình.
                if ($actingUser->id === $targetUser->id && !in_array('admin', $rolesToSync)) {
                    return response()->json(['status' => false, 'message' => 'Không thể tự xóa vai trò Quản trị viên tối cao của chính mình.'], 403);
                }
            }
            // ---- Logic cho SUPER-ADMIN ----
            elseif ($actingUser->hasRole('admin-super')) {
                // 1. Không được sửa quyền của 'admin'.
                if ($targetUser->hasRole('admin')) {
                    return response()->json(['status' => false, 'message' => 'Bạn không có quyền chỉnh sửa vai trò của Quản trị viên tối cao.'], 403);
                }

                // 2. Không được sửa quyền của 'admin-super' khác.
                if ($targetUser->hasRole('admin-super') && $targetUser->id !== $actingUser->id) {
                    return response()->json(['status' => false, 'message' => 'Bạn không có quyền chỉnh sửa vai trò của Quản trị viên cấp cao khác.'], 403);
                }

                // 3. Không được phép gán vai trò 'admin' hoặc 'admin-super' cho bất kỳ ai.
                if (in_array('admin', $rolesToSync) || in_array('admin-super', $rolesToSync)) {
                    return response()->json(['status' => false, 'message' => 'Bạn không có quyền gán các vai trò quản trị cấp cao.'], 403);
                }
            } else {
                // Mặc định, các vai trò khác sẽ bị giới hạn nghiêm ngặt nhất: không được đụng đến admin/admin-super và không được gán quyền admin/admin-super.
                if ($targetUser->hasRole(['admin', 'admin-super']) || in_array('admin', $rolesToSync) || in_array('admin-super', $rolesToSync)) {
                    return response()->json(['status' => false, 'message' => 'Quyền của bạn bị giới hạn đối với các vai trò quản trị.'], 403);
                }
            }
            // Bước 4: Đồng bộ hóa quyền (nếu tất cả các kiểm tra đã qua)
            $targetUser->syncRoles($rolesToSync);

            return response()->json(['status' => true, 'message' => 'Cập nhật vai trò thành công.'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Đã có lỗi máy chủ xảy ra.'], 500);
        }
    }
    public function getStaffRoles(Request $request)
    {
        try {
            $excludedRoles = ['admin', 'admin-super', 'reseller', 'partner', 'user', 'staff-nhan-vien'];
            $roles = Role::whereNotIn('name', $excludedRoles)->get(['id', 'name', 'description']);
            return response()->json(['status' => true, 'data' => $roles]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi máy chủ.'], 500);
        }
    }

    /**
     * Lấy tất cả các quyền có thể gán, trừ nhóm 'Quản lý Phân quyền'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAssignablePermissions(Request $request)
    {
        try {
            // Lấy tất cả quyền trừ các quyền trong nhóm 'Quản lý Phân quyền'
            $permissions = Permission::where('group_name', '!=', 'Quản lý Phân quyền')
                ->get()
                ->groupBy('group_name');

            return response()->json([
                'message' => 'Lấy danh sách quyền thành công.',
                'status' => true,
                'data' => $permissions
            ], 200);
        } catch (\Exception $e) {
            Log::error("Lỗi khi lấy danh sách quyền có thể gán: " . $e->getMessage());
            return response()->json(['message' => 'Lỗi máy chủ nội bộ.'], 500);
        }
    }

    /**
     * Tạo tài khoản nhân viên theo 1 trong 2 cách: gán vai trò hoặc gán quyền trực tiếp.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createStaffAccount(Request $request)
    {
        try {
            // 1. Xác thực dữ liệu chung và loại phân quyền
            $validatedData = $request->validate([
                'username' => 'required|string|unique:users,username',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'assignment_type' => ['required', Rule::in(['role', 'permissions'])],
                // Xác thực có điều kiện
                'role_name' => 'required_if:assignment_type,role|string|exists:roles,name',
                'permissions' => 'required_if:assignment_type,permissions|array',
                'permissions.*' => 'string|exists:permissions,name',
            ], [
                //... (thêm các message tùy chỉnh nếu muốn)
                'assignment_type.required' => 'Vui lòng chọn phương thức gán quyền.',
                'role_name.required_if' => 'Vui lòng chọn một vai trò.',
                'permissions.required_if' => 'Vui lòng chọn ít nhất một quyền.',
            ]);
            $donate_code = "";
            do {
                $donate_code = $this->generateCode(16);
            } while (User::where("donate_code", $donate_code)->exists());
            DB::beginTransaction();

            // 2. Tạo User và Wallet (chung cho cả 2 cách)

            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'web_id' => $request->web_id,
                'status' => 1,
                'email_verified_at' => now(),
                'donate_code'=>$donate_code

            ]);
            Wallet::create(['user_id' => $user->id, "balance" => 0, "currency" => "VND"]);

            // Gán role 'user' để có các quyền cơ bản
            $user->assignRole('user');

            // 3. Xử lý logic gán quyền dựa trên lựa chọn của admin
            if ($validatedData['assignment_type'] === 'role') {
                // Cách 1: Gán vai trò đã có
                $user->assignRole($validatedData['role_name']);
            } else { // assignment_type === 'permissions'
                // Cách 2: Gán vai trò 'staff-nhan-vien' và gán quyền trực tiếp
                $user->assignRole('staff-nhan-vien');
                $user->givePermissionTo($validatedData['permissions']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Tạo tài khoản nhân viên thành công!',
                'status' => true,
                'data' => $user->load('roles', 'permissions')
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'status' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi tạo tài khoản nhân viên: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi xảy ra ở máy chủ.', 's' => $e->getMessage()], 500);
        }
    }
}
