<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator; 
use Carbon\Carbon; 

class DashboardController extends Controller
{

    public function getDashboardData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date_format:Y-m-d',
            'end_date'   => 'required|date_format:Y-m-d|after_or_equal:start_date',
            'period'     => 'sometimes|in:week,month,year' 
        ]);

        // Nếu xác thực thất bại, trả về lỗi 422 (Unprocessable Entity) với thông tin chi tiết.
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đầu vào không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $period = $request->input('period', 'week');
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay(); 
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $stats = $this->getDashboardStats($startDate, $endDate);

            $charts = $this->getChartData($period, $startDate, $endDate);

           
            return response()->json([
                'success' => true,
                'message' => 'Lấy dữ liệu tổng quan thành công.',
                'data' => [
                    'stats' => $stats,   // Đối tượng chứa các chỉ số thống kê.
                    'charts' => $charts  // Đối tượng chứa dữ liệu cho các biểu đồ.
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.',
            ], 500);
        }
    }
    public function getDashboardStats(Carbon $startDate, Carbon $endDate): array
    {
        
        $revenue = Order::where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_amount');

        $orderCount = Order::where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $newUsersCount = User::whereBetween('created_at', [$startDate, $endDate])
            ->count();

       
        return [
            'total_revenue'   => (float) $revenue,       //Tổng doanh thu.
            'total_orders'    => (int) $orderCount,       //Tổng số đơn hàng.
            'total_new_users' => (int) $newUsersCount,     //Tổng số người dùng mới.
        ];
    }


    public function getChartData(string $period, Carbon $startDate, Carbon $endDate): array
    {

        $revenueOverTimeQuery = Order::where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate]);

       
        switch ($period) {
            case 'year':
                $revenueOverTimeQuery->select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as label"), 
                    DB::raw("SUM(total_amount) as value")
                )->groupBy('label')->orderBy('label');
                break;

            case 'month':
            case 'week':
            default:
                
                $revenueOverTimeQuery->select(
                    DB::raw("DATE_FORMAT(created_at, '%d/%m') as label"), 
                    DB::raw("SUM(total_amount) as value")
                )->groupBy('label')->orderByRaw('MIN(created_at)');
                break;
        }

        $revenueOverTime = $revenueOverTimeQuery->get();

        // === BIỂU ĐỒ DOANH THU THEO DANH MỤC ===
        $revenueByCategory = Category::select('categories.name as label', DB::raw('SUM(orders.total_amount) as value'))
            ->join('products', 'categories.id', '=', 'products.category_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate]) 
            ->whereIn('categories.name', ['Liên Quân', 'Free Fire']) 
            ->groupBy('categories.name')
            ->orderBy('value', 'desc') 
            ->get();

        return [
            'revenue_over_time' => $revenueOverTime,
            'revenue_by_category' => $revenueByCategory
        ];
    }
}