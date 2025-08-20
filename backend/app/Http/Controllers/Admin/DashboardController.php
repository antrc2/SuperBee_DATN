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
use App\Models\RechargeBank;
use App\Models\RechargeCard;
use App\Models\AffiliateHistory;
use App\Models\OrderItem;
use App\Models\Review;

class DashboardController extends Controller
{

    public function getDashboardData(Request $request)
    {
        try {
            $period = $request->input('period', 'week');

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

            // Gọi các hàm logic private để lấy toàn bộ dữ liệu
            $basicStatsData = $this->_getStatsForDateRangeLogic($statsStartDate, $statsEndDate);
            $financialStats = $this->_getFinancialStatsLogic($statsStartDate, $statsEndDate);
            $salesPerformanceStats = $this->_getSalesPerformanceStatsLogic();
            $chartsData = $this->_getChartDataLogic($period, $chartsStartDate, $chartsEndDate);
            $gameRevenueComparisonAllTime = $this->_getGameRevenueComparisonAllTimeLogic($chartsStartDate, $chartsEndDate);
            $gameRevenueComparisonInPeriod = $this->_getGameRevenueComparisonInPeriodLogic($chartsStartDate, $chartsEndDate);
            $userGrowthChart = $this->_getUserGrowthChartLogic($chartsStartDate, $chartsEndDate);
            $topSpendingUsers = $this->_getTopSpendingUsersLogic($statsStartDate, $statsEndDate);
            $averageRating = $this->_getAverageRatingLogic($statsStartDate, $statsEndDate);
            $topRechargers = $this->_getTopRechargersLogic($statsStartDate, $statsEndDate);

            $todayRevenueObject = ['original' => ['success' => true, 'data' => $basicStatsData]];

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
                    'game_comparison_chart_all_time' => $gameRevenueComparisonAllTime,
                    'game_comparison_chart_in_period' => $gameRevenueComparisonInPeriod,
                    'user_growth_chart' => $userGrowthChart,
                    'top_spending_users' => $topSpendingUsers,
                    'top_rechargers' => $topRechargers,
                ]
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Lỗi getDashboardData: ' . $e->getMessage() . ' tại dòng ' . $e->getLine());
            return response()->json(['status' => false, 'message' => 'đã xảy ra lỗi hệ thống'], 500);
        }
    }

    private function _validateAndParseDateRange(Request $request, bool $defaultTo7Days = false): array
    {
        if (!$request->has('start_date') && !$request->has('end_date') && $defaultTo7Days) {
            return ['startDate' => Carbon::now()->subDays(6)->startOfDay(), 'endDate' => Carbon::now()->endOfDay()];
        }
        $rules = ['start_date' => 'required|date_format:d-m-Y', 'end_date' => 'required|date_format:d-m-Y|after_or_equal:start_date'];
        $messages = ['start_date.required' => 'Bạn chưa nhập ngày bắt đầu.', 'start_date.date_format' => 'Ngày bắt đầu phải có định dạng DD-MM-YYYY.', 'end_date.required' => 'Bạn chưa nhập ngày kết thúc.', 'end_date.date_format' => 'Ngày kết thúc phải có định dạng DD-MM-YYYY.', 'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'];
        $validatedData = $request->validate($rules, $messages);
        return ['startDate' => Carbon::createFromFormat('d-m-Y', $validatedData['start_date'])->startOfDay(), 'endDate' => Carbon::createFromFormat('d-m-Y', $validatedData['end_date'])->endOfDay()];
    }

    private function _getTopRechargersLogic(Carbon $startDate, Carbon $endDate)
    {
        $bankQuery = DB::table('recharges_bank')->where('web_id', 1)->where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->select('user_id', 'amount');
        $cardQuery = DB::table('recharges_card')->where('web_id', 1)->where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->select('user_id', 'amount')->unionAll($bankQuery);
        return DB::query()->fromSub($cardQuery, 'recharges')->join('users', 'recharges.user_id', '=', 'users.id')->select('users.username', DB::raw('SUM(recharges.amount) as total_recharged'))->groupBy('users.id', 'users.username')->orderBy('total_recharged', 'desc')->get();
    }

    private function _getFinancialStatsLogic(Carbon $startDate, Carbon $endDate): array
    {
        $totalRevenue = Order::join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->sum('orders.total_amount');
        $totalProfit = Order::join('users', 'orders.user_id', '=', 'users.id')->join('order_items', 'orders.id', '=', 'order_items.order_id')->join('products', 'order_items.product_id', '=', 'products.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->sum(DB::raw('products.price - products.import_price'));
        $bankDeposits = RechargeBank::where('web_id', 1)->where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $cardDeposits = RechargeCard::where('web_id', 1)->where('status', 1)->whereBetween('created_at', [$startDate, $endDate])->sum('amount');
        $pendingWithdrawals = Withdraw::join('users', 'withdraws.user_id', '=', 'users.id')->where('users.web_id', 1)->where('withdraws.status', 0)->whereBetween('withdraws.created_at', [$startDate, $endDate])->sum('withdraws.amount');
        $totalAffiliatePayouts = AffiliateHistory::join('affiliates', 'affiliate_histories.affiliate_id', '=', 'affiliates.id')->join('users', 'affiliates.user_id', '=', 'users.id')->where('users.web_id', 1)->whereBetween('affiliate_histories.created_at', [$startDate, $endDate])->sum('affiliate_histories.commission_amount');
        $averageOrderValue = Order::join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->avg('orders.total_amount');
        return ['total_revenue' => (float) $totalRevenue, 'total_profit' => (float) $totalProfit, 'total_deposits' => (float) ($bankDeposits + $cardDeposits), 'pending_withdrawals' => (float) $pendingWithdrawals, 'total_affiliate_payouts' => (float) $totalAffiliatePayouts, 'average_order_value' => (float) $averageOrderValue,];
    }

    private function _getSalesPerformanceStatsLogic(): array
    {
        $totalProducts = Product::where('web_id', 1)->count();
        $soldProductIds = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->pluck('order_items.product_id')->unique();
        $soldProductsCount = $soldProductIds->count();
        return ['total_products' => (int) $totalProducts, 'sold_products' => (int) $soldProductsCount, 'unsold_products' => (int) ($totalProducts - $soldProductsCount),];
    }

    private function _getStatsForDateRangeLogic(Carbon $startDate, Carbon $endDate): array
    {
        $revenue = Order::join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->sum('orders.total_amount');
        $orderCount = Order::join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->count();
        $newUsersCount = User::where('web_id', 1)->whereBetween('created_at', [$startDate, $endDate])->count();
        return ['today_revenue' => (float) $revenue, 'today_order_count' => (int) $orderCount, 'today_new_users' => (int) $newUsersCount,];
    }

    private function _getTopSpendingUsersLogic(Carbon $startDate, Carbon $endDate)
    {
        return User::join('orders', 'users.id', '=', 'orders.user_id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->select('users.username', DB::raw('SUM(orders.total_amount) as total_spent'))->groupBy('users.id', 'users.username')->orderBy('total_spent', 'desc')->limit(10)->get();
    }

    private function _getUserGrowthChartLogic(Carbon $startDate, Carbon $endDate): array
    {
        $growthData = User::where('web_id', 1)->whereBetween('created_at', [$startDate, $endDate])->select(DB::raw("DATE_FORMAT(created_at, '%d/%m') as date_label"), DB::raw('COUNT(id) as count'))->groupBy('date_label')->orderByRaw('MIN(created_at)')->get();
        return ['labels' => $growthData->pluck('date_label'), 'datasets' => [['label' => 'Người dùng mới', 'data' => $growthData->pluck('count')]]];
    }

    private function _getAverageRatingLogic(Carbon $startDate, Carbon $endDate): float
    {
        $avgRating = Review::where('web_id', 1)->whereBetween('created_at', [$startDate, $endDate])->avg('star');
        return (float) number_format($avgRating ?? 0, 2);
    }

    private function _getChartDataLogic(string $period, Carbon $startDate, Carbon $endDate): array
    {
        $revenueOverTimeQuery = Order::join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate]);
        switch ($period) {
            case 'year':
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m') as label"), DB::raw("SUM(orders.total_amount) as value"))->groupBy('label')->orderBy('label');
                break;
            default:
                $revenueOverTimeQuery->select(DB::raw("DATE_FORMAT(orders.created_at, '%d/%m') as label"), DB::raw("SUM(orders.total_amount) as value"))->groupBy('label')->orderByRaw('MIN(orders.created_at)');
                break;
        }
        $revenueOverTime = $revenueOverTimeQuery->get();
        $revenueByCategory = DB::table('categories as parent_cat')->select('parent_cat.name as label', DB::raw('SUM(orders.total_amount) as value'))->join('categories as child_cat', 'parent_cat.id', '=', 'child_cat.parent_id')->join('products', 'child_cat.id', '=', 'products.category_id')->join('order_items', 'products.id', '=', 'order_items.product_id')->join('orders', 'order_items.order_id', '=', 'orders.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->whereNull('parent_cat.parent_id')->where('parent_cat.id', '!=', 1)->groupBy('parent_cat.name')->orderBy('value', 'desc')->get();
        return ['revenue_over_time' => $revenueOverTime, 'revenue_by_category' => $revenueByCategory];
    }

    private function _getGameRevenueComparisonInPeriodLogic(Carbon $startDate, Carbon $endDate): array
    {
        $top2Categories = DB::table('categories as parent_cat')->join('categories as child_cat', 'parent_cat.id', '=', 'child_cat.parent_id')->join('products', 'child_cat.id', '=', 'products.category_id')->join('order_items', 'products.id', '=', 'order_items.product_id')->join('orders', 'order_items.order_id', '=', 'orders.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereNull('parent_cat.parent_id')->where('parent_cat.id', '!=', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->select('parent_cat.id', 'parent_cat.name')->groupBy('parent_cat.id', 'parent_cat.name')->orderByRaw('SUM(orders.total_amount) DESC')->limit(2)->get();
        return $this->_buildComparisonChartData($top2Categories, $startDate, $endDate);
    }

    private function _getGameRevenueComparisonAllTimeLogic(Carbon $startDate, Carbon $endDate): array
    {
        $top2Categories = DB::table('categories as parent_cat')->join('categories as child_cat', 'parent_cat.id', '=', 'child_cat.parent_id')->join('products', 'child_cat.id', '=', 'products.category_id')->join('order_items', 'products.id', '=', 'order_items.product_id')->join('orders', 'order_items.order_id', '=', 'orders.id')->join('users', 'orders.user_id', '=', 'users.id')->where('users.web_id', 1)->where('orders.status', 1)->whereNull('parent_cat.parent_id')->where('parent_cat.id', '!=', 1)->select('parent_cat.id', 'parent_cat.name')->groupBy('parent_cat.id', 'parent_cat.name')->orderByRaw('SUM(orders.total_amount) DESC')->limit(2)->get();
        return $this->_buildComparisonChartData($top2Categories, $startDate, $endDate);
    }
    
    private function _buildComparisonChartData($topCategories, Carbon $startDate, Carbon $endDate): array
    {
        if ($topCategories->count() === 0) {
            return ['labels' => [], 'datasets' => []];
        }
        $topCategoryIds = $topCategories->pluck('id');
        $results = DB::table('orders')->join('users', 'orders.user_id', '=', 'users.id')->join('order_items', 'orders.id', '=', 'order_items.order_id')->join('products', 'order_items.product_id', '=', 'products.id')->join('categories as child_cat', 'products.category_id', '=', 'child_cat.id')->join('categories as parent_cat', 'child_cat.parent_id', '=', 'parent_cat.id')->where('users.web_id', 1)->where('orders.status', 1)->whereBetween('orders.created_at', [$startDate, $endDate])->whereIn('parent_cat.id', $topCategoryIds)->select(DB::raw("DATE_FORMAT(orders.created_at, '%Y-%m-%d') as full_date"), DB::raw("DATE_FORMAT(orders.created_at, '%d/%m') as date_label"), 'parent_cat.name as category_name', DB::raw('SUM(order_items.unit_price) as daily_revenue'))->groupBy('full_date', 'date_label', 'category_name')->orderBy('full_date')->get();
        $labels = []; $datasets = []; $dataMap = []; $uniqueLabels = [];
        foreach($topCategories as $category) {
            $datasets[] = ['label' => $category->name, 'data' => []];
            $dataMap[$category->name] = [];
        }
        foreach ($results as $row) {
            $uniqueLabels[$row->date_label] = true;
            if(isset($dataMap[$row->category_name])) {
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