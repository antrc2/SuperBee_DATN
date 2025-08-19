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
use App\Models\Review;

class DashboardController extends Controller
{
    //======================================================================
    // HÀM API TỔNG HỢP
    //======================================================================
    public function getDashboardData(Request $request)
    {
        try {
            $period = $request->input('period', 'week');
            $statsStartDate;
            $statsEndDate;
            $chartsStartDate;
            $chartsEndDate;

            if ($request->has('start_date') || $request->has('end_date')) {
                $dates = $this->_validateAndParseDateRange($request);
                $statsStartDate = $chartsStartDate = $dates['startDate'];
                $statsEndDate = $chartsEndDate = $dates['endDate'];
            } else {
                $statsStartDate = Carbon::today()->startOfDay();
                $statsEndDate = Carbon::today()->endOfDay();
                $chartsStartDate = Carbon::now()->subDays(6)->startOfDay();
                $chartsEndDate = Carbon::now()->endOfDay();
            }

            $basicStatsData = $this->_getStatsForDateRangeLogic($statsStartDate, $statsEndDate);
            $financialStats = $this->_getFinancialStatsLogic($statsStartDate, $statsEndDate);
            $salesPerformanceStats = $this->_getSalesPerformanceStatsLogic();
            $chartsData = $this->_getChartDataLogic($period, $chartsStartDate, $chartsEndDate);
            $gameRevenueComparison = $this->_getGameRevenueComparisonLogic($chartsStartDate, $chartsEndDate);
            $userGrowthChart = $this->_getUserGrowthChartLogic($chartsStartDate, $chartsEndDate);
            $topSpendingUsers = $this->_getTopSpendingUsersLogic($statsStartDate, $statsEndDate);
            $averageRating = $this->_getAverageRatingLogic($statsStartDate, $statsEndDate);

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
                        'average_rating' => $averageRating
                    ],
                    'game_comparison_chart' => $gameRevenueComparison,
                    'user_growth_chart' => $userGrowthChart,
                    'top_spending_users' => $topSpendingUsers
                ]
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Lỗi getDashboardData: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'đã xảy ra lỗi hệ thống'], 500);
        }
    }

    //======================================================================
    // CÁC HÀM API ĐỘC LẬP (PUBLIC)
    //======================================================================
    public function getFinancialStats(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
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

    public function getUserGrowthChart(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
        $data = $this->_getUserGrowthChartLogic($dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => $data]);
    }

    public function getTopSpendingUsers(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
        $data = $this->_getTopSpendingUsersLogic($dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => $data]);
    }

    public function getAverageRating(Request $request)
    {
        $dates = $this->_validateAndParseDateRange($request, true);
        $data = $this->_getAverageRatingLogic($dates['startDate'], $dates['endDate']);
        return response()->json(['status' => true, 'data' => ['average_rating' => $data]]);
    }

    //======================================================================
    // CÁC HÀM LOGIC CỐT LÕI VÀ HELPER (PRIVATE)
    //======================================================================
    private function _validateAndParseDateRange(Request $request, bool $defaultTo7Days = false): array
    {
        if (!$request->has('start_date') && !$request->has('end_date') && $defaultTo7Days) {
            return ['startDate' => Carbon::now()->subDays(6)->startOfDay(), 'endDate' => Carbon::now()->endOfDay()];
        }
        $rules = ['start_date' => 'required|date_format:d-m-Y', 'end_date' => 'required|date_format:d-m-Y|after_or_equal:start_date'];
        $messages = [ /* ... */];
        $validatedData = $request->validate($rules, $messages);
        return ['startDate' => Carbon::createFromFormat('d-m-Y', $validatedData['start_date'])->startOfDay(), 'endDate' => Carbon::createFromFormat('d-m-Y', $validatedData['end_date'])->endOfDay()];
    }

    private function _getFinancialStatsLogic(Carbon $startDate, Carbon $endDate): array
    {
        $totalRevenue = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->sum('orders.total_amount');

        $totalProfit = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->sum(DB::raw('products.price - products.import_price'));

        $bankDeposits = RechargesBank::where('web_id', 1) // THÊM: Lọc theo web_id
            ->where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $cardDeposits = RechargesCard::where('web_id', 1) // THÊM: Lọc theo web_id
            ->where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $pendingWithdrawals = Withdraw::join('users', 'withdraws.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('withdraws.status', 0)
            ->whereBetween('withdraws.created_at', [$startDate, $endDate])
            ->sum('withdraws.amount');

        $totalAffiliatePayouts = AffiliateHistory::join('affiliates', 'affiliate_histories.affiliate_id', '=', 'affiliates.id')
            ->join('users', 'affiliates.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->whereBetween('affiliate_histories.created_at', [$startDate, $endDate])
            ->sum('affiliate_histories.commission_amount');

        $averageOrderValue = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->avg('orders.total_amount');

        return ['total_revenue' => (float) $totalRevenue, 'total_profit' => (float) $totalProfit, 'total_deposits' => (float) ($bankDeposits + $cardDeposits), 'pending_withdrawals' => (float) $pendingWithdrawals, 'total_affiliate_payouts' => (float) $totalAffiliatePayouts, 'average_order_value' => (float) $averageOrderValue,];
    }

    private function _getSalesPerformanceStatsLogic(): array
    {
        $totalProducts = Product::where('web_id', 1)->count(); // THÊM: Lọc theo web_id

        $soldProductIds = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->pluck('order_items.product_id')
            ->unique();

        $soldProductsCount = $soldProductIds->count();

        return ['total_products' => (int) $totalProducts, 'sold_products' => (int) $soldProductsCount, 'unsold_products' => (int) ($totalProducts - $soldProductsCount),];
    }

    private function _getStatsForDateRangeLogic(Carbon $startDate, Carbon $endDate): array
    {
        $revenue = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->sum('orders.total_amount');

        $orderCount = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->count();

        $newUsersCount = User::where('web_id', 1) // THÊM: Lọc theo web_id
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return ['today_revenue' => (float) $revenue, 'today_order_count' => (int) $orderCount, 'today_new_users' => (int) $newUsersCount,];
    }

    private function _getTopSpendingUsersLogic(Carbon $startDate, Carbon $endDate)
    {
        return User::join('orders', 'users.id', '=', 'orders.user_id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('users.username', DB::raw('SUM(orders.total_amount) as total_spent'))
            ->groupBy('users.id', 'users.username')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();
    }

    private function _getUserGrowthChartLogic(Carbon $startDate, Carbon $endDate): array
    {
        $growthData = User::where('web_id', 1) // THÊM: Lọc theo web_id
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw("DATE_FORMAT(created_at, '%d/%m') as date_label"), DB::raw('COUNT(id) as count'))
            ->groupBy('date_label')
            ->orderByRaw('MIN(created_at)')
            ->get();

        return ['labels' => $growthData->pluck('date_label'), 'datasets' => [['label' => 'Người dùng mới', 'data' => $growthData->pluck('count')]]];
    }

    private function _getAverageRatingLogic(Carbon $startDate, Carbon $endDate): float
    {
        $avgRating = Review::where('web_id', 1) // THÊM: Lọc theo web_id
            ->whereBetween('created_at', [$startDate, $endDate])
            ->avg('star');
        return (float) number_format($avgRating ?? 0, 2);
    }

    private function _getChartDataLogic(string $period, Carbon $startDate, Carbon $endDate): array
    {
        $revenueOverTimeQuery = Order::join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate]);
        switch ($period) {
            case 'year':
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as label"), DB::raw("SUM(orders.total_amount) as value"))->groupBy('label')->orderBy('label');
                break;
            default:
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(orders.created_at, '%d/%m') as label"), DB::raw("SUM(orders.total_amount) as value"))->groupBy('label')->orderByRaw('MIN(orders.created_at)');
                break;
        }
        $revenueOverTime = $revenueOverTimeQuery->get();

        $revenueByCategory = Category::select('categories.name as label', DB::raw('SUM(orders.total_amount) as value'))
            ->join('products', 'categories.id', '=', 'products.category_id')
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('users.web_id', 1) // THÊM: Lọc theo web_id
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->whereNull('categories.parent_id')
            ->where('categories.id', '!=', 1)
            ->groupBy('categories.name')
            ->orderBy('value', 'desc')
            ->get();

        return ['revenue_over_time' => $revenueOverTime, 'revenue_by_category' => $revenueByCategory];
    }

    private function _getGameRevenueComparisonLogic(Carbon $startDate, Carbon $endDate): array
    {
        $top2Categories = DB::table('categories')->join('products', 'categories.id', '=', 'products.category_id')->join('order_items', 'products.id', '=', 'order_items.product_id')->join('orders', 'order_items.order_id', '=', 'orders.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereNull('categories.parent_id')->where('categories.id', '!=', 1)->select('categories.id', 'categories.name')->groupBy('categories.id', 'categories.name')->orderByRaw('SUM(orders.total_amount) DESC')->limit(2)->get();

        if ($top2Categories->count() === 0) {
            return ['labels' => [], 'datasets' => []];
        }
        $top2CategoryIds = $top2Categories->pluck('id');

        $results = DB::table('orders')->join('order_items', 'orders.id', '=', 'order_items.order_id')->join('products', 'order_items.product_id', '=', 'products.id')->join('categories', 'products.category_id', '=', 'categories.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->whereIn('categories.id', $top2CategoryIds)->select(DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m-%d') as full_date"), DB::raw("DATE_FORMAT(orders.created_at, '%d/%m') as date_label"), 'categories.name as category_name', DB::raw('SUM(order_items.unit_price) as daily_revenue'))->groupBy('full_date', 'date_label', 'category_name')->orderBy('full_date')->get();

        $labels = [];
        $datasets = [];
        $dataMap = [];
        $uniqueLabels = [];
        foreach ($top2Categories as $category) {
            $datasets[] = ['label' => $category->name, 'data' => []];
            $dataMap[$category->name] = [];
        }
        foreach ($results as $row) {
            $uniqueLabels[$row->date_label] = true;
            if (isset($dataMap[$row->category_name])) {
                $dataMap[$row->category_name][$row->date_label] = $row->daily_revenue;
            }
        }
        $labels = array_keys($uniqueLabels);
        foreach ($datasets as &$dataset) {
            foreach ($labels as $label) {
                $dataset['data'][] = (float) ($dataMap[$dataset['label']][$label] ?? 0);
            }
        }
        return ['labels' => $labels, 'datasets' => $datasets];
    }
}
