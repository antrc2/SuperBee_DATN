import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Package,
  Calendar,
  Filter,
  Moon,
  Sun,
  BarChart3,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserPlus,
  ShoppingBag,
  Percent,
  Gift,
  MapPin,
  Zap,
  Server,
  Bell,
  MessageSquare,
  RefreshCw,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Wifi,
  Shield,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import api from "@utils/http"; // Assuming axios is used for API calls

const AdvancedDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    date_range: "today",
    start_date: "",
    end_date: "",
    period: "week", // Corresponds to chart period
    web_id: 1,
    category_id: "",
    user_id: "",
    product_status: "",
    order_status: "",
  });

  // Filter options populated from the API
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    users: [],
    webs: [],
    product_statuses: [],
    order_statuses: [],
  });

  // State to hold all dashboard data from the API
  const [dashboardData, setDashboardData] = useState(null);

  // Formatting functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // API fetching logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct query parameters from filters state
      const params = new URLSearchParams(filters);
      // In a real app, the base URL would be in an env file
      const response = await api.get("/admin/dashboard", { params });
      if (response.data && response.data.status) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch dashboard data."
        );
      }
    } catch (err) {
      setError(err.message);
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Re-create function only if filters change

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get("/admin/dashboard/filter-options");
      if (response.data && response.data.status) {
        setFilterOptions(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch filter options."
        );
      }
    } catch (err) {
      console.error("Filter options fetch error:", err);
      setError(err.message);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchFilterOptions();
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchData();
    setIsFilterOpen(false); // Close filter section after applying
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // This would typically also set a class on the <html> element
    document.documentElement.classList.toggle("dark");
  };

  // Components from your original snippet
  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    changeType,
    color = "blue",
    subtitle,
  }) => (
    <div
      className={`p-6 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${
                color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : color === "green"
                  ? "bg-green-100 text-green-600"
                  : color === "purple"
                  ? "bg-purple-100 text-purple-600"
                  : color === "red"
                  ? "bg-red-100 text-red-600"
                  : "bg-orange-100 text-orange-600"
              } ${isDarkMode && "opacity-80"}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {title}
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {typeof value === "number"
              ? title.toLowerCase().includes("revenue") ||
                title.toLowerCase().includes("doanh thu") ||
                title.toLowerCase().includes("lợi nhuận") ||
                title.toLowerCase().includes("value")
                ? formatCurrency(value)
                : formatNumber(value)
              : value}
          </p>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {change && (
          <div
            className={`flex items-center text-sm font-medium ${
              changeType === "increase" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "increase" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "", action }) => (
    <div
      className={`rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${className}`}
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <h3
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        {action}
      </div>
      <div className="px-2 pb-6 sm:px-6">{children}</div>
    </div>
  );

  const TopPerformersList = ({
    title,
    data,
    valueKey,
    valueLabel,
    icon: Icon,
  }) => (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } p-6 rounded-xl border shadow-sm`}
    >
      <h3
        className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        <Icon className="w-5 h-5" /> {title}
      </h3>
      <ul className="space-y-3">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                {item.username || item.sku || item.description}
              </span>
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-green-400" : "text-green-600"
                }`}
              >
                {valueKey.toLowerCase().includes("revenue") ||
                valueKey.toLowerCase().includes("spent")
                  ? formatCurrency(item[valueKey])
                  : `${formatNumber(item[valueKey])} ${valueLabel}`}
              </span>
            </li>
          ))
        ) : (
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            No data available for this period.
          </p>
        )}
      </ul>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        Loading dashboard...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200">
        Error: {error}
      </div>
    );
  if (!dashboardData) return null; // Or a "No data" state

  const {
    overview,
    financial,
    charts,
    game_comparison,
    user_growth,
    top_performers,
    system_health,
    real_time,
    sales_performance,
    customers,
  } = dashboardData;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-700"
      }`}
    >
      {/* Enhanced Header */}
      <header
        className={`${
          isDarkMode
            ? "bg-gray-800/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        } border-b sticky top-0 z-50 backdrop-blur-sm`}
      >
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Advanced Analytics
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Wifi className="w-3 h-3" />
                    <span>Live</span>
                  </div>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Last updated:{" "}
                    {new Date(real_time.last_updated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {real_time.online_users} online
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                    system_health.system_status
                  )}`}
                >
                  <Shield className="w-3 h-3 inline mr-1" />
                  {system_health.system_status}
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-white hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {isFilterOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={fetchData}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-white hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-white hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Filter Section */}
        {isFilterOpen && (
          <div
            className={`px-6 py-4 border-t ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.date_range}
                onChange={(e) =>
                  handleFilterChange("date_range", e.target.value)
                }
                className={`w-full p-2 text-sm border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              {filters.date_range === "custom" && (
                <>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) =>
                      handleFilterChange("start_date", e.target.value)
                    }
                    className={`w-full p-2 text-sm border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) =>
                      handleFilterChange("end_date", e.target.value)
                    }
                    className={`w-full p-2 text-sm border rounded-md ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </>
              )}
              <select
                value={filters.category_id}
                onChange={(e) =>
                  handleFilterChange("category_id", e.target.value)
                }
                className={`w-full p-2 text-sm border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="p-6">
        {/* Overview Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={overview.total_revenue}
            change={overview.revenue_growth_percentage}
            changeType={
              overview.revenue_growth_percentage >= 0 ? "increase" : "decrease"
            }
            color="green"
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Orders"
            value={overview.total_orders}
            subtitle={`${overview.completed_orders} completed`}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="New Users"
            value={overview.new_users}
            color="purple"
          />
          <StatCard
            icon={Percent}
            title="Order Completion Rate"
            value={`${overview.order_completion_rate}%`}
            color="orange"
          />
        </section>

        {/* Main Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Revenue Over Time" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={charts.revenue_over_time}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#4A5568" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="label"
                  fontSize={12}
                  tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `${value / 1000000}M`}
                  tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
                    border: "1px solid #4A5568",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Revenue by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.revenue_by_category}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {charts.revenue_by_category.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][index % 4]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Top Game Revenue Comparison (7 days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={game_comparison.labels.map((label, index) => {
                  const entry = { name: label };
                  game_comparison.datasets.forEach((ds) => {
                    entry[ds.label] = ds.data[index];
                  });
                  return entry;
                })}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#4A5568" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `${value / 1000}K`}
                  tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
                  }}
                />
                <Legend />
                {game_comparison.datasets.map((ds, index) => (
                  <Line
                    key={ds.label}
                    type="monotone"
                    dataKey={ds.label}
                    stroke={["#3B82F6", "#10B981", "#F59E0B"][index % 3]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="New User Growth (7 days)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={user_growth.labels.map((label, index) => ({
                  name: label,
                  count: user_growth.datasets[0].data[index],
                }))}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#4A5568" : "#E2E8F0"}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }}
                />
                <YAxis tick={{ fill: isDarkMode ? "#A0AEC0" : "#4A5568" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#2D3748" : "#FFFFFF",
                  }}
                />
                <Bar dataKey="count" name="New Users" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Top Performers */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TopPerformersList
            title="Top Spending Users"
            data={top_performers.top_spending_users}
            valueKey="total_spent"
            valueLabel=""
            icon={Star}
          />
          <TopPerformersList
            title="Top Rechargers"
            data={top_performers.top_rechargers}
            valueKey="total_recharged"
            valueLabel=""
            icon={PiggyBank}
          />
          <TopPerformersList
            title="Top Selling Products"
            data={top_performers.top_selling_products}
            valueKey="sales_count"
            valueLabel="sales"
            icon={Package}
          />
        </section>
      </main>
    </div>
  );
};

export default AdvancedDashboard;
