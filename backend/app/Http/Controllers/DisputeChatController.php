<?php
// app/Http/Controllers/DisputeChatController.php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\ChatRoom;
use App\Models\Agent;
use App\Events\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisputeChatController extends Controller
{
    /**
     * Lấy thông tin phòng chat cho một khiếu nại, hoặc tạo mới nếu chưa có.
     */
    public function getOrCreateChatRoom(Request $request, $disputeId)
    {
        $user = auth()->user();
        $dispute = Dispute::findOrFail($disputeId);

        // Kiểm tra quyền: Chỉ người tạo khiếu nại hoặc người có quyền xử lý
        if ($user->id !== $dispute->user_id && !$user->can('product_reports.edit')) {
            return response()->json(['success' => false, 'message' => 'Không có quyền truy cập.'], 403);
        }

        // === SỬA ĐỔI QUAN TRỌNG: SỬ DỤNG firstOrCreate ĐỂ TRÁNH RACE CONDITION ===
        $chatRoom = ChatRoom::firstOrCreate(
            ['dispute_id' => $dispute->id], // Điều kiện để tìm kiếm
            [ // Dữ liệu để tạo mới nếu không tìm thấy
                'name'     => 'Khiếu nại #' . $dispute->id,
                'type'     => 'complaint',
                'status'   => 'pending_assignment', // Trạng thái ban đầu
            ]
        );

        // Kiểm tra xem phòng chat vừa được tạo hay vừa được tìm thấy
        if ($chatRoom->wasRecentlyCreated) {
            // Nếu phòng chat MỚI được tạo, thực hiện logic gán agent và thêm người tham gia
            DB::transaction(function () use ($chatRoom, $dispute) {
                // 1. Tìm một nhân viên xử lý khiếu nại ('complaint')
                $agent = Agent::query()
                    ->where('type', 'complaint')
                    ->where('status', 'active')
                    ->whereHas('assignedUser')
                    ->inRandomOrder()
                    ->first();

                $agentUser = $agent ? $agent->assignedUser : null;

                // 2. Cập nhật agent cho phòng chat
                if ($agent) {
                    $chatRoom->agent_id = $agent->id;
                    $chatRoom->status = 'assigned';
                    $chatRoom->save();
                }

                // 3. Thêm các bên vào phòng chat
                $customer = $dispute->user;
                // Dùng syncWithoutDetaching để tránh lỗi nếu participant đã tồn tại
                $chatRoom->participants()->syncWithoutDetaching([
                    $customer->id => ['role' => 'customer']
                ]);

                if ($agentUser) {
                    $chatRoom->participants()->syncWithoutDetaching([
                        $agentUser->id => ['role' => 'agent']
                    ]);
                }

                // Bắn sự kiện để Node.js thêm các thành viên vào phòng trên Socket server
                event(new SystemNotification('CHAT_ROOM_CREATED', [
                    'roomId'     => $chatRoom->id,
                    'customerId' => $customer->id,
                    'agentId'    => $agentUser?->id,
                ]));
            });
        }

        // Tải các dữ liệu cần thiết để trả về cho frontend
        $chatRoom->load(['messages.sender', 'participants', 'agent.assignedUser']);

        $agentUserDetails = $chatRoom->agent?->assignedUser;
        $agentInfoForClient = $agentUserDetails ? [
            'id' => $agentUserDetails->id,
            'username' => $agentUserDetails->username,
            'avatar_url' => $agentUserDetails->avatar_url,
        ] : null;

        return response()->json([
            'success' => true,
            'data' => [
                'roomInfo' => $chatRoom,
                'messages' => $chatRoom->messages,
                'participants' => $chatRoom->participants,
                'agentDetails' => $agentInfoForClient,
            ]
        ]);
    }
}
