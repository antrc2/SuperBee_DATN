<?php

// app/Http/Controllers/Api/DisputeController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dispute;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Exception;
class DisputeController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_item_id' => 'required|integer|exists:order_items,id',
            'dispute_type' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'attachments' => 'nullable|array',
            'attachments.*' => 'image|mimes:jpeg,png,jpg|max:2048' // Tối đa 2MB mỗi ảnh
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $orderItem = OrderItem::with('order')->findOrFail($request->order_item_id);

        // Security check: Đảm bảo người dùng đang khiếu nại đúng đơn hàng của họ
        if ($orderItem->order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Security check: Kiểm tra xem đã có khiếu nại cho item này chưa
        if (Dispute::where('order_item_id', $orderItem->id)->exists()) {
             return response()->json(['message' => 'Sản phẩm này đã được khiếu nại trước đó.'], 409);
        }

        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('disputes', 'public');
                $attachmentPaths[] = $path;
            }
        }

        $dispute = Dispute::create([
            'user_id' => Auth::id(),
            'order_item_id' => $orderItem->id,
            'dispute_type' => $request->dispute_type,
            'description' => $request->description,
            'attachments' => json_encode($attachmentPaths),
            'status' => 0, // Pending
        ]);

        return response()->json($dispute, 201);
    }
     public function index(Request $request)
    {
        try {
            $query = Dispute::with([
                'user:id,username,email', 
                'orderItem.order:id,order_code',
                'orderItem.product:id,sku'
            ]);

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }
            
            if ($request->filled('search')) {
                $searchTerm = '%' . $request->search . '%';
                $query->where(function($q) use ($searchTerm) {
                    $q->whereHas('orderItem.order', function($subq) use ($searchTerm) {
                        $subq->where('order_code', 'like', $searchTerm);
                    })->orWhereHas('user', function($subq) use ($searchTerm) {
                        $subq->where('email', 'like', $searchTerm)->orWhere('username', 'like', $searchTerm);
                    })->orWhereHas('orderItem.product', function($subq) use ($searchTerm) {
                        $subq->where('sku', 'like', 'searchTerm');
                    });
                });
            }

            $disputes = $query->latest()->paginate(15);

            return response()->json($disputes);

        } catch (Exception $e) {
            Log::error('Admin DisputeController Index Error: ' . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi từ máy chủ, không thể tải danh sách khiếu nại.'], 500);
        }
    }

    public function show($id)
    {
        try {
            // Sửa đổi: Tìm Dispute bằng id thay vì route model binding
            $dispute = Dispute::findOrFail($id);
            
            $dispute->load([
                'user:id,username,email',
                'orderItem.order',
                'orderItem.product.credentials',
            ]);

            return response()->json($dispute);

        } catch (Exception $e) {
            // Sửa đổi: Ghi log với $id
            Log::error("Admin DisputeController Show Error for Dispute ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi từ máy chủ, không thể tải chi tiết khiếu nại.'], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in([1, 2, 3])],
            'resolution' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Sửa đổi: Tìm Dispute bằng id thay vì route model binding
            $dispute = Dispute::findOrFail($id);

            $dispute->status = $request->status;
            $dispute->resolution = $request->resolution;
            $dispute->save();

            $dispute->load('user:id,username,email', 'orderItem.order:id,order_code', 'orderItem.product:id,sku');

            return response()->json($dispute);

        } catch (Exception $e) {
            // Sửa đổi: Ghi log với $id
            Log::error("Admin DisputeController Update Error for Dispute ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã có lỗi từ máy chủ, không thể cập nhật khiếu nại.'], 500);
        }
    }
}