import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Filter,
  Zap,
  BarChart3,
  UserPlus,
  CreditCard,
  Target,
  Activity,
  TrendingUpIcon,
  PieChartIcon,
  HistoryIcon,
  Coins,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@utils/http";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [statistics, setStatistics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    period: "month",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });

  // Comparison filters
  const [compareFilters, setCompareFilters] = useState({
    periodType: "month",
    period1: null,
    period2: null,
  });

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (activeTab === "compare" && compareFilters.periodType) {
      fetchAvailablePeriods();
    }
  }, [activeTab, compareFilters.periodType]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const formatDate = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const params = {
        period: filters.period,
        start_date: formatDate(filters.startDate),
        end_date: formatDate(filters.endDate),
      };
      const response = await api.get("/admin/dashboard/statistics", { params });
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    if (!compareFilters.period1 || !compareFilters.period2) return;

    setLoading(true);
    try {
      const data = {
        period_type: compareFilters.periodType,
        period_1: compareFilters.period1,
        period_2: compareFilters.period2,
      };

      const response = await api.post("/admin/dashboard/compare", data);
      setComparison(response.data.data);
    } catch (error) {
      console.error("Error fetching comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePeriods = async () => {
    try {
      const response = await api.get("/admin/dashboard/available-periods", {
        params: { period_type: compareFilters.periodType },
      });
      setAvailablePeriods(response.data.data);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Auto-adjust date range based on period
      if (key === "period") {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        switch (value) {
          case "day":
            newFilters.startDate = new Date();
            newFilters.endDate = new Date();
            break;
          case "week":
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            newFilters.startDate = weekStart;
            newFilters.endDate = weekEnd;
            break;
          case "month":
            newFilters.startDate = new Date(year, month, 1);
            newFilters.endDate = new Date(year, month + 1, 0);
            break;
          case "quarter":
            const quarter = Math.floor((month + 3) / 3);
            const quarterStart = new Date(year, (quarter - 1) * 3, 1);
            const quarterEnd = new Date(year, quarter * 3, 0);
            newFilters.startDate = quarterStart;
            newFilters.endDate = quarterEnd;
            break;
          case "year":
            newFilters.startDate = new Date(year, 0, 1);
            newFilters.endDate = new Date(year, 11, 31);
            break;
        }
      }

      return newFilters;
    });
  };

  const handleCompareFilterChange = (key, value) => {
    setCompareFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    color = "blue",
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ComparisonCard = ({
    title,
    period1,
    period2,
    difference,
    icon: Icon,
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Icon className="w-5 h-5 text-gray-500" />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {comparison?.period_1.label}
          </span>
          <span className="font-semibold">{period1}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {comparison?.period_2.label}
          </span>
          <span className="font-semibold">{period2}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Chênh lệch</span>
            <div className="text-right">
              <div
                className={`font-semibold ${
                  difference.absolute >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {difference.absolute >= 0 ? "+" : ""}
                {typeof difference.absolute === "number"
                  ? formatNumber(difference.absolute)
                  : difference.absolute}
              </div>
              <div
                className={`text-sm ${
                  difference.percentage >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {difference.percentage >= 0 ? "+" : ""}
                {difference.percentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", name: "Tổng quan", icon: Activity },
    { id: "charts", name: "Biểu đồ", icon: BarChart3 },
    { id: "performance", name: "Hiệu suất", icon: TrendingUpIcon },
    { id: "transactions", name: "Giao dịch nạp", icon: CreditCard },
    { id: "compare", name: "So sánh", icon: PieChartIcon },
    { id: "history", name: "Lịch sử", icon: HistoryIcon },
  ];
  const renderTransactions = () => {
    if (!statistics || !statistics.transaction_details) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chi tiết giao dịch nạp tiền
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 font-semibold">ID</th>
                <th className="text-left py-3 px-2 font-semibold">
                  Người dùng
                </th>
                <th className="text-left py-3 px-2 font-semibold">Hình thức</th>
                <th className="text-right py-3 px-2 font-semibold">Số tiền</th>
                <th className="text-left py-3 px-2 font-semibold">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {statistics.transaction_details.map((tx, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">{tx.id}</td>
                  <td className="py-3 px-2">{tx.user_name || tx.user_id}</td>
                  <td className="py-3 px-2">
                    {tx.type === "recharge_card" ? "Thẻ cào" : "Ngân hàng"}
                  </td>
                  <td className="py-3 px-2 text-right text-blue-600">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="py-3 px-2">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Bộ lọc:</span>
          </div>

          <select
            value={filters.period}
            onChange={(e) => handleFilterChange("period", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="quarter">Quý</option>
            <option value="year">Năm</option>
          </select>

          <div className="flex items-center gap-2">
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleFilterChange("startDate", date)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
              calendarClassName="shadow-lg border border-gray-200"
              placeholderText="Ngày bắt đầu"
            />
            <span className="text-gray-500">đến</span>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleFilterChange("endDate", date)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
              calendarClassName="shadow-lg border border-gray-200"
              placeholderText="Ngày kết thúc"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStatistics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Cập nhật
          </button>
        </div>
      </div>

      {/* Comparison Controls */}
      {activeTab === "compare" && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-gray-700">So sánh theo:</span>

            <select
              value={compareFilters.periodType}
              onChange={(e) =>
                handleCompareFilterChange("periodType", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
              <option value="year">Năm</option>
            </select>

            <select
              value={compareFilters.period1?.value || ""}
              onChange={(e) => {
                const period = availablePeriods.find(
                  (p) => p.value === e.target.value
                );
                handleCompareFilterChange(
                  "period1",
                  period
                    ? {
                        start: period.start,
                        end: period.end,
                        value: period.value,
                      }
                    : null
                );
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Chọn kỳ 1</option>
              {availablePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <span className="text-gray-500">so với</span>

            <select
              value={compareFilters.period2?.value || ""}
              onChange={(e) => {
                const period = availablePeriods.find(
                  (p) => p.value === e.target.value
                );
                handleCompareFilterChange(
                  "period2",
                  period
                    ? {
                        start: period.start,
                        end: period.end,
                        value: period.value,
                      }
                    : null
                );
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Chọn kỳ 2</option>
              {availablePeriods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <button
              onClick={fetchComparison}
              disabled={
                loading || !compareFilters.period1 || !compareFilters.period2
              }
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              So sánh
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOverview = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(statistics.summary.total_revenue)}
            icon={Coins}
            color="green"
          />
          <StatCard
            title="Tiền vốn"
            value={formatCurrency(statistics.summary.total_cost)}
            icon={Package}
            color="orange"
          />
          <StatCard
            title="Tiền lãi"
            value={formatCurrency(statistics.summary.total_profit)}
            icon={Target}
            color="emerald"
          />
          <StatCard
            title="Tổng đơn hàng"
            value={formatNumber(statistics.summary.total_orders)}
            icon={ShoppingCart}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Khách hàng mới"
            value={formatNumber(statistics.summary.total_new_customers)}
            icon={UserPlus}
            color="purple"
          />
          <StatCard
            title="Giá trị TB/đơn"
            value={formatCurrency(statistics.summary.avg_order_value)}
            icon={TrendingUp}
            color="indigo"
          />
          <StatCard
            title="Giao dịch nạp tiền"
            value={formatNumber(statistics.summary.total_transaction_count)}
            icon={CreditCard}
            color="pink"
          />
          <StatCard
            title="Tổng tiền nạp"
            value={formatCurrency(statistics.summary.total_transaction_amount)}
            icon={Users}
            color="cyan"
          />
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-8">
        {/* Revenue & Profit Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ doanh thu và lãi theo thời gian
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={statistics.revenue_chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === "total_revenue"
                    ? "Doanh thu"
                    : name === "total_cost"
                    ? "Vốn"
                    : "Lãi",
                ]}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Legend />
              <Bar dataKey="total_cost" fill="#EF4444" name="Vốn" />
              <Bar dataKey="total_profit" fill="#10B981" name="Lãi" />
              <Line
                type="monotone"
                dataKey="total_revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Doanh thu"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Orders & New Customers Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Đơn hàng và khách hàng mới
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={statistics.revenue_chart.map((item, index) => ({
                ...item,
                new_customers:
                  statistics.new_customers_chart[index]?.new_customers || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  formatNumber(value),
                  name === "total_orders" ? "Đơn hàng" : "Khách hàng mới",
                ]}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Legend />
              <Bar dataKey="total_orders" fill="#F59E0B" name="Đơn hàng" />
              <Line
                type="monotone"
                dataKey="new_customers"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Khách hàng mới"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Statistics */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thống kê giao dịch nạp tiền
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statistics.transaction_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value, name) => [
                  name === "total_amount"
                    ? formatCurrency(value)
                    : formatNumber(value),
                  name === "total_amount" ? "Tổng tiền nạp" : "Số giao dịch",
                ]}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Legend />
              <Bar dataKey="total_amount" fill="#06B6D4" name="Tổng tiền nạp" />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>
    );
  };

  const renderPerformance = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-8">
        {/* Category Details Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chi tiết hiệu suất danh mục
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold">
                    Danh mục
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Doanh thu
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">Vốn</th>
                  <th className="text-right py-3 px-2 font-semibold">Lãi</th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Sản phẩm đang bán
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Sản phẩm đã bán
                  </th>
                </tr>
              </thead>
              <tbody>
                {statistics.category_stats.map((category, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium">
                      {category.category_name}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatCurrency(category.revenue)}
                    </td>
                    <td className="py-3 px-2 text-right text-orange-600">
                      {formatCurrency(category.cost)}
                    </td>
                    <td className="py-3 px-2 text-right text-green-600">
                      {formatCurrency(category.profit)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatNumber(category.available_products)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {formatNumber(category.items_sold)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!comparison) {
      return (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có dữ liệu so sánh
          </h3>
          <p className="text-gray-500">
            Vui lòng chọn các kỳ để so sánh và nhấn "So sánh".
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Comparison Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Biểu đồ so sánh
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={[
                {
                  name: comparison.period_2.label,
                  "Doanh thu": comparison.period_2.stats.total_revenue,
                  "Tiền lãi": comparison.period_2.stats.total_profit,
                  "Đơn hàng": comparison.period_2.stats.total_orders * 10000,
                  "Khách hàng mới":
                    comparison.period_2.stats.total_new_customers * 100000,
                },
                {
                  name: comparison.period_1.label,
                  "Doanh thu": comparison.period_1.stats.total_revenue,
                  "Tiền lãi": comparison.period_1.stats.total_profit,
                  "Đơn hàng": comparison.period_1.stats.total_orders * 10000,
                  "Khách hàng mới":
                    comparison.period_1.stats.total_new_customers * 100000,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Đơn hàng") return [value / 10000, name];
                  if (name === "Khách hàng mới") return [value / 100000, name];
                  return [formatCurrency(value), name];
                }}
              />
              <Legend />
              <Bar dataKey="Doanh thu" fill="#3B82F6" />
              <Bar dataKey="Tiền lãi" fill="#10B981" />
              <Bar dataKey="Đơn hàng" fill="#F59E0B" />
              <Bar dataKey="Khách hàng mới" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ComparisonCard
            title="Doanh thu"
            period1={formatCurrency(comparison.period_1.stats.total_revenue)}
            period2={formatCurrency(comparison.period_2.stats.total_revenue)}
            difference={comparison.differences.revenue}
            icon={DollarSign}
          />
          <ComparisonCard
            title="Đơn hàng"
            period1={formatNumber(comparison.period_1.stats.total_orders)}
            period2={formatNumber(comparison.period_2.stats.total_orders)}
            difference={comparison.differences.orders}
            icon={ShoppingCart}
          />
          <ComparisonCard
            title="Tiền lãi"
            period1={formatCurrency(comparison.period_1.stats.total_profit)}
            period2={formatCurrency(comparison.period_2.stats.total_profit)}
            difference={comparison.differences.profit}
            icon={Target}
          />
          <ComparisonCard
            title="Khách hàng mới"
            period1={formatNumber(
              comparison.period_1.stats.total_new_customers
            )}
            period2={formatNumber(
              comparison.period_2.stats.total_new_customers
            )}
            difference={comparison.differences.new_customers}
            icon={UserPlus}
          />
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (!statistics) return null;

    return (
      <div className="space-y-8">
        {/* Revenue Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch sử doanh thu theo thời gian
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold">Kỳ</th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Doanh thu
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">Vốn</th>
                  <th className="text-right py-3 px-2 font-semibold">Lãi</th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Đơn hàng
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Tỷ suất lãi (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {statistics.revenue_chart
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium">{item.period}</td>
                      <td className="py-3 px-2 text-right">
                        {formatCurrency(item.total_revenue)}
                      </td>
                      <td className="py-3 px-2 text-right text-orange-600">
                        {formatCurrency(item.total_cost)}
                      </td>
                      <td className="py-3 px-2 text-right text-green-600">
                        {formatCurrency(item.total_profit)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatNumber(item.total_orders)}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {item.total_cost > 0
                          ? (
                              (item.total_profit / item.total_cost) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch sử giao dịch nạp tiền
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold">Kỳ</th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Tổng tiền nạp
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Số giao dịch
                  </th>
                  <th className="text-right py-3 px-2 font-semibold">
                    Trung bình/giao dịch
                  </th>
                </tr>
              </thead>
              <tbody>
                {statistics.transaction_stats
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium">{item.period}</td>
                      <td className="py-3 px-2 text-right text-blue-600">
                        {formatCurrency(item.total_amount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatNumber(item.total_transactions)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {formatCurrency(
                          item.total_transactions > 0
                            ? item.total_amount / item.total_transactions
                            : 0
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "charts":
        return renderCharts();
      case "performance":
        return renderPerformance();
      case "transactions":
        return renderTransactions();

      case "compare":
        return renderComparison();
      case "history":
        return renderHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Thống Kê
          </h1>
          <p className="text-gray-600">
            Theo dõi hiệu suất kinh doanh SuperBee
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } group inline-flex items-center py-2 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200`}
                  >
                    <Icon
                      className={`${
                        activeTab === tab.id
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      } -ml-0.5 mr-2 h-4 w-4`}
                    />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Empty State */}
        {!loading && !statistics && activeTab !== "compare" && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có dữ liệu
            </h3>
            <p className="text-gray-500">
              Vui lòng chọn bộ lọc và nhấn "Cập nhật" để xem thống kê.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;