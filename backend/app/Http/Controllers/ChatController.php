<?php
// PHIÊN BẢN HOÀN CHỈNH - FINAL VERSION

namespace App\Http\Controllers;

use App\Events\SystemNotification;
use App\Models\Agent;
use App\Models\ChatRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ChatController extends Controller
{
    /**
     * Xử lý yêu cầu tạo phòng chat từ client.
     * Đây là nơi xử lý logic nghiệp vụ chính: tạo phòng, tìm nhân viên, và thông báo cho NodeJS.
     */
    public function requestChat(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['support', 'complaint'])],
        ]);

        $customer = auth()->user();

        $chatRoom = DB::transaction(function () use ($validated, $customer) {
            $existingRoom = $customer->chatRooms()
                ->where('type', $validated['type'])
                ->whereIn('status', ['open', 'assigned', 'pending_assignment'])
                ->first();

            if ($existingRoom) {
                return $existingRoom;
            }

            $agent = $this->findAvailableAgent($validated['type']);

            $newRoom = ChatRoom::create([
                'name' => 'Chat với ' . $customer->username,
                'type' => $validated['type'],
                'status' => $agent ? 'assigned' : 'pending_assignment',
                'agent_id' => $agent ? $agent->id : null,
                'created_by' => $customer->id,
            ]);

            $newRoom->participants()->attach($customer->id, ['role' => 'customer']);

            if ($agent && $agent->assignedUser) {
                $newRoom->participants()->attach($agent->assignedUser->id, ['role' => 'agent']);
            }

            return $newRoom;
        });

        $chatRoom->load(['messages', 'participants', 'agent.assignedUser.employee']);

        // Gửi sự kiện lên Redis để NodeJS biết có phòng mới và ai là người tham gia
        // để thực hiện việc "tham gia thầm lặng" (silent join).
        $customerDetails = $chatRoom->participants->where('pivot.role', 'customer')->first();
        $agentUser = $chatRoom->agent?->assignedUser;

        $redisPayload = [
            'roomId' => $chatRoom->id,
            'customerId' => $customerDetails->id,
            'agentId' => $agentUser?->id,
        ];

        event(new SystemNotification('CHAT_ROOM_CREATED', $redisPayload));

        // Chuẩn bị dữ liệu trả về cho client đã yêu cầu API
        $agentDetails = null;
        if ($agentUser) {
            $agentDetails = [
                'id' => $agentUser->id,
                'username' => $agentUser->username,
                'avatar_url' => $agentUser->avatar_url,
                'job_title' => optional($agentUser->employee)->job_title ?? 'Nhân viên Hỗ trợ',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'roomInfo' => $chatRoom,
                'messages' => $chatRoom->messages,
                'participants' => $chatRoom->participants,
                'agentDetails' => $agentDetails,
            ]
        ]);
    }

    private function findAvailableAgent(string $type)
    {
        return Agent::query()
            ->active()
            ->ofType($type)
            ->assigned()
            ->with('assignedUser.employee')
            ->inRandomOrder()
            ->first();
    }
}