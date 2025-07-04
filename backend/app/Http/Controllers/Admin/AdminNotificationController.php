<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\GlobalNotification;
use App\Models\UserGlobalNotificationStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdminNotificationController extends Controller
{
    /**
     * Lấy danh sách thông báo cho người dùng hiện tại.
     * Nếu người dùng đã đăng nhập, sẽ bao gồm thông báo cá nhân và thông báo chung (kèm trạng thái đã đọc).
     * Nếu người dùng chưa đăng nhập, chỉ trả về các thông báo chung đang hoạt động.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNotificationsForUser(Request $request)
    {
        $user = Auth::user();
        $response = [
            'message' => 'Danh sách thông báo',
            'personal_notifications' => [],
            'global_notifications' => []
        ];

        // Lấy các thông báo chung đang hoạt động
        $globalNotifications = GlobalNotification::active()
                                ->orderBy('published_at', 'desc')
                                ->get();

        if ($user) {
            // Nếu người dùng đã đăng nhập, lấy thông báo cá nhân
            $personalNotifications = Notification::where('user_id', $user->id)
                                    ->orderBy('published_at', 'desc')
                                    ->get();
                                

            // Lấy trạng thái đã đọc của các thông báo chung cho người dùng hiện tại
            $readGlobalNotificationIds = UserGlobalNotificationStatus::where('user_id', $user->id)
                                        ->pluck('global_notification_id')
                                        ->toArray();

            // Kết hợp thông báo chung với trạng thái đã đọc
            $globalNotificationsWithStatus = $globalNotifications->map(function ($notification) use ($readGlobalNotificationIds) {
                $notification->is_read = in_array($notification->id, $readGlobalNotificationIds);
                return $notification;
            });

            $response['personal_notifications'] = $personalNotifications;
            $response['global_notifications'] = $globalNotificationsWithStatus;
            $response['message'] = 'Danh sách thông báo cá nhân và thông báo chung cho người dùng đã đăng nhập.';
        
        } else {
            // Nếu người dùng chưa đăng nhập, chỉ trả về thông báo chung (không có trạng thái đã đọc)
            $response['global_notifications'] = $globalNotifications->map(function ($notification) {
                $notification->is_read = false; // Mặc định là chưa đọc cho khách
                return $notification;
            });
            $response['message'] = 'Danh sách thông báo chung cho khách.';
        }

        return response()->json($response);
    }

    /**
     * Thêm một thông báo cá nhân mới cho một người dùng cụ thể.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addPersonalNotification(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'user_id' => 'required|exists:users,id',
                'type' => 'required|',
                'content' => 'required|string',
                'link' => 'nullable|max:255',
                'published_at' => 'nullable|date',
                'expires_at' => 'nullable|date|after_or_equal:published_at',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Đặt published_at mặc định là thời gian hiện tại nếu không được cung cấp
        if (!isset($validatedData['published_at'])) {
            $validatedData['published_at'] = now();
        }

        $notification = Notification::create($validatedData);

        return response()->json([
            'message' => 'Thông báo cá nhân đã được thêm thành công.',
            'data' => $notification
        ], 201);
    }

    /**
     * Thêm một thông báo chung mới.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addGlobalNotification(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'type' => 'required|max:255',
                'message' => 'required|string',
                'link' => 'nullable|max:255',
                'published_at' => 'nullable|date',
                'expires_at' => 'nullable|date|after_or_equal:published_at',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Đặt published_at mặc định là thời gian hiện tại nếu không được cung cấp
        if (!isset($validatedData['published_at'])) {
            $validatedData['published_at'] = now();
        }

        $globalNotification = GlobalNotification::create($validatedData);

        return response()->json([
            'message' => 'Thông báo chung đã được thêm thành công.',
            'data' => $globalNotification
        ], 201);
    }

    /**
     * Cập nhật một thông báo cá nhân.
     * Có thể dùng để đánh dấu đã đọc hoặc sửa nội dung.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id ID của thông báo cá nhân
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePersonalNotification(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['message' => 'Thông báo cá nhân không tìm thấy.'], 404);
        }
        try {
            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'link' => 'nullable|url|max:255',
                'is_read' => 'sometimes|boolean',
                'expires_at' => 'nullable|date|after_or_equal:published_at',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $notification->update($validatedData);

        return response()->json([
            'message' => 'Thông báo cá nhân đã được cập nhật thành công.',
            'data' => $notification
        ]);
    }

    /**
     * Cập nhật một thông báo chung.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id ID của thông báo chung
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateGlobalNotification(Request $request, $id)
    {
        $globalNotification = GlobalNotification::find($id);

        if (!$globalNotification) {
            return response()->json(['message' => 'Thông báo chung không tìm thấy.'], 404);
        }

        try {
            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'message' => 'sometimes|required|string',
                'link' => 'nullable|url|max:255',
                'published_at' => 'sometimes|required|date',
                'expires_at' => 'nullable|date|after_or_equal:published_at',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $globalNotification->update($validatedData);

        return response()->json([
            'message' => 'Thông báo chung đã được cập nhật thành công.',
            'data' => $globalNotification
        ]);
    }

    /**
     * Đánh dấu một thông báo chung là đã đọc cho người dùng hiện tại.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $globalNotificationId ID của thông báo chung
     * @return \Illuminate\Http\JsonResponse
     */
    public function markGlobalNotificationAsRead(Request $request, $globalNotificationId)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Người dùng chưa đăng nhập.'], 401);
        }

        $globalNotification = GlobalNotification::find($globalNotificationId);

        if (!$globalNotification) {
            return response()->json(['message' => 'Thông báo chung không tìm thấy.'], 404);
        }

        // Tạo hoặc cập nhật trạng thái đã đọc
        UserGlobalNotificationStatus::updateOrCreate(
            [
                'user_id' => $user->id,
                'global_notification_id' => $globalNotificationId
            ],
            [
                'read_at' => now()
            ]
        );

        return response()->json([
            'message' => 'Thông báo chung đã được đánh dấu là đã đọc.'
        ]);
    }
}
