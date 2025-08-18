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
                "wallet.transactions",
                "wallet.transactions.order",
                "orders.items",
                "rechargeCards",
                "rechargeBanks",
                "withdraw",
                "roles",
                "web",
                "referredUsers",
            ])->find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản người dùng.'
                ], 404);
            }

            $actingUser = auth()->user();
            $query = Role::query();

            if ($actingUser->hasRole('admin-super')) {
                $query->where('name', '!=', 'admin-super');
            } else if ($actingUser->hasRole('admin')) {
                $query->whereNotIn('name', ['admin-super', 'admin']);
            } else {
                 $query->whereNotIn('name', ['admin-super', 'admin']);
            }
            $role = $query->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu tài khoản người dùng thành công.',
                'data' => [
                    'user' => $user->toArray(),
                    'role' => $role
                ]
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi lấy dữ liệu tài khoản.',
            ], 500);
        }
    }
    public function destroy(Request $request, $id)
    {
        try {
            $requester = User::find($request->user_id);
            $targetUser = User::find($id);

            if (!$targetUser) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy tài khoản cần khóa.'
                ], 404);
            }

            if ($requester->id == $targetUser->id) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không thể tự khóa tài khoản của mình."
                ], 422);
            }

            if (!$requester->can('users.delete')) {
                return response()->json([
                    "status" => false,
                    "message" => "Bạn không có quyền thực hiện hành động này."
                ], 403);
            }

            if ($requester->hasRole('admin-super')) {
            }
            elseif ($requester->hasRole('admin')) {
                if ($targetUser->hasRole('admin') || $targetUser->hasRole('admin-super')) {
                    return response()->json([
                        "status" => false,
                        "message" => "Bạn không có quyền thao tác với tài khoản quản trị"
                    ], 403);
                }
            }

            $targetUser->status = 2;
            $targetUser->save();

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
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã có lỗi từ máy chủ xảy ra.'
            ], 500);
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
            $validator = Validator::make($request->all(), [
                'roles' => [
                    'required',
                    'string',
                    'exists:roles,name',
                    Rule::notIn(['admin-super']),
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Dữ liệu không hợp lệ.',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $actingUser = $request->user();
            $targetUser = User::find($id);

            if (!$targetUser) {
                return response()->json(['status' => false, 'message' => 'Không tìm thấy tài khoản người dùng.'], 404);
            }

            if (!$actingUser->can('roles.edit')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền thực hiện hành động này.'], 403);
            }
            if ($actingUser->id === $targetUser->id) {
                return response()->json(['status' => false, 'message' => 'Không thể tự thay đổi vai trò của chính mình.'], 403);
            }
            if ($targetUser->hasRole('admin-super')) {
                return response()->json(['status' => false, 'message' => 'Không thể chỉnh sửa vai trò của một Quản trị viên tối cao.'], 403);
            }
            
            if ($actingUser->hasRole('admin') && $targetUser->hasRole('admin')) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền chỉnh sửa vai trò của Quản trị viên khác.'], 403);
            }
            
            $roleToSync = $request->input('roles');

            if ($actingUser->hasRole('admin') && in_array($roleToSync, ['admin', 'admin-super'])) {
                return response()->json(['status' => false, 'message' => 'Bạn không có quyền gán vai trò quản trị.'], 403);
            }

            $targetUser->syncRoles([$roleToSync]);

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

    public function getAssignablePermissions(Request $request)
    {
        try {
            $permissions = Permission::where('group_name', '!=', 'Quản lý Phân quyền')->where('group_name', '!=', 'Quản lý Web con')
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

   public function createStaffAccount(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'username' => 'required|string|unique:users,username',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'assignment_type' => ['required', Rule::in(['role', 'permissions'])],
                'role_name' => 'required_if:assignment_type,role|string|exists:roles,name',
                'permissions' => 'required_if:assignment_type,permissions|array',
                'permissions.*' => 'string|exists:permissions,name',
            ], [
                'username.required' => 'Vui lòng nhập tên đăng nhập.',
                'username.unique' => 'Tên đăng nhập này đã tồn tại.',
                'email.required' => 'Vui lòng nhập địa chỉ email.',
                'email.unique' => 'Địa chỉ email này đã được sử dụng.',
                'password.required' => 'Vui lòng nhập mật khẩu.',
                'password.min' => 'Mật khẩu phải có ít nhất :min ký tự.',
                'assignment_type.required' => 'Vui lòng chọn phương thức gán quyền.',
                'role_name.required_if' => 'Vui lòng chọn một vai trò khi phương thức là "gán theo vai trò".',
                'role_name.exists' => 'Vai trò được chọn không tồn tại.',
                'permissions.required_if' => 'Vui lòng chọn ít nhất một quyền khi phương thức là "gán theo quyền".',
            ]);
            
            $actingUser = $request->user();
            if ($actingUser->hasRole('admin')) {
                if ($request->input('assignment_type') === 'role') {
                    if (in_array($request->input('role_name'), ['admin', 'admin-super'])) {
                        return response()->json([
                            'message' => 'Bạn không có quyền tạo tài khoản với vai trò quản trị.',
                            'status' => false,
                        ], 403);
                    }
                }
            }

            $donate_code = "";
            do {
                $donate_code = $this->generateCode(16);
            } while (User::where("donate_code", $donate_code)->exists());

            DB::beginTransaction();

            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'web_id' => $request->web_id,
                'status' => 1,
                'email_verified_at' => now(),
                'donate_code' => $donate_code,
            ]);

            Wallet::create(['user_id' => $user->id, "balance" => 0, "currency" => "VND"]);

            // ======================= BẮT ĐẦU THAY ĐỔI =======================
            // Đã loại bỏ việc gán vai trò 'user' mặc định cho nhân viên.
            // Tài khoản nhân viên sẽ chỉ có vai trò được chỉ định.
            // $user->assignRole('user');
            // ======================= KẾT THÚC THAY ĐỔI =======================

            if ($validatedData['assignment_type'] === 'role') {
                $user->assignRole($validatedData['role_name']);
            } else {
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
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'status' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi khi tạo tài khoản nhân viên: " . $e->getMessage());
            return response()->json([
                'message' => 'Đã có lỗi xảy ra ở máy chủ.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
