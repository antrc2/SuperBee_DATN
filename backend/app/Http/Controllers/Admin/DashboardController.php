<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;

use Illuminate\Validation\ValidationException; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function getDashboardData(Request $request)
    {
        try {
            $period = $request->input('period', 'week');        
            if ($request->has('start_date') || $request->has('end_date')) {
                $rules = [
                    'start_date' => 'required|date_format:Y-m-d',
                    'end_date'   => 'required|date_format:Y-m-d|after_or_equal:start_date',
                ];

                $messages = [
                    'start_date.required'     => 'Bạn chưa nhập ngày bắt đầu.',
                    'start_date.date_format'  => 'Ngày bắt đầu phải có định dạng YYYY-MM-DD.',
                    'end_date.required'       => 'Bạn chưa nhập ngày kết thúc.',
                    'end_date.date_format'    => 'Ngày kết thúc phải có định dạng YYYY-MM-DD.',
                    'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
                ];

                $validatedData = $request->validate($rules, $messages);
                $customStartDate = Carbon::parse($validatedData['start_date'])->startOfDay();
                $customEndDate = Carbon::parse($validatedData['end_date'])->endOfDay();

                $statsStartDate = $chartsStartDate = $customStartDate;
                $statsEndDate = $chartsEndDate = $customEndDate;

            } else {
                $statsStartDate = Carbon::today()->startOfDay();
                $statsEndDate = Carbon::today()->endOfDay();
                $chartsStartDate = Carbon::now()->subDays(6)->startOfDay();
                $chartsEndDate = Carbon::now()->endOfDay();
            }

            $statsData = $this->getStatsForDateRange($statsStartDate, $statsEndDate);

            $todayRevenueObject = [
                'original' => [
                    'success' => true,
                    'data' => $statsData
                ],
            ];

            $chartsData = $this->getChartData($period, $chartsStartDate, $chartsEndDate);

            return response()->json([
                'status' => true,
                'message' => 'lấy ra dữ liệu thành công',
                'data' => [
                    'todayRevenue' => $todayRevenueObject,
                    'charts' => $chartsData
                ]
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => $e->validator->errors()->first(),
                // 'errors' => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Lỗi DashboardController: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'đã xảy ra lỗi',
            ], 500);
        }
    }

    public function getStatsForDateRange(Carbon $startDate, Carbon $endDate): array
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
            'today_revenue'     => (float) $revenue,
            'today_order_count' => (int) $orderCount,
            'today_new_users'   => (int) $newUsersCount,
        ];
    }

    /**
     * Hàm private để lấy dữ liệu biểu đồ.
     */
    private function getChartData(string $period, Carbon $startDate, Carbon $endDate): array
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
            default:
                $revenueOverTimeQuery->select(
                    DB::raw("DATE_FORMAT(created_at, '%d/%m') as label"),
                    DB::raw("SUM(total_amount) as value")
                )->groupBy('label')->orderByRaw('MIN(created_at)');
                break;
        }
        $revenueOverTime = $revenueOverTimeQuery->get();
        $revenueByCategory = Category::select('categories.name as label', DB::raw('SUM(orders.total_amount) as value'))
            ->join('products', 'categories.id', '=', 'products.category_id')
            ->join('order_items', 'products.id', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 1)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('categories.name', ['Liên Quân', 'Free Fire'])
            ->groupBy('categories.name')
            ->get();
        return [
            'revenue_over_time' => $revenueOverTime,
            'revenue_by_category' => $revenueByCategory
        ];
    }
}