<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentChatController extends Controller
{
    /**
     * API: Lấy danh sách các cuộc trò chuyện được gán cho nhân viên.
     * Sắp xếp theo tin nhắn mới nhất và tính toán số tin nhắn chưa đọc.
     */
    public function getChatList(Request $request)
    {
        $agentUser = auth()->user();

        // Query cơ bản để lấy các phòng chat
        $chatRoomsQuery = ChatRoom::query();

        // Nếu người dùng không phải admin, chỉ lấy các phòng được gán cho họ
        if (!$agentUser->hasRole(['admin-super', 'admin'])) {
            $agentAssignment = $agentUser->agentAssignment;
            if (!$agentAssignment) {
                // Nếu nhân viên không được gán vào vị trí nào, trả về danh sách rỗng
                return response()->json(['success' => true, 'data' => []]);
            }
            $chatRoomsQuery->where('agent_id', $agentAssignment->agent_id);
        }

        // Lấy danh sách phòng cùng với thông tin khách hàng và tin nhắn cuối cùng
        $chatRooms = $chatRoomsQuery->with([
            'participants' => function ($query) {
                $query->where('role', 'customer');
            },
            'latestMessage'
        ])
        ->where('status', '!=', 'closed') // Chỉ lấy các phòng chưa đóng
        ->orderBy('updated_at', 'desc') // Sắp xếp theo cập nhật mới nhất
        ->get();

        // Định dạng lại dữ liệu để trả về cho Frontend
        $formattedChats = $chatRooms->map(function ($room) use ($agentUser) {
            $customer = $room->participants->first();
            
            // Lấy ID tin nhắn cuối cùng mà nhân viên đã đọc trong phòng này
            $lastReadMessageId = DB::table('chat_room_participants')
                                    ->where('chat_room_id', $room->id)
                                    ->where('user_id', $agentUser->id)
                                    ->value('last_read_message_id');

            // Đếm số tin nhắn mới hơn tin nhắn đã đọc cuối cùng và không phải do mình gửi
            $unreadCount = $room->messages()
                                ->where('id', '>', $lastReadMessageId ?? 0)
                                ->where('sender_id', '!=', $agentUser->id)
                                ->count();

            return [
                'roomId' => $room->id,
                'customerName' => optional($customer)->username ?? 'Khách hàng',
                'customerAvatar' => optional($customer)->avatar_url,
                'lastMessage' => optional($room->latestMessage)->content ?? 'Bắt đầu cuộc trò chuyện...',
                'unreadCount' => $unreadCount,
                'roomUpdatedAt' => $room->updated_at->toIso8601String(),
            ];
        });

        return response()->json(['success' => true, 'data' => $formattedChats]);
    }

    /**
     * API: Lấy chi tiết một cuộc trò chuyện và đánh dấu là đã đọc.
     */
    public function getChatDetails($roomId, Request $request)
    {
        $agentUser = $request->user();
        $chatRoom = ChatRoom::find($roomId);

        if (!$chatRoom) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy phòng chat.'], 404);
        }

        // Tải toàn bộ tin nhắn và người gửi
        $chatRoom->load(['messages.sender']);

        // Hành động quan trọng: Cập nhật `last_read_message_id` thành ID của tin nhắn cuối cùng
        // để đánh dấu tất cả là đã đọc
        $lastMessage = $chatRoom->messages->last();
        if ($lastMessage) {
            DB::table('chat_room_participants')
                ->where('chat_room_id', $chatRoom->id)
                ->where('user_id', $agentUser->id)
                ->update(['last_read_message_id' => $lastMessage->id]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'messages' => $chatRoom->messages,
                'roomInfo' => $chatRoom,
            ]
        ]);
    }
}