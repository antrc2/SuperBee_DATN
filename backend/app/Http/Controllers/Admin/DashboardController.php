<?php

    namespace App\Http\Controllers\Admin;

    use App\Http\Controllers\Controller;
    use App\Models\Category;
    use Illuminate\Http\Request;
    use App\Models\Order;
    use App\Models\Product;
    use App\Models\User;
    use Illuminate\Support\Facades\DB;

    class DashboardController extends Controller
    {
        public function getTodayRevenue()
        {
            try {
                $todayRevenue = Order::Where('status', 1)->whereDate('created_at', today())
                    ->sum('total_amount');

                $todayOrder = Order::where('status', 1)->whereDate('created_at', today())
                    ->count();

                $todayNewUsers = User::whereDate('created_at', today())
                    ->count();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'today_revenue' => (float) $todayRevenue,
                        'today_order_count' => (int) $todayOrder,
                        'today_new_users' => (int) $todayNewUsers,
                    ],
                ])->setStatusCode(200);
            } catch (\Throwable $e) {
                return response()->json(
                    [
                        'error' => 'đã xảy ra lỗi '
                    ],
                    500
                );
            }
        }

        public function getDashboardData(Request $request)
        {
            try {
                $period = $request->input('period', 'week');
                $TodayRevenue = $this->getTodayRevenue();
                $charts = $this->getChartData($period);
                return response()->json([
                    'status' => true,
                    'message' => 'lấy ra dữ liệu thành công',
                    'data' => [
                        'todayRevenue' => $TodayRevenue,
                        'charts' => $charts
                    ]
                ], 200);
            } catch (\Throwable $e) {
                return response()->json([
                    'error' => 'đã xảy ra lỗi',
                ], 500);
            }
        }
        public function getChartData($period)
        {
            try {
                $revenueOverTimeQuery = Order::where('status', 1);

                switch ($period) {
                    case 'year':
                        $revenueOverTimeQuery->where('created_at', '>=', now()->subMonths(11)->startOfMonth());
                        $revenueOverTimeQuery->select(
                            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as label"),
                            DB::raw("SUM(total_amount) as value")
                        )->groupBy('label')->orderBy('label');
                        break;

                    case 'month':
                        $revenueOverTimeQuery->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
                        $revenueOverTimeQuery->select(
                            DB::raw("DATE_FORMAT(created_at, '%d/%m') as label"), // Nhãn: "15/08"
                            DB::raw("SUM(total_amount) as value")
                        )->groupBy('label')->orderByRaw('MIN(created_at)');
                        break;

                    case 'week':
                    default:
                        $revenueOverTimeQuery->whereDate('created_at', '>=', now()->subDays(6));
                        $revenueOverTimeQuery->select(
                            DB::raw("DATE_FORMAT(created_at, '%d/%m') as label"), // Nhãn: "15/08"
                            DB::raw("SUM(total_amount) as value")
                        )->groupBy('label')->orderByRaw('MIN(created_at)');
                        break;
                }

                $revenueOverTime = $revenueOverTimeQuery->get();
                $revenueByCategory = Category::select('categories.name as label', DB::raw('SUM(orders.total_amount) as value'))
                    ->join('products', 'categories.id', '=', 'products.category_id')
                    ->join('order_items', 'products.id', '=', 'order_items.product_id')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', 1)
                    ->whereMonth('orders.created_at', now()->month)
                    ->whereYear('orders.created_at', now()->year)
                    ->whereIn('categories.name', ['Liên Quân', 'Free Fire'])
                    ->groupBy('categories.name')
                    ->get();
                return [
                    'revenue_over_time' => $revenueOverTime,
                    'revenue_by_category' => $revenueByCategory
            ];
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'đã xảy ra lỗi',
            ], 500);
        }
    }
}
