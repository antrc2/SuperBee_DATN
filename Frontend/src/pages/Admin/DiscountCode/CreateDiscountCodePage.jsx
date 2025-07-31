import { useEffect, useState, useCallback } from "react";
import api from "@utils/http"; // Giả định đường dẫn đúng
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext"; // Giả định đường dẫn đúng

// --- Icons (Sử dụng SVG nội tuyến để dễ dàng tùy chỉnh) ---
const Icon = ({ children, className }) => (
  <span className={`inline-block w-5 h-5 mr-2 align-middle ${className}`}>
    {children}
  </span>
);
const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6z"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h27"
    />
  </svg>
);
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.51.054.994.093 1.485.127a18.154 18.154 0 010 2.863m-7.5 0a9.094 9.094 0 013.741-.479 3 3 0 014.682-2.72M13.5 5.25h3V7.5h-3V5.25zm-8.25 5.25h3V13.5h-3V10.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-gray-500 dark:text-gray-400"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
);

// --- Helper Components ---
const FormSection = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
        <Icon className="text-sky-600 dark:text-sky-400">{icon}</Icon>
        {title}
      </h3>
    </div>
    <div className="p-5 space-y-6">{children}</div>
  </div>
);

const FormInput = ({ label, id, error, children }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-sm text-red-600 dark:text-red-500">{error}</p>
    )}
  </div>
);

