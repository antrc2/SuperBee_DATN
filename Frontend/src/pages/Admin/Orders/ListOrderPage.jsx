import React, { useState, useEffect, useMemo } from "react";
import api from "@utils/http";
import { Link } from "react-router-dom";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Layout from "@components/Admin/Layout/Layout";

const LOCAL_SEARCHABLE_KEYS = ["order_code","total_amount", "user.username","items.product.sku","items.product.game_attributes.attribute_key"];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const renderStatus = (status) => {
  switch (status) {
    case 1:
      return <span className="badge badge-success">Hoàn thành</span>;
    case 0:
      return <span className="badge badge-warning">Đang xử lý</span>;
    case 2:
      return <span className="badge badge-destructive">Đã hủy</span>;
    default:
      return <span className="badge">Không xác định</span>;
  }
};

const Pagination = ({ links, onPageChange }) => {
  if (!links || links.length <= 3) return null;

  const handlePageClick = (link) => {
    if (link.url) {
      const pageNumber = new URL(link.url).searchParams.get("page");
      if (pageNumber) {
        onPageChange(parseInt(pageNumber));
      }
    }
  };

  return (
    <nav className="pagination">
      <div className="pagination-buttons">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(link)}
            disabled={!link.url}
            className={`btn ${link.active ? "btn-active" : ""} ${
              !link.url ? "btn-disabled" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </nav>
  );
};

export default function ListOrderPage() {
  const [ordersData, setOrdersData] = useState({
    data: [],
    links: [],
    total: 0,
    from: 0,
    to: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "all" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTermLocal, setSearchTermLocal] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage });
        if (filters.status !== "all") {
          params.append("status", filters.status);
        }
        const response = await api.get("/admin/orders", { params });
        setOrdersData(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentPage, filters]);

  const ordersDisplayed = useMemo(() => {
    if (!searchTermLocal) return ordersData.data;
    const term = searchTermLocal.toLowerCase();
    return ordersData.data.filter((item) => {
      return LOCAL_SEARCHABLE_KEYS.some((key) => {
        const value = key.split(".").reduce((acc, cur) => acc?.[cur], item);
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }, [ordersData.data, searchTermLocal]);

  const toggleRow = (orderId) => {
    setExpandedRows((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách đơn hàng"
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}
      showBackButton={false}
      showfilter={false}
    >
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex-grow bg-sm p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="rounded-lg border transition-all border-themed/50 shadow text-sm">
                <tr>
                  <th></th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Mã đơn hàng
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Người mua
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Ngày đặt
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Tổng tiền
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Trạng thái
                  </th>
                  <th className="py-3 px-4 text-left font-semibold">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersDisplayed.length > 0 ? (
                  ordersDisplayed.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="border-b hover:bg-sm-50">
                        <td
                          className="px-2 cursor-pointer"
                          onClick={() => toggleRow(order.id)}
                        >
                          {expandedRows.includes(order.id) ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </td>
                        <td className="py-3 px-4">#{order.order_code}</td>
                        <td className="py-3 px-4">{order.user.username}</td>
                        <td className="py-3 px-4">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          {renderStatus(order.status)}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Eye />
                          </Link>
                        </td>
                      </tr>
                      {expandedRows.includes(order.id) && (
                        <tr className="border-b hover:bg-sm-50">
                          <td colSpan="7" className="p-4">
                            <div className="text-base font-semibold mb-3 text-xl-800">
                              Sản phẩm trong đơn hàng:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {order.items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-start gap-4 rounded-lg border shadow transition-all border-themed/50 p-6 shadow p-6 space-y-2"
                                >
                                  <img
                                    src={item.product.images?.[0]?.image_url}
                                    alt={
                                      item.product.images?.[0]?.alt_text ||
                                      "Ảnh sản phẩm"
                                    }
                                    className="w-20 h-20 object-cover rounded-md border"
                                  />
                                  <div className="flex flex-col gap-1">
                                    <div className="font-medium text-sm-500">
                                      Mã SP:{" "}
                                      <span className="font-semibold">
                                        {item.product.sku}
                                      </span>
                                    </div>
                                    <div className="font-medium text-sm-500">
                                      Giá: {formatCurrency(item.unit_price)}
                                    </div>
                                    <div className="font-medium text-sm-500">
                                      Thuộc tính:
                                      <ul className="list-disc list-inside ml-2">
                                        {item.product.game_attributes?.map(
                                          (attr) => (
                                            <li key={attr.id}>
                                              {attr.attribute_key}:{" "}
                                              {attr.attribute_value}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )) || <div>Không có dữ liệu.</div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">
                      Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
