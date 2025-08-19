<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\Product;
use App\Models\Withdraw;
use App\Models\RechargesBank;
use App\Models\RechargesCard;
use App\Models\AffiliateHistory;
use App\Models\OrderItem;
use App\Models\RechargeBank;
use App\Models\RechargeCard;

class DashboardController extends Controller
{

    public function getDashboardData(Request $request)
    {
        try {
            $period = $request->input('period', 'week');
            // $statsStartDate; $statsEndDate; $chartsStartDate; $chartsEndDate;

            if ($request->has('start_date') || $request->has('end_date')) {
                $dates = $this->_validateAndParseDateRange($request);
                $statsStartDate = $chartsStartDate = $dates['startDate'];
                $statsEndDate = $chartsEndDate = $dates['endDate'];
            } else {
                
                $statsStartDate = Carbon::today()->startOfDay();         // KPIs của hôm nay
                $statsEndDate = Carbon::today()->endOfDay();
                $chartsStartDate = Carbon::now()->subDays(6)->startOfDay(); // Biểu đồ của 7 ngày
                $chartsEndDate = Carbon::now()->endOfDay();
            }

            $basicStatsData = $this->_getStatsForDateRangeLogic($statsStartDate, $statsEndDate);
            $financialStats = $this->_getFinancialStatsLogic($statsStartDate, $statsEndDate);
            $salesPerformanceStats = $this->_getSalesPerformanceStatsLogic();
            $chartsData = $this->_getChartDataLogic($period, $chartsStartDate, $chartsEndDate);
            $gameRevenueComparison = $this->_getGameRevenueComparisonLogic($chartsStartDate, $chartsEndDate);

            $todayRevenueObject = ['original' => ['success' => true, 'data' => $basicStatsData], 'exception' => null];

            return response()->json([
                'status' => true,
                'message' => 'lấy ra dữ liệu thành công',
                'data' => [
                    'todayRevenue' => $todayRevenueObject,
                    'charts' => $chartsData,
                    'detailed_stats' => [
                        'financial' => $financialStats,
                        'sales_performance' => $salesPerformanceStats,
                    ],
                    'game_comparison_chart' => $gameRevenueComparison,
                ]
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Lỗi getDashboardData: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'đã xảy ra lỗi hệ thống'], 500);
        }
    }


