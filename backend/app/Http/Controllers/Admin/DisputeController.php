<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Events\SystemNotification; // Thêm dòng này để gửi thông báo

class DisputeController extends Controller
{
    /**
     * Client: Tạo một khiếu nại mới.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_item_id' => 'required|integer|exists:order_items,id',
            'dispute_type' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'attachments' => 'nullable|array|max:10',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,mp4,mov,webm|max:51200'
        ], [
            'attachments.max' => 'Chỉ được tải lên tối đa 10 tệp.',
            'attachments.*.mimes' => 'Định dạng tệp không được hỗ trợ.',
            'attachments.*.max' => 'Kích thước mỗi tệp không được vượt quá 50MB.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $orderItem = OrderItem::with('order')->findOrFail($request->order_item_id);

        if ($orderItem->order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (Dispute::where('order_item_id', $orderItem->id)->exists()) {
            return response()->json(['message' => 'Sản phẩm này đã được khiếu nại trước đó.'], 409);
        }

        $files = $request->file('attachments');
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            $response = $this->uploadFiles($files, 'dispute_attachments/');
            foreach ($response as $file) {
                $attachmentPaths[] = $file['url'];
            }
        }

        $dispute = Dispute::create([
            'user_id' => Auth::id(),
            'order_item_id' => $orderItem->id,
            'dispute_type' => $request->dispute_type,
            'description' => $request->description,
            'attachments' => $attachmentPaths,
            'status' => 0, // 0: Chờ xử lý
        ]);

        return response()->json(['success' => true, 'data' => $dispute], 201);
    }

    // =================================================================
    //                    PHẦN DÀNH CHO ADMIN
    // =================================================================

    /**
     * Admin: Lấy danh sách tất cả khiếu nại.
     */
    public function adminIndex(Request $request)
    {
        $disputes = Dispute::with(['user:id,username', 'orderItem.product:id,sku'])
            ->latest()
            ->paginate(15);

        return response()->json(['success' => true, 'data' => $disputes]);
    }

    /**
     * Admin: Lấy chi tiết một khiếu nại.
     */
    public function show($id)
    {
        $dispute = Dispute::with(['user', 'orderItem.product', 'orderItem.order'])->find($id);

        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khiếu nại.'], 404);
        }

        return response()->json(['success' => true, 'data' => $dispute]);
    }

    /**
     * Admin: Cập nhật trạng thái và phản hồi cho một khiếu nại.
     * === ĐÃ CẬP NHẬT LOGIC TRẠNG THÁI ===
     */
    public function update(Request $request, $id)
    {
        // Định nghĩa các trạng thái
        // 0: Chờ xử lý (Pending)
        // 1: Đang xử lý (Processing)
        // 2: Hoàn thành (Resolved)
        // 3: Không chấp nhận (Rejected)
        $validator = Validator::make($request->all(), [
            'status' => 'required|integer|in:0,1,2,3',
            'resolution' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $dispute = Dispute::find($id);

        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy khiếu nại.'], 404);
        }

        $currentStatus = $dispute->status;
        $newStatus = (int)$request->status;

        // Quy tắc 1: Không thể quay lại trạng thái cũ hơn
        if ($newStatus < $currentStatus) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể quay lại trạng thái trước đó của khiếu nại.'
            ], 400); // 400 Bad Request
        }

        // Quy tắc 2: Khi đã Hoàn thành hoặc Từ chối, không thể thay đổi nữa
        if ($currentStatus == 2 || $currentStatus == 3) {
             return response()->json([
                'success' => false,
                'message' => 'Khiếu nại đã ở trạng thái cuối cùng và không thể thay đổi.'
            ], 400);
        }

        // Cập nhật dữ liệu
        $dispute->status = $newStatus;
        if ($request->filled('resolution')) {
            $dispute->resolution = $request->resolution;
        }
        $dispute->save();

        // Gửi thông báo cho người dùng về việc khiếu nại đã được cập nhật
        $notificationData = [
            'user_id' => $dispute->user_id,
            'title'   => "Khiếu nại #{$dispute->id} đã được cập nhật",
            'message' => "Trạng thái khiếu nại của bạn đã được cập nhật. Nhấn để xem chi tiết.",
            'link'    => "/user/disputes" // Link tới trang lịch sử khiếu nại của user
        ];
        event(new SystemNotification('NOTIFICATION_PRIVATE', $notificationData));


        return response()->json(['success' => true, 'data' => $dispute]);
    }
}