// --- Main Component ---
const CreateDiscountCodePage = () => {
  const navigate = useNavigate();
  const { pop } = useNotification();

  // --- State Management ---
  const [form, setForm] = useState({
    code: "",
    description: "",
    usage_limit: "",
    per_user_limit: "",
    discount_value: "",
    min_discount_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
  });
  const [status, setStatus] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // State cho chức năng chọn người dùng
  const [targetType, setTargetType] = useState("all");
  const [targetUserId, setTargetUserId] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/admin/discountcode/user`);
        setAllUsers(res.data?.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        pop("Không thể tải danh sách người dùng.", "e");
      }
    };
    fetchUsers();
  }, [pop]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSearch = useCallback(() => {
    setIsSearching(true);
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const filteredUsers = allUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
    );
    setSearchResults(filteredUsers);
    setIsSearching(false);
  }, [searchTerm, allUsers]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => handleSearch(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearch]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setTargetUserId(user.id);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleTargetTypeChange = (e) => {
    const newTargetType = e.target.value;
    setTargetType(newTargetType);
    if (newTargetType === "all") {
      setTargetUserId(-1);
      setSelectedUser(null);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Clone form data to manipulate before sending
    let submissionData = { ...form };

    // **ISSUE 2 FIX**: Sync usage_limit with per_user_limit if target is specific
    if (targetType === "specific") {
      submissionData.usage_limit = submissionData.per_user_limit;
    }

    const payload = {
      ...submissionData,
      discount_value: submissionData.discount_value
        ? Number(submissionData.discount_value)
        : null,
      usage_limit:
        submissionData.usage_limit !== ""
          ? Number(submissionData.usage_limit)
          : -1,
      per_user_limit:
        submissionData.per_user_limit !== ""
          ? Number(submissionData.per_user_limit)
          : -1,
      min_discount_amount:
        submissionData.min_discount_amount !== ""
          ? Number(submissionData.min_discount_amount)
          : null,
      max_discount_amount:
        submissionData.max_discount_amount !== ""
          ? Number(submissionData.max_discount_amount)
          : null,
      target_user_id: targetUserId,
      status: Number(status),
    };

    try {
      await api.post("/admin/discountcode", payload);
      pop("Tạo mã giảm giá thành công!", "s");
      navigate("/admin/discountcode");
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(
          err.response.data.errors || { form: err.response.data.message }
        );
      } else {
        setErrors({
          form: err.response?.data?.message || "Đã có lỗi hệ thống xảy ra.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // **ISSUE 3 FIX**: Common class for inputs
  const inputClasses =
    "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:text-white transition-colors";

  // --- Render ---
  return (
    <div className="font-sans bg-slate-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tạo Khuyến Mãi Mới
            </h1>
            <p className="mt-1 text-md text-gray-600 dark:text-gray-400">
              Điền thông tin chi tiết để tạo chương trình khuyến mãi.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 transition-colors"
            >
              {loading ? "Đang xử lý..." : "Lưu và Phát hành"}
            </button>
          </div>
        </div>

        {errors.form && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <FormSection title="Thông tin cơ bản" icon={<TagIcon />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Mã giảm giá"
                  id="code"
                  error={errors.code?.[0]}
                >
                  <input
                    type="text"
                    name="code"
                    id="code"
                    value={form.code}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="VD: SALEHE2025"
                  />
                </FormInput>
                <FormInput
                  label="Phần trăm giảm (%)"
                  id="discount_value"
                  error={errors.discount_value?.[0]}
                >
                  <input
                    type="number"
                    name="discount_value"
                    id="discount_value"
                    value={form.discount_value}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className={inputClasses}
                    placeholder="VD: 20"
                  />
                </FormInput>
              </div>
              <FormInput
                label="Mô tả"
                id="description"
                error={errors.description?.[0]}
              >
                <textarea
                  name="description"
                  id="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className={inputClasses}
                  placeholder="Mô tả ngắn gọn về chương trình, lợi ích cho khách hàng..."
                ></textarea>
              </FormInput>
            </FormSection>

            <FormSection title="Điều kiện áp dụng" icon={<UsersIcon />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* **ISSUE 2 FIX**: Conditionally render usage_limit */}
                {targetType === "all" && (
                  <FormInput
                    label="Tổng lượt sử dụng"
                    id="usage_limit"
                    error={errors.usage_limit?.[0]}
                  >
                    <input
                      type="number"
                      name="usage_limit"
                      id="usage_limit"
                      value={form.usage_limit}
                      onChange={handleChange}
                      min="-1"
                      className={inputClasses}
                      placeholder="-1 là không giới hạn"
                    />
                  </FormInput>
                )}
                <FormInput
                  label="Lượt dùng/Người"
                  id="per_user_limit"
                  error={errors.per_user_limit?.[0]}
                >
                  <input
                    type="number"
                    name="per_user_limit"
                    id="per_user_limit"
                    value={form.per_user_limit}
                    onChange={handleChange}
                    min="-1"
                    className={inputClasses}
                    placeholder="-1 là không giới hạn"
                  />
                </FormInput>
                <FormInput
                  label="Giá trị giảm tối thiểu (VNĐ)"
                  id="min_discount_amount"
                  error={errors.min_discount_amount?.[0]}
                >
                  <input
                    type="number"
                    name="min_discount_amount"
                    id="min_discount_amount"
                    value={form.min_discount_amount}
                    onChange={handleChange}
                    min="0"
                    className={inputClasses}
                    placeholder="Bỏ trống nếu không có"
                  />
                </FormInput>
                <FormInput
                  label="Giá trị giảm tối đa (VNĐ)"
                  id="max_discount_amount"
                  error={errors.max_discount_amount?.[0]}
                >
                  <input
                    type="number"
                    name="max_discount_amount"
                    id="max_discount_amount"
                    value={form.max_discount_amount}
                    onChange={handleChange}
                    min="0"
                    className={inputClasses}
                    placeholder="Bỏ trống nếu không có"
                  />
                </FormInput>
              </div>
            </FormSection>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            <FormSection title="Thời gian hiệu lực" icon={<CalendarIcon />}>
              <FormInput
                label="Ngày bắt đầu"
                id="start_date"
                error={errors.start_date?.[0]}
              >
                <input
                  type="datetime-local"
                  name="start_date"
                  id="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </FormInput>
              <FormInput
                label="Ngày kết thúc"
                id="end_date"
                error={errors.end_date?.[0]}
              >
                <input
                  type="datetime-local"
                  name="end_date"
                  id="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </FormInput>
            </FormSection>

            <FormSection title="Cấu hình" icon={<UsersIcon />}>
              <FormInput
                label="Trạng thái"
                id="status"
                error={errors.status?.[0]}
              >
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClasses}
                >
                  <option value={1}>Kích hoạt</option>
                  <option value={0}>Ẩn</option>
                </select>
              </FormInput>

              <FormInput
                label="Đối tượng áp dụng"
                id="target_type"
                error={errors.target_user_id?.[0]}
              >
                <div className="mt-2 space-y-2">
                  <label
                    htmlFor="target_all"
                    className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-300 dark:hover:bg-gray-700 transition-all"
                  >
                    <input
                      id="target_all"
                      name="target_type"
                      type="radio"
                      value="all"
                      checked={targetType === "all"}
                      onChange={handleTargetTypeChange}
                      className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                    />
                    <span className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Tất cả người dùng
                    </span>
                  </label>
                  <label
                    htmlFor="target_specific"
                    className="flex items-center p-3 w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-sky-50 hover:border-sky-300 dark:hover:bg-gray-700 transition-all"
                  >
                    <input
                      id="target_specific"
                      name="target_type"
                      type="radio"
                      value="specific"
                      checked={targetType === "specific"}
                      onChange={handleTargetTypeChange}
                      className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
                    />
                    <span className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Người dùng cụ thể
                    </span>
                  </label>
                </div>
              </FormInput>

              {targetType === "specific" && (
                <div className="relative">
                  {selectedUser ? (
                    <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/40 rounded-lg">
                      <div>
                        <p className="font-medium text-sky-800 dark:text-sky-200">
                          {selectedUser.username || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedUser.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setTargetUserId(null);
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold text-2xl leading-none"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SearchIcon />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:text-white"
                          placeholder="Tìm theo tên, email, hoặc ID..."
                        />
                      </div>
                      {/* **ISSUE 1 FIX**: Show 'not found' message */}
                      {searchTerm.trim() &&
                        !isSearching &&
                        searchResults.length === 0 && (
                          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                            Không tìm thấy người dùng.
                          </div>
                        )}
                      {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {searchResults.map((user, index) => (
                            <li
                              key={index}
                              onClick={() => handleSelectUser(user)}
                              className="text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-4 pr-4 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                            >
                              <span className="font-normal block truncate">
                                {user.username}{" "}
                                <span className="text-gray-500 dark:text-gray-400">
                                  ({user.email})
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}
            </FormSection>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDiscountCodePage;