    public function getFinancialStats(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true); // true = cho phép mặc định 7 ngày
        $data = $this->_getFinancialStatsLogic($dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => $data]);
    }


    public function getSalesPerformanceStats()
    {
        $data = $this->_getSalesPerformanceStatsLogic();
        return response()->json(['status' => true, 'data' => $data]);
    }

    public function getChartData(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
        $request->validate(['period' => 'sometimes|in:week,month,year']);
        $period = $request->input('period', 'week');
        $data = $this->_getChartDataLogic($period, $dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => $data]);
    }

    public function getGameRevenueComparison(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
        $data = $this->_getGameRevenueComparisonLogic($dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => $data]);
    }

    private function _validateAndParseDateRange(Request $request, bool $defaultTo7Days = false): array
    {
        if (!$request->has('start_date') && !$request->has('end_date') && $defaultTo7Days) {
            return [
                'startDate' => Carbon::now()->subDays(6)->startOfDay(),
                'endDate'   => Carbon::now()->endOfDay(),
            ];
        }

        $rules = [ 'start_date' => 'required|date_format:Y-m-d', 'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date' ];
        $messages = [
            'start_date.required'     => 'Bạn chưa nhập ngày bắt đầu.',
            'start_date.date_format'  => 'Ngày bắt đầu phải có định dạng YYYY-MM-DD.',
            'end_date.required'       => 'Bạn chưa nhập ngày kết thúc.',
            'end_date.date_format'    => 'Ngày kết thúc phải có định dạng YYYY-MM-DD.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
        ];
        $validatedData = $request->validate($rules, $messages);

        return [
            'startDate' => Carbon::parse($validatedData['start_date'])->startOfDay(),
            'endDate'   => Carbon::parse($validatedData['end_date'])->endOfDay(),
        ];
    }

    private function _getFinancialStatsLogic(Carbon $startDate, Carbon $endDate): array
    {
        $totalRevenue = Order::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('total_amount');
        $totalProfit = Order::where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->join('order_items', 'orders.id', '=', 'order_items.order_id')->join('products', 'order_items.product_id', '=', 'products.id')->sum(DB::raw('products.price - products.import_price'));
        $bankDeposits = RechargeBank::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $cardDeposits = RechargeCard::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $pendingWithdrawals = Withdraw::where('status', 0)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $totalAffiliatePayouts = AffiliateHistory::whereBetween('created_at', [$startDate, $endDate])->sum('commission_amount');
        $averageOrderValue = Order::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->avg('total_amount');
        
        return [
            'total_revenue' => (float) $totalRevenue,
            'total_profit' => (float) $totalProfit,
            'total_deposits' => (float) ($bankDeposits + $cardDeposits),
            'pending_withdrawals' => (float) $pendingWithdrawals,
            'total_affiliate_payouts' => (float) $totalAffiliatePayouts,
            'average_order_value' => (float) $averageOrderValue,
        ];
    }

    private function _getSalesPerformanceStatsLogic(): array
    {
        $totalProducts = Product::count();
        $soldProductIds = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')->where('orders.status', 1)->pluck('product_id')->unique();
        $soldProductsCount = $soldProductIds->count();
        
        return [
            'total_products' => (int) $totalProducts,
            'sold_products' => (int) $soldProductsCount,
            'unsold_products' => (int) ($totalProducts - $soldProductsCount),
        ];
    }

    private function _getStatsForDateRangeLogic(Carbon $startDate, Carbon $endDate): array
    {
        $revenue = Order::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('total_amount');
        $orderCount = Order::where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->count();
        $newUsersCount = User::whereBetween('created_at', [$startDate, $endDate])->count();
        
        return [
            'today_revenue'     => (float) $revenue,
            'today_order_count' => (int) $orderCount,
            'today_new_users'   => (int) $newUsersCount,
        ];
    }

    private function _getChartDataLogic(string $period, Carbon $startDate, Carbon $endDate): array
    {
        $revenueOverTimeQuery = Order::where('status', 1)->whereBetween('created_at', [$startDate, $endDate]);
        switch ($period) {
            case 'year':
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(created_at, '%Y-%m') as label"), DB::raw("SUM(total_amount) as value"))->groupBy('label')->orderBy('label');
                break;
            default:
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(created_at, '%d/%m') as label"), DB::raw("SUM(total_amount) as value"))->groupBy('label')->orderByRaw('MIN(created_at)');
                break;
        }
        $revenueOverTime = $revenueOverTimeQuery->get();
        
        $revenueByCategory = Category::select('categories.name as label', DB::raw('SUM(orders.total_amount) as value'))
            ->join('products', 'categories.id', '=', 'products.category_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('categories.name', ['Liên Quân', 'Free Fire'])
            ->groupBy('categories.name')
            ->get();
            
        return [
            'revenue_over_time' => $revenueOverTime,
            'revenue_by_category' => $revenueByCategory
        ];
    }
    
    private function _getGameRevenueComparisonLogic(Carbon $startDate, Carbon $endDate): array
    {
        $results = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereIn('categories.name', ['Liên Quân', 'Free Fire'])
            ->select(
                DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m-%d') as full_date"), // Sắp xếp theo ngày đầy đủ
                DB::raw("DATE_FORMAT(orders.created_at, '%d/%m') as date_label"),
                'categories.name as game_name',
                DB::raw('SUM(order_items.unit_price) as daily_revenue')
            )
            ->groupBy('full_date', 'date_label', 'game_name')
            ->orderBy('full_date')
            ->get();

        $labels = [];
        $datasets = [
            ['label' => 'Liên Quân', 'data' => []],
            ['label' => 'Free Fire', 'data' => []],
        ];

        $lienQuanData = [];
        $freeFireData = [];
        $uniqueLabels = [];

        foreach ($results as $row) {
            $uniqueLabels[$row->date_label] = true;
            if ($row->game_name === 'Liên Quân') {
                $lienQuanData[$row->date_label] = $row->daily_revenue;
            } else {
                $freeFireData[$row->date_label] = $row->daily_revenue;
            }
        }
        
        $labels = array_keys($uniqueLabels);

        foreach ($labels as $label) {
            $datasets[0]['data'][] = (float) ($lienQuanData[$label] ?? 0);
            $datasets[1]['data'][] = (float) ($freeFireData[$label] ?? 0);
        }

        return ['labels' => $labels, 'datasets' => $datasets];
    }
}