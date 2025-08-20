"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader,
  HelpCircle,
  Clock,
  Upload,
  Paperclip,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Star,
} from "lucide-react";
import api from "../../../utils/http";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
import LoadingCon from "../../../components/Loading/LoadingCon";
import { useNotification } from "@contexts/NotificationContext";
import { useAuth } from "@contexts/AuthContext";
import ReviewModal from "@components/Client/Review/ReviewModal";

// =====================================================================
// COMPONENT CHO MODAL KHIẾU NẠI (DisputeModal)
// =====================================================================
const DISPUTE_TYPES = {
  incorrect_login: "Sai thông tin đăng nhập",
  account_banned: "Tài khoản bị khóa/hạn chế",
  wrong_description: "Sản phẩm không đúng mô tả",
  account_retrieved: "Tài khoản bị chủ cũ lấy lại",
  other: "Lý do khác",
};

const DisputeModal = ({ item, order, onClose, onDisputeSuccess }) => {
  const [disputeType, setDisputeType] = useState("incorrect_login");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleFileChange = (e) => {
    if (e.target.files.length > 20) {
      setError("Chỉ được tải lên tối đa 20 ảnh.");
      return;
    }
    const selectedFiles = Array.from(e.target.files);
    setAttachments(selectedFiles);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Vui lòng mô tả chi tiết sự cố.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("order_item_id", item.id);
    formData.append("dispute_type", disputeType);
    formData.append("description", description);
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      await api.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDisputeSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Đã có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Báo cáo sự cố
              </h3>
              <p className="text-secondary text-sm">
                Sản phẩm: {item.product?.sku || item.product_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Loại sự cố
            </label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              {Object.entries(DISPUTE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover min-h-[120px]"
              placeholder="Vui lòng mô tả rõ ràng vấn đề bạn gặp phải với tài khoản..."
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Ảnh bằng chứng (Tối đa 3 ảnh)
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-themed px-6 py-10 bg-input">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-secondary/50" />
                <div className="mt-4 flex text-sm leading-6 text-secondary">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-accent focus-within:outline-none hover:text-accent/80"
                  >
                    <span>Tải tệp lên</span>
                    <input
                      id="file-upload"
                      name="attachments"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">hoặc kéo và thả</p>
                </div>
                <p className="text-xs leading-5 text-secondary/70">
                  PNG, JPG, JPEG tối đa 2MB mỗi tệp
                </p>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-primary">
                  Tệp đã chọn:
                </h4>
                <ul className="space-y-1">
                  {attachments.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-secondary gap-2"
                    >
                      <Paperclip className="h-4 w-4" /> {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
        </form>

        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="action-button action-button-primary !w-auto bg-gradient-danger hover:brightness-110"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Gửi Khiếu nại"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// TIỆN ÍCH
// =====================================================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) amount = 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// =====================================================================
// COMPONENT CON: MODAL CHI TIẾT ĐƠN HÀNG
// =====================================================================
const OrderDetailModal = ({ order, onClose, onStartDispute }) => {
  if (!order) return null;
  const { pop } = useNotification();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleDetails = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCopyPassword = (password) => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      pop("Đã sao chép mật khẩu!", "success");
    }).catch((err) => {
      pop("Không thể sao chép mật khẩu!", "error");
    });
  };

  const renderDisputeStatus = (dispute) => {
    const statusMap = {
      0: {
        text: "Chờ xử lý",
        icon: <Clock className="h-4 w-4" />,
        className: "text-yellow-500 bg-yellow-500/10",
      },
      1: {
        text: "Đang xử lý",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        className: "text-blue-500 bg-blue-500/10",
      },
      2: {
        text: "Đã giải quyết",
        icon: <CheckCircle className="h-4 w-4" />,
        className: "text-green-500 bg-green-500/10",
      },
      3: {
        text: "Đã từ chối",
        icon: <XCircle className="h-4 w-4" />,
        className: "text-red-500 bg-red-500/10",
      },
    };
    const current = statusMap[dispute.status] || {
      text: "Không rõ",
      icon: <HelpCircle className="h-4 w-4" />,
      className: "bg-gray-500/20 text-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${current.className}`}
      >
        {current.icon}
        {current.text}
      </span>
    );
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number.parseFloat(item.unit_price),
    0
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-themed flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Chi tiết đơn hàng
              </h3>
              <p className="text-secondary text-sm font-mono">
                #{order.order_code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h4 className="font-heading text-lg font-bold text-primary mb-4">
              Danh sách sản phẩm
            </h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-background/50 rounded-lg border border-themed"
                >
                  <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                    <img
                      src={
                        item.product?.images[0]?.image_url || "/placeholder.svg"
                      }
                      alt={item.product_name || "Sản phẩm"}
                      className="h-16 w-16 object-cover rounded-lg border border-themed"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-primary">
                        SKU: {item.product?.sku || item.product_id}
                      </p>
                      <p className="text-sm font-bold text-accent">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <div className="flex flex-row md:flex-col items-start md:items-end gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => toggleDetails(item.id)}
                        className="action-button action-button-secondary !w-auto !py-2 !px-3 !text-sm"
                      >
                        {expandedItems[item.id] ? "Ẩn" : "Xem"}
                        {expandedItems[item.id] ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </button>
                      {item.dispute ? (
                        renderDisputeStatus(item.dispute)
                      ) : (
                        <button
                          onClick={() => onStartDispute(item)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          Báo cáo sự cố
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedItems[item.id] && (
                    <div className="mt-4 pt-4 border-t border-themed">
                      {item.product?.credentials &&
                      item.product.credentials.length > 0 ? (
                        <div>
                          <h5 className="font-semibold text-primary mb-2">
                            Thông tin tài khoản
                          </h5>
                          <div className="space-y-3 bg-background/50 p-4 rounded-lg border border-themed">
                            <p className="text-sm text-secondary">
                              <span className="font-medium text-primary">
                                Tên đăng nhập:
                              </span>{" "}
                              {item.product.credentials[0].username}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-secondary">
                              <span className="font-medium text-primary">
                                Mật khẩu:
                              </span>
                              <input
                                type="text"
                                value={item.product.credentials[0].password}
                                readOnly
                                className="bg-background text-same border border-themed p-1 rounded w-auto selection:bg-accent selection:text-background"
                                onFocus={(e) => e.target.select()}
                              />
                              <button
                                onClick={() =>
                                  handleCopyPassword(
                                    item.product.credentials[0].password
                                  )
                                }
                                className="p-1.5 rounded-md bg-accent/10 hover:bg-accent/20 transition-colors"
                                title="Sao chép mật khẩu"
                              >
                                <Copy className="h-4 w-4 text-accent" />
                              </button>
                            </div>
                            <i className="text-xs text-secondary/70">
                              *Click vào ô mật khẩu để xem.
                            </i>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-secondary">
                          Không có thông tin chi tiết cho sản phẩm này.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-themed pt-6">
            <h4 className="font-heading text-lg font-bold text-primary mb-4">
              Tổng kết
            </h4>
            <div className="space-y-3 bg-background/50 p-4 rounded-lg border border-themed">
              <div className="flex justify-between text-secondary">
                <span>Tạm tính:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Giảm giá (Mã: {order.promo_code || "N/A"}):</span>
                <span className="font-medium text-red-400">
                  - {formatCurrency(order.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between text-xl border-t border-themed pt-3 mt-3">
                <span className="text-primary font-bold">Thành tiền:</span>
                <span className="font-bold text-accent">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0">
          <a
            href={order.bill_url}
            className="action-button action-button-primary !w-auto p-2"
          >
            In hóa đơn
          </a>
          <button
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// COMPONENT CHÍNH: LỊCH SỬ ĐƠN HÀNG
// =====================================================================
export default function HistoryOrder() {
  const { pop } = useNotification();
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputingItem, setDisputingItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [webId, setWebId] = useState(1); // Giả định web_id = 1
  const [isFetchingReview, setIsFetchingReview] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/orders");
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAllOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (err) {
      setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user?.id) return;
    setIsFetchingReview(true);
    try {
      const response = await api.get(`/reviews/user/${user.id}`);
      if (response.data.status && response.data.data) {
        setExistingReview(response.data.data);
      } else {
        setExistingReview(null);
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra đánh giá:", err);
      pop("Không thể tải thông tin đánh giá.", "error");
    } finally {
      setIsFetchingReview(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await api.get("/orders");
      const hasCompletedOrder = response.data.data.some(
        (order) => order.status === 1
      );
      setCanReview(hasCompletedOrder);
    } catch (err) {
      console.error("Lỗi khi kiểm tra khả năng đánh giá:", err);
      setCanReview(false);
    }
  };

  const handleOpenReviewModal = async () => {
    if (existingReview) {
      // Gọi lại API để đảm bảo dữ liệu mới nhất trước khi mở modal chỉnh sửa
      await fetchUserReview();
    }
    setShowReviewModal(true);
  };

  useEffect(() => {
    fetchAllOrders();
    fetchUserReview();
    checkCanReview();
  }, [user?.id]);

  useEffect(() => {
    let result = allOrders.filter(
      (order) =>
        order.order_code.toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.status === "all" ||
          order.status.toString() === filters.status) &&
        (!filters.startDate ||
          new Date(order.created_at) >= new Date(filters.startDate)) &&
        (!filters.endDate ||
          new Date(order.created_at) <=
            new Date(
              new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            ))
    );
    setFilteredOrders(result);
  }, [filters, allOrders]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleViewDetails = async (order) => {
    try {
      const response = await api.get(`/orders/${order.id}`);
      setSelectedOrder(response.data.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
      setError("Không thể tải chi tiết đơn hàng.");
    }
  };

  const handleDisputeSuccess = async () => {
    setDisputingItem(null);
    if (selectedOrder) {
      await handleViewDetails(selectedOrder);
    }
    await fetchAllOrders();
  };

  const handleReviewSuccess = async () => {
    setShowReviewModal(false);
    await fetchUserReview();
    await checkCanReview();
  };

  const renderStatus = (status) => {
    const statusMap = {
      1: { text: "Hoàn thành", className: "bg-green-500/10 text-green-500" },
      0: { text: "Đang xử lý", className: "bg-blue-500/10 text-blue-500" },
      2: { text: "Đã hủy", className: "bg-red-500/10 text-red-500" },
    };
    const currentStatus = statusMap[status] || {
      text: "Không xác định",
      className: "bg-gray-500/20 text-gray-400",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatus.className}`}
      >
        {currentStatus.text}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingCon />;
    }
    if (error) {
      return (
        <div className="alert alert-danger">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      );
    }
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center p-10 bg-background rounded-lg border border-themed">
          <Package className="w-12 h-12 mx-auto text-secondary/50 mb-4" />
          <p className="text-secondary">Không có đơn hàng nào phù hợp.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-background p-4 rounded-xl border border-themed transition-all duration-300 hover:border-accent hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm text-secondary">
                  #{order.order_code}
                </p>
                <p className="font-semibold text-primary">
                  {formatDate(order.created_at)}
                </p>
              </div>
              {renderStatus(order.status)}
            </div>
            <div className="mt-4 pt-4 border-t border-themed flex justify-between items-end">
              <div>
                <p className="text-sm text-secondary">Tổng tiền</p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(order)}
                className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
          Lịch sử Đơn hàng
        </h1>
        <p className="text-secondary mt-1">
          Theo dõi và quản lý tất cả các đơn hàng đã mua của bạn.
        </p>
      </div>

      {/* Khu vực đánh giá */}
      <div className="border-t border-themed pt-6">
        <h4 className="font-heading text-lg font-bold text-primary mb-4 flex items-center">
          <Star size={24} className="mr-3 text-accent" />
          Đánh giá trang web
        </h4>
        {isFetchingReview ? (
          <div className="bg-background/50 p-4 rounded-lg border border-themed">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : existingReview ? (
          <div className="bg-background/50 p-4 rounded-lg border border-themed">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`h-5 w-5 ${
                    value <= existingReview.star
                      ? "text-yellow-500"
                      : "text-secondary/50"
                  }`}
                  fill={value <= existingReview.star ? "currentColor" : "none"}
                />
              ))}
            </div>
            <p className="text-sm text-secondary">
              {existingReview.comment || "Không có nhận xét."}
            </p>
            <button
              onClick={handleOpenReviewModal}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Chỉnh sửa đánh giá
            </button>
          </div>
        ) : canReview ? (
          <div className="bg-background/50 p-4 rounded-lg border border-themed">
            <p className="text-sm text-secondary">
              Bạn có thể đánh giá trang web! Hãy chia sẻ trải nghiệm của bạn.
            </p>
            <button
              onClick={handleOpenReviewModal}
              className="mt-3 action-button action-button-primary !w-auto !py-2 !px-4"
            >
              <Star className="h-4 w-4 mr-2" />
              Đánh giá ngay
            </button>
          </div>
        ) : (
          <div className="bg-background/50 p-4 rounded-lg border border-themed">
            <p className="text-sm text-secondary">
              Bạn cần có ít nhất một đơn hàng hoàn thành để đánh giá trang web.
            </p>
          </div>
        )}
      </div>

      <div className="bg-background p-4 rounded-xl border border-themed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Mã đơn hàng
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover placeholder-theme"
              placeholder="VD: #12345"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              <option value="all">Tất cả</option>
              <option value="1">Hoàn thành</option>
              <option value="0">Đang xử lý</option>
              <option value="2">Đã hủy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            />
          </div>
        </div>
      </div>

      <div className="min-h-[20rem]">{renderContent()}</div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStartDispute={(item) => setDisputingItem(item)}
        />
      )}

      {disputingItem && (
        <DisputeModal
          item={disputingItem}
          order={selectedOrder}
          onClose={() => setDisputingItem(null)}
          onDisputeSuccess={handleDisputeSuccess}
        />
      )}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={user.id}
        webId={webId}
        existingReview={existingReview}
        onReviewSuccess={handleReviewSuccess}
      />
    </section>
  );
}