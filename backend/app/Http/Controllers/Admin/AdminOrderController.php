<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class AdminOrderController extends Controller
{
 public function index(Request $request)
    {
        try {
            // Validate request parameters for filtering and sorting
            $request->validate([
                'search' => 'sometimes|string|max:100',
                'status' => 'sometimes|in:0,1,2',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'min_amount' => 'sometimes|numeric|min:0',
                'max_amount' => 'sometimes|numeric|gte:min_amount',
                'sort_by' => 'sometimes|in:created_at,total_amount',
                'sort_direction' => 'sometimes|in:asc,desc',
            ]);

            // Start building the query with essential relationships
            $query = Order::with('items.product.gameAttributes', 'items.product.images', 'user');

            // Combined search for order_code or user's username
            $query->when($request->filled('search'), function ($q) use ($request) {
                $searchTerm = '%' . $request->search . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('order_code', 'like', $searchTerm)
                             ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                                 $userQuery->where('username', 'like', $searchTerm);
                             });
                });
            });

            // Filter by status
            $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));
            
            // Filter by date range
            $query->when($request->filled('start_date'), fn($q) => $q->whereDate('created_at', '>=', $request->start_date));
            $query->when($request->filled('end_date'), fn($q) => $q->whereDate('created_at', '<=', $request->end_date));

            // Filter by total amount range
            $query->when($request->filled('min_amount'), fn($q) => $q->where('total_amount', '>=', $request->min_amount));
            $query->when($request->filled('max_amount'), fn($q) => $q->where('total_amount', '<=', $request->max_amount));

            // Handle sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);
            
            // Paginate the results
            $orders = $query->paginate(15)->withQueryString();

            return response()->json([
                "status" => true,
                "message" => "Lấy danh sách đơn hàng thành công",
                "data" => $orders
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                "message" => "Lấy danh sách đơn hàng thất bại",
                "error" => $e->getMessage()
            ], 500);
        }
    }
    public function show($id){
        try {
            $order = Order::where('id',$id)->with('items.product.category')->with("items.product.gameAttributes")->with("items.product.images")->with("user")->with("walletTransaction")->first();
            return response()->json([
                "status"=>True,
                "message"=>"Lấy chi tiết đơn hàng thành công",
                "data"=>$order
            ],200); 
        } catch (\Throwable $th) {
            return response()->json([
                "status"=>False,
                "message"=>"Lấy chi tiết đơn hàng thất bại",
                "data"=>[]
            ],500);
        }
    }
}
