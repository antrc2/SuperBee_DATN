<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\AgentAssignment;
use App\Models\Employee;
use App\Models\User;
use App\Models\ChatRoom;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    /**
     * Lấy danh sách nhân viên đã phân trang và lọc
     */
    public function index(Request $request)
    {
        
        // if ($request->user()->cannot('employees.view')) {
        //     abort(403, 'Bạn không có quyền xem danh sách nhân viên.');
        // }

        $query = Employee::query()->with(['user.roles', 'agentAssignment.agent']);

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('employee_code', 'like', "%{$searchTerm}%")
                  ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                      $userQuery->where('username', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $employees = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($employees);
    }
    
    /**
     * SỬA LẠI: Hiển thị thông tin chi tiết của một nhân viên, nhận vào là ID
     */
    public function show(Request $request, $id)
    {
        // if ($request->user()->cannot('employees.view')) {
        //     abort(403, 'Bạn không có quyền xem thông tin nhân viên.');
        // }

        $employee = Employee::findOrFail($id);
        $employee->load(['user.roles', 'agentAssignment.agent']);
        
        return response()->json($employee);
    }

    /**
     * Cung cấp dữ liệu cần thiết để khởi tạo form Thêm/Sửa nhân viên
     */
    public function getFormData()
    {
        $employeeRoleNames = ['ke-toan', 'nv-ho-tro', 'nv-marketing'];
        $roles = Role::query()
            ->whereIn('name', $employeeRoleNames)
            ->select('id', 'name', 'description')
            ->get();

        return response()->json(['roles' => $roles]);
    }

    /**
     * Tạo mới một nhân viên với logic cải tiến
     */
    public function store(Request $request)
    {
        // if ($request->user()->cannot('employees.create')) {
        //     abort(403, 'Bạn không có quyền tạo nhân viên mới.');
        // }

        $validatedData = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Password::defaults()],
            'start_date' => 'required|date',
            'role_id' => 'required|integer|exists:roles,id',
            'type' => ['required_if:role_id,7', 'string', 'in:support,complaint'],
        ]);

        $role = Role::findById($validatedData['role_id']);
        if (!$role) {
            return response()->json(['message' => 'Vai trò không hợp lệ.'], 422);
        }

        if ($role->name === 'nv-ho-tro') {
            $agentType = $validatedData['type'];
            $availableSlot = Agent::active()->ofType($agentType)->available()->first();
                
            if (!$availableSlot) {
                $typeName = $agentType === 'support' ? 'hỗ trợ' : 'xử lý khiếu nại';
                return response()->json([
                    'message' => "Đã hết vị trí trống cho nhân viên {$typeName}. Vui lòng tạo thêm vị trí mới.",
                    'error_type' => 'no_available_slots'
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'status' => 1,
                'web_id' => 1,
                'donate_code' => 'DC' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT),
            ]);

            $employee_code = 'NV' . str_pad($user->id, 6, '0', STR_PAD_LEFT);

            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => $employee_code,
                'job_title' => $role->description ?? $role->name,
                'department' => 'Nội bộ',
                'start_date' => $validatedData['start_date'],
                'status' => 'active',
            ]);

            $user->assignRole($role);

            if ($role->name === 'nv-ho-tro' && isset($availableSlot)) {
                AgentAssignment::create([
                    'agent_id' => $availableSlot->id,
                    'user_id' => $user->id,
                    'assigned_at' => now(),
                ]);
            }

            DB::commit();

            $employee->load(['user.roles', 'agentAssignment.agent']);
            return response()->json($employee, Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi, không thể tạo nhân viên.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * SỬA LẠI: Cập nhật thông tin một nhân viên, nhận vào là ID
     */
    public function update(Request $request, $id)
    {
        // if ($request->user()->cannot('employees.edit')) {
        //     abort(403, 'Bạn không có quyền chỉnh sửa nhân viên.');
        // }

        $employee = Employee::findOrFail($id);
        $user = $employee->user;
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy thông tin người dùng liên kết.'], 404);
        }

        $validatedData = $request->validate([
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'start_date' => 'required|date',
            'status' => 'required|string|in:active,on_leave,terminated',
            'role_id' => 'required|integer|exists:roles,id',
            'type' => ['required_if:role_id,7', 'string', 'in:support,complaint'],
        ]);

        DB::beginTransaction();
        try {
            // Cập nhật User
            $userData = [
                'username' => $validatedData['username'],
                'email' => $validatedData['email'],
            ];
            if (!empty($validatedData['password'])) {
                $userData['password'] = Hash::make($validatedData['password']);
            }
            $user->update($userData);

            $newRole = Role::findById($validatedData['role_id']);

            // Cập nhật Employee
            $employee->update([
                'job_title' => $newRole->description ?? $newRole->name,
                'start_date' => $validatedData['start_date'],
                'status' => $validatedData['status'],
            ]);

            $currentAssignment = AgentAssignment::where('user_id', $user->id)->first();
            $isCurrentlySupport = $currentAssignment !== null;
            $willBeSupport = $newRole->name === 'nv-ho-tro';

            // TH 1: Từ NV Hỗ trợ -> Vai trò khác (Giải phóng slot)
            if ($isCurrentlySupport && !$willBeSupport) {
                $currentAssignment->delete();
            }

            // TH 2: Từ vai trò khác -> NV Hỗ trợ (Tìm và chiếm slot mới)
            if (!$isCurrentlySupport && $willBeSupport) {
                $agentType = $validatedData['type'];
                $availableSlot = Agent::active()->ofType($agentType)->available()->first();
                if (!$availableSlot) {
                    DB::rollBack();
                    $typeName = $agentType === 'support' ? 'hỗ trợ' : 'xử lý khiếu nại';
                    return response()->json([
                        'message' => "Đã hết vị trí trống cho nhân viên {$typeName}.",
                        'error_type' => 'no_available_slots'
                    ], 422);
                }
                AgentAssignment::create(['agent_id' => $availableSlot->id, 'user_id' => $user->id]);
            }

            // TH 3: Vẫn là NV Hỗ trợ (nhưng có thể thay đổi loại hỗ trợ)
            if ($isCurrentlySupport && $willBeSupport) {
                $agentType = $validatedData['type'];
                $currentSlot = $currentAssignment->agent;

                if ($currentSlot->type !== $agentType) {
                    $availableSlot = Agent::active()->ofType($agentType)->available()->first();
                    if (!$availableSlot) {
                        DB::rollBack();
                        $typeName = $agentType === 'support' ? 'hỗ trợ' : 'xử lý khiếu nại';
                        return response()->json([
                            'message' => "Đã hết vị trí trống để chuyển sang vai trò {$typeName}.",
                            'error_type' => 'no_available_slots'
                        ], 422);
                    }
                    $currentAssignment->delete();
                    AgentAssignment::create(['agent_id' => $availableSlot->id, 'user_id' => $user->id]);
                }
            }

            $user->syncRoles($newRole);

            DB::commit();

            $employee->load(['user.roles', 'agentAssignment.agent']);
            return response()->json($employee);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi, không thể cập nhật.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * === HÀM MỚI: Cập nhật trạng thái (Khóa/Mở khóa) của nhân viên ===
     */
    public function updateStatus(Request $request, $id)
    {
        // if ($request->user()->cannot('employees.edit')) {
        //     abort(403, 'Bạn không có quyền chỉnh sửa nhân viên.');
        // }

        $validatedData = $request->validate([
            'reassign_to_employee_id' => 'nullable|integer|exists:employees,id',
        ]);

        $employee = Employee::with('user.roles')->findOrFail($id);
        $user = $employee->user;

        // Nếu trạng thái hiện tại không phải là 'terminated', nghĩa là hành động sắp tới là KHÓA.
        // Ngược lại, hành động là MỞ KHÓA.
        $isTerminating = $employee->status !== 'terminated';

        DB::beginTransaction();
        try {
            if ($isTerminating) {
                // LOGIC KHI KHÓA TÀI KHOẢN
                if ($user->hasRole('nv-ho-tro')) {
                    $reassignToEmployeeId = $validatedData['reassign_to_employee_id'] ?? null;
                    
                    // Kiểm tra xem có cần bàn giao không
                    if (empty($reassignToEmployeeId)) {
                        $eligibleAgentsCount = Employee::query()
                            ->where('id', '!=', $employee->id) // Loại trừ chính nhân viên này
                            ->where('status', 'active')
                            ->whereHas('user.roles', fn($q) => $q->where('name', 'nv-ho-tro'))
                            ->count();

                        // Nếu có nhân viên khác để bàn giao nhưng FE không gửi lên, báo lỗi
                        if ($eligibleAgentsCount > 0) {
                            DB::rollBack(); // Quan trọng: Hủy transaction trước khi trả về lỗi
                            return response()->json([
                                'message' => 'Cần chọn một nhân viên khác để bàn giao công việc trước khi khóa.',
                                'error_type' => 'reassignment_required'
                            ], 422);
                        }
                    }
                    // Nếu không có ai khác để bàn giao, hoặc FE đã gửi nhân viên bàn giao, thì cứ khóa
                    AgentAssignment::where('user_id', $user->id)->delete();
                }
                
                $employee->update(['status' => 'terminated']);
                $user->update(['status' => 0]); // Cập nhật cả status của user

            } else {
                // LOGIC KHI MỞ KHÓA TÀI KHOẢN
                $employee->update(['status' => 'active']);
                $user->update(['status' => 1]); // Cập nhật cả status của user
                
                // Lưu ý: Logic gán lại vào slot khi mở khóa có thể phức tạp
                // và cần cân nhắc kỹ. Tạm thời chỉ kích hoạt lại tài khoản.
            }

            DB::commit();
            // Trả về dữ liệu mới nhất của employee
            return response()->json($employee->fresh(['user.roles', 'agentAssignment.agent']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật trạng thái nhân viên.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SỬA LẠI: Vô hiệu hóa một nhân viên, nhận vào là ID
     * Hàm này vẫn có thể được dùng cho API nội bộ, nhưng FE sẽ gọi updateStatus()
     */
    public function destroy(Request $request, $id)
    {
        // if ($request->user()->cannot('employees.delete')) {
        //     abort(403, 'Bạn không có quyền vô hiệu hóa nhân viên.');
        // }

        $employee = Employee::findOrFail($id);
        $user = $employee->user;

        DB::beginTransaction();
        try {
            if ($user->hasRole('nv-ho-tro')) {
                // Giải phóng slot khi xóa
                AgentAssignment::where('user_id', $user->id)->delete();
                // Logic bàn giao công việc (nếu có) có thể được xử lý ở đây
            }
            
            $employee->update(['status' => 'terminated']);
            $user->update(['status' => 0]);

            DB::commit();
            return response()->noContent();
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi vô hiệu hóa nhân viên.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SỬA LẠI: Lấy danh sách nhân viên hỗ trợ hợp lệ để nhận bàn giao, nhận vào là ID
     */
    public function getEligibleSupportAgents($id)
    {
        $employeeToExclude = Employee::findOrFail($id);

        $agents = Employee::query()
            ->where('id', '!=', $employeeToExclude->id)
            ->where('status', 'active')
            ->whereHas('user', function ($query) {
                $query->where('status', 1)
                      ->whereHas('roles', function ($roleQuery) {
                          $roleQuery->where('name', 'nv-ho-tro');
                      });
            })
            ->with(['user:id,username'])
            ->get(['id', 'user_id']); // Chỉ lấy các trường cần thiết

        return response()->json($agents);
    }

    /**
     * Lấy thống kê về slots và assignments
     */
    public function getAgentSlotStats()
    {
        $supportSlots = Agent::ofType('support')->active()->count();
        $assignedSupportSlots = Agent::ofType('support')->active()->assigned()->count();
        
        $complaintSlots = Agent::ofType('complaint')->active()->count();
        $assignedComplaintSlots = Agent::ofType('complaint')->active()->assigned()->count();

        return response()->json([
            'support' => [
                'total' => $supportSlots,
                'available' => $supportSlots - $assignedSupportSlots,
            ],
            'complaint' => [
                'total' => $complaintSlots,
                'available' => $complaintSlots - $assignedComplaintSlots,
            ]
        ]);
    }

    /**
     * Tạo thêm slot agent mới
     */
    public function createAgentSlot(Request $request)
    {
        // if ($request->user()->cannot('employees.create')) {
        //     abort(403, 'Bạn không có quyền tạo vị trí mới.');
        // }

        $validatedData = $request->validate([
            'display_name' => 'required|string|max:255',
            'type' => 'required|string|in:support,complaint',
        ]);

        try {
            $agent = Agent::create([
                'display_name' => $validatedData['display_name'],
                'type' => $validatedData['type'],
                'web_id' => 1,
                'status' => 'active',
            ]);

            return response()->json($agent, Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể tạo vị trí mới.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}