<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStatistics(Request $request)
    {
        $request->validate([
            'period' => 'required|in:day,week,month,quarter,year',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'web_id' => 'nullable|exists:webs,id'
        ]);

        $period = $request->period;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $webId = $request->web_id;

        // Base query cho orders
        $baseQuery = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate]);

        if ($webId) {
            $baseQuery->where('products.web_id', $webId);
        }

        $periodFormat = $this->getPeriodFormat($period);

        // Revenue chart
        $revenueStats = (clone $baseQuery)
            ->select(
                DB::raw("DATE_FORMAT(orders.created_at, '{$periodFormat}') as period"),
                DB::raw('SUM(order_items.unit_price) as total_revenue'),
                DB::raw('SUM(products.import_price) as total_cost'),
                DB::raw('SUM(order_items.unit_price - products.import_price) as total_profit'),
                DB::raw('COUNT(DISTINCT orders.id) as total_orders'),
                DB::raw('COUNT(order_items.id) as total_items')
            )
            ->groupBy(DB::raw("DATE_FORMAT(orders.created_at, '{$periodFormat}')"))
            ->orderBy(DB::raw("DATE_FORMAT(orders.created_at, '{$periodFormat}')"))
            ->get();

        // Category performance
        $categoryStats = (clone $baseQuery)
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'categories.name as category_name',
                DB::raw('SUM(order_items.unit_price) as revenue'),
                DB::raw('SUM(products.import_price) as cost'),
                DB::raw('SUM(order_items.unit_price - products.import_price) as profit'),
                DB::raw('COUNT(order_items.id) as items_sold'),
                DB::raw('(SELECT COUNT(*) FROM products p WHERE p.category_id = categories.id AND p.status = 1) as available_products')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('revenue', 'desc')
            ->get();


        // Transaction stats
        $transactionQuery = DB::table('wallet_transactions')
            ->whereIn('type', ['recharge_card', 'recharge_bank'])
            ->where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($webId) {
            $transactionQuery->where(function ($query) use ($webId) {
                $query->whereExists(function ($subQuery) use ($webId) {
                    $subQuery->select(DB::raw(1))
                        ->from('recharges_card');
                })->orWhereExists(function ($subQuery) use ($webId) {
                    $subQuery->select(DB::raw(1))
                        ->from('recharges_bank');
                });
            });
        }


        $transactionStats = $transactionQuery
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$periodFormat}') as period"),
                'type',
                DB::raw('SUM(amount) as total_amount'),
                DB::raw('COUNT(*) as total_transactions')
            )
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '{$periodFormat}')"), 'type')
            ->orderBy(DB::raw("DATE_FORMAT(created_at, '{$periodFormat}')"))
            ->get();


        // Transaction details
        $transactionDetailsQuery = DB::table('wallet_transactions')
            ->join('wallets', 'wallets.id', '=', 'wallet_transactions.wallet_id')
            ->join('users', 'users.id', '=', 'wallets.user_id')
            ->whereIn('wallet_transactions.type', ['recharge_card', 'recharge_bank'])
            ->where('wallet_transactions.status', 1)
            ->whereBetween('wallet_transactions.created_at', [$startDate, $endDate])
            ->select(
                'wallet_transactions.id',
                'wallet_transactions.amount',
                'wallet_transactions.type',
                'wallet_transactions.status',
                'wallet_transactions.created_at',
                'wallets.user_id',
                'users.username as user_name'
            )
            ->orderBy('wallet_transactions.created_at', 'desc') // Phải đặt ở đây
            ->limit(100)
            ->get(); // Lấy dữ liệu cuối cùng



        $transactionDetails = $transactionDetailsQuery;

        // Summary from orders
        $totalRevenue = (clone $baseQuery)->sum('order_items.unit_price');
        $totalCost = (clone $baseQuery)->sum('products.import_price');
        $totalProfit = $totalRevenue - $totalCost;
        $totalOrders = (clone $baseQuery)->distinct('orders.id')->count('orders.id');
        $totalItems = (clone $baseQuery)->count('order_items.id');
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // New customers
        $newCustomersQuery = DB::table('users')
            ->select(
                'users.id',
                'users.username',
                'users.email',
                'users.phone',
                'users.created_at',
                DB::raw('MIN(orders.created_at) as first_order_date')
            )
            ->join('orders', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 1)
            ->when($webId, function ($query) use ($webId) {
                $query->join('order_items', 'orders.id', '=', 'order_items.order_id')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->where('products.web_id', $webId);
            })
            ->groupBy(
                'users.id',
                'users.username',
                'users.email',
                'users.phone',
                'users.created_at'
            )
            ->havingBetween('first_order_date', [$startDate, $endDate]);


        $totalNewCustomers = $newCustomersQuery->get()->count();;
        $totalRechargeCount = WalletTransaction::whereIn('type', ['recharge_card', 'recharge_bank'])
            ->where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $totalRechargeAmount = WalletTransaction::whereIn('type', ['recharge_card', 'recharge_bank'])
            ->where('status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');
        // Transaction totals (fallback if wallet_transactions is empty)
        $totalTransactionAmount = $totalRechargeAmount;
        $totalTransactionCount = $totalRechargeCount;

        if ($totalTransactionAmount == 0 && $totalTransactionCount == 0) {
            // Fallback: use orders
            $totalTransactionAmount = (clone $baseQuery)->sum('order_items.unit_price');
            $totalTransactionCount = (clone $baseQuery)->distinct('orders.id')->count('orders.id');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_revenue' => $totalRevenue,
                    'total_cost' => $totalCost,
                    'total_profit' => $totalProfit,
                    'total_orders' => $totalOrders,
                    'total_items' => $totalItems,
                    'avg_order_value' => round($avgOrderValue, 0),
                    'total_new_customers' => $totalNewCustomers,
                    'total_transaction_amount' => $totalTransactionAmount,
                    'total_transaction_count' => $totalTransactionCount
                ],
                'revenue_chart' => $revenueStats,
                'new_customers_chart' => $this->getNewCustomersChart($periodFormat, $startDate, $endDate, $webId),
                'category_stats' => $categoryStats,
                'transaction_stats' => $transactionStats,
                'transaction_details' => $transactionDetails,
                'period' => $period,
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ]
            ]
        ]);
    }

    private function getNewCustomersChart($periodFormat, $startDate, $endDate, $webId)
    {
        $query = DB::table('users')
            ->join(DB::raw('(
            SELECT user_id, MIN(created_at) as first_order_date
            FROM orders 
            WHERE status = 1
            GROUP BY user_id
        ) first_orders'), 'users.id', '=', 'first_orders.user_id')
            ->whereBetween('first_orders.first_order_date', [$startDate, $endDate]);

        if ($webId) {
            $query->join('orders as first_order', function ($join) {
                $join->on('users.id', '=', 'first_order.user_id')
                    ->on('first_orders.first_order_date', '=', 'first_order.created_at');
            })
                ->join('order_items as first_item', 'first_order.id', '=', 'first_item.order_id')
                ->join('products as first_product', 'first_item.product_id', '=', 'first_product.id')
                ->where('first_product.web_id', $webId);
        }

        return $query->select(
            DB::raw("DATE_FORMAT(first_orders.first_order_date, '{$periodFormat}') as period"),
            DB::raw('COUNT(DISTINCT users.id) as new_customers')
        )
            ->groupBy(DB::raw("DATE_FORMAT(first_orders.first_order_date, '{$periodFormat}')"))
            ->orderBy(DB::raw("DATE_FORMAT(first_orders.first_order_date, '{$periodFormat}')"))
            ->get();
    }


    public function compareStatistics(Request $request)
    {
        $request->validate([
            'period_type' => 'required|in:week,month,quarter,year',
            'period_1' => 'required|array',
            'period_1.start' => 'required|date',
            'period_1.end' => 'required|date',
            'period_2' => 'required|array',
            'period_2.start' => 'required|date',
            'period_2.end' => 'required|date',
            'web_id' => 'nullable|exists:webs,id'
        ]);

        $periodType = $request->period_type;
        $period1 = [
            'start' => Carbon::parse($request->period_1['start']),
            'end' => Carbon::parse($request->period_1['end'])
        ];
        $period2 = [
            'start' => Carbon::parse($request->period_2['start']),
            'end' => Carbon::parse($request->period_2['end'])
        ];
        $webId = $request->web_id;

        // Get statistics for both periods
        $stats1 = $this->getPeriodsStats($period1['start'], $period1['end'], $webId);
        $stats2 = $this->getPeriodsStats($period2['start'], $period2['end'], $webId);

        // Calculate differences
        $comparison = [
            'period_1' => [
                'label' => $this->getPeriodLabel($periodType, $period1['start'], $period1['end']),
                'stats' => $stats1
            ],
            'period_2' => [
                'label' => $this->getPeriodLabel($periodType, $period2['start'], $period2['end']),
                'stats' => $stats2
            ],
            'differences' => [
                'revenue' => [
                    'absolute' => $stats1['total_revenue'] - $stats2['total_revenue'],
                    'percentage' => $stats2['total_revenue'] > 0 ?
                        round((($stats1['total_revenue'] - $stats2['total_revenue']) / $stats2['total_revenue']) * 100, 2) : 0
                ],
                'orders' => [
                    'absolute' => $stats1['total_orders'] - $stats2['total_orders'],
                    'percentage' => $stats2['total_orders'] > 0 ?
                        round((($stats1['total_orders'] - $stats2['total_orders']) / $stats2['total_orders']) * 100, 2) : 0
                ],
                'profit' => [
                    'absolute' => $stats1['total_profit'] - $stats2['total_profit'],
                    'percentage' => $stats2['total_profit'] > 0 ?
                        round((($stats1['total_profit'] - $stats2['total_profit']) / $stats2['total_profit']) * 100, 2) : 0
                ],
                'new_customers' => [
                    'absolute' => $stats1['total_new_customers'] - $stats2['total_new_customers'],
                    'percentage' => $stats2['total_new_customers'] > 0 ?
                        round((($stats1['total_new_customers'] - $stats2['total_new_customers']) / $stats2['total_new_customers']) * 100, 2) : 0
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $comparison
        ]);
    }

    private function getPeriodsStats($startDate, $endDate, $webId = null)
    {
        // Base query for orders
        $baseQuery = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 1)
            ->whereBetween('orders.created_at', [$startDate, $endDate]);

        if ($webId) {
            $baseQuery->where('products.web_id', $webId);
        }

        $totalRevenue = (clone $baseQuery)->sum('order_items.unit_price');
        $totalCost = (clone $baseQuery)->sum('products.import_price');
        $totalProfit = $totalRevenue - $totalCost;
        $totalOrders = (clone $baseQuery)->distinct('orders.id')->count('orders.id');
        $avgOrderValue = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 0) : 0;

        // New customers in period
        $newCustomersQuery = DB::table('users')
            ->join(DB::raw('(
                SELECT user_id, MIN(created_at) as first_order_date
                FROM orders 
                WHERE status = 1
                GROUP BY user_id
            ) first_orders'), 'users.id', '=', 'first_orders.user_id')
            ->whereBetween('first_orders.first_order_date', [$startDate, $endDate]);

        if ($webId) {
            $newCustomersQuery->join('orders as first_order', function ($join) {
                $join->on('users.id', '=', 'first_order.user_id')
                    ->on('first_orders.first_order_date', '=', 'first_order.created_at');
            })
                ->join('order_items as first_item', 'first_order.id', '=', 'first_item.order_id')
                ->join('products as first_product', 'first_item.product_id', '=', 'first_product.id')
                ->where('first_product.web_id', $webId);
        }

        $totalNewCustomers = $newCustomersQuery->count('users.id');

        return [
            'total_revenue' => $totalRevenue,
            'total_cost' => $totalCost,
            'total_profit' => $totalProfit,
            'total_orders' => $totalOrders,
            'avg_order_value' => $avgOrderValue,
            'total_new_customers' => $totalNewCustomers
        ];
    }

    private function getPeriodFormat($period)
    {
        switch ($period) {
            case 'day':
                return '%Y-%m-%d';
            case 'week':
                return '%Y-%u';
            case 'month':
                return '%Y-%m';
            case 'quarter':
                return '%Y-Q%q';
            case 'year':
                return '%Y';
            default:
                return '%Y-%m-%d';
        }
    }

    private function getPeriodLabel($periodType, $startDate, $endDate)
    {
        switch ($periodType) {
            case 'week':
                return 'Tuần ' . $startDate->format('W/Y') . ' (' . $startDate->format('d/m') . ' - ' . $endDate->format('d/m/Y') . ')';
            case 'month':
                return 'Tháng ' . $startDate->format('m/Y');
            case 'quarter':
                $quarter = ceil($startDate->month / 3);
                return 'Quý ' . $quarter . '/' . $startDate->format('Y');
            case 'year':
                return 'Năm ' . $startDate->format('Y');
            default:
                return $startDate->format('d/m/Y') . ' - ' . $endDate->format('d/m/Y');
        }
    }

    public function getAvailablePeriods(Request $request)
    {
        $request->validate([
            'period_type' => 'required|in:week,month,quarter,year'
        ]);

        $periodType = $request->period_type;

        // Get the earliest and latest order dates
        $dateRange = DB::table('orders')
            ->select(
                DB::raw('MIN(created_at) as earliest'),
                DB::raw('MAX(created_at) as latest')
            )
            ->first();

        if (!$dateRange->earliest) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $earliest = Carbon::parse($dateRange->earliest);
        $latest = Carbon::parse($dateRange->latest);
        $periods = [];

        switch ($periodType) {
            case 'week':
                $current = $earliest->copy()->startOfWeek();
                while ($current->lte($latest)) {
                    $weekEnd = $current->copy()->endOfWeek();
                    $periods[] = [
                        'label' => 'Tuần ' . $current->format('W/Y') . ' (' . $current->format('d/m') . ' - ' . $weekEnd->format('d/m/Y') . ')',
                        'start' => $current->format('Y-m-d'),
                        'end' => $weekEnd->format('Y-m-d'),
                        'value' => $current->format('Y-W')
                    ];
                    $current->addWeek();
                }
                break;
            case 'month':
                $current = $earliest->copy()->startOfMonth();
                while ($current->lte($latest)) {
                    $periods[] = [
                        'label' => 'Tháng ' . $current->format('m/Y'),
                        'start' => $current->format('Y-m-d'),
                        'end' => $current->copy()->endOfMonth()->format('Y-m-d'),
                        'value' => $current->format('Y-m')
                    ];
                    $current->addMonth();
                }
                break;
            case 'quarter':
                $current = $earliest->copy()->startOfQuarter();
                while ($current->lte($latest)) {
                    $quarter = ceil($current->month / 3);
                    $periods[] = [
                        'label' => 'Quý ' . $quarter . '/' . $current->format('Y'),
                        'start' => $current->format('Y-m-d'),
                        'end' => $current->copy()->endOfQuarter()->format('Y-m-d'),
                        'value' => $current->format('Y') . '-Q' . $quarter
                    ];
                    $current->addQuarter();
                }
                break;
            case 'year':
                $current = $earliest->copy()->startOfYear();
                while ($current->lte($latest)) {
                    $periods[] = [
                        'label' => 'Năm ' . $current->format('Y'),
                        'start' => $current->format('Y-m-d'),
                        'end' => $current->copy()->endOfYear()->format('Y-m-d'),
                        'value' => $current->format('Y')
                    ];
                    $current->addYear();
                }
                break;
        }

        return response()->json([
            'success' => true,
            'data' => array_reverse($periods) // Latest first
        ]);
    }
}
