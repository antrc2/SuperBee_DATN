// src/pages/Admin/Category/CategoryListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import { Plus, Search, Folder } from "lucide-react";
import CategoryRow from "@components/Admin/Category/CategoryRow"; // Import component con

const CategoryListPage = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: "", status: "" });
  const { pop, conFim } = useNotification();
  const [expandedIds, setExpandedIds] = useState([]);
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/categories");
      setAllCategories(response.data.data);
    } catch (err) {
      pop("Lỗi khi tải danh mục", "e");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [pop]);

  const filterTree = (nodes, nameFilter, statusFilter) => {
    return nodes.reduce((acc, node) => {
      const children = node.children
        ? filterTree(node.children, nameFilter, statusFilter)
        : [];
      const nameMatch = nameFilter
        ? node.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const statusMatch =
        statusFilter !== "" ? node.status.toString() === statusFilter : true;
      if ((nameMatch && statusMatch) || children.length > 0) {
        acc.push({ ...node, children });
      }
      return acc;
    }, []);
  };

  const filteredCategories = useMemo(() => {
    return filterTree(allCategories, filters.name, filters.status);
  }, [allCategories, filters]);

  // HÀM MỚI: Xử lý việc mở/đóng một danh mục
  const toggleCategory = (categoryId) => {
    setExpandedIds(
      (prevIds) =>
        prevIds.includes(categoryId)
          ? prevIds.filter((id) => id !== categoryId) // Nếu đã có, xóa đi (đóng)
          : [...prevIds, categoryId] // Nếu chưa có, thêm vào (mở)
    );
  };
  const handleDelete = async (categoryId) => {
    const isConfirmed = await conFim(
      "Bạn có chắc chắn muốn xóa danh mục này? Mọi danh mục con cũng sẽ bị xóa."
    );

    if (isConfirmed) {
      try {
        const response = await api.delete(`/admin/categories/${categoryId}`);
        if (response.status === 200) {
          pop("Xóa danh mục thành công!", "s");
          fetchCategories(); // Tải lại danh sách để cập nhật giao diện
        }
      } catch (error) {
        pop(
          error.response?.data?.message || "Xóa thất bại, đã có lỗi xảy ra.",
          "e"
        );
        console.error("Error deleting category:", error);
      }
    }
  };
  return (
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Quản lý Danh mục
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổ chức và quản lý tất cả các danh mục sản phẩm.
          </p>
        </div>
        <Link to="/admin/categories/new">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500">
            <Plus size={18} />
            Thêm danh mục
          </button>
        </Link>
      </header>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên danh mục..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Hoạt động</option>
            <option value="0">Ẩn</option>
          </select>
        </div>
      </div>

      {/* Bảng hiển thị */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th scope="col" className="px-4 py-3">
                Tên danh mục
              </th>
              <th scope="col" className="px-6 py-3">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4" colSpan="6">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-16 text-slate-500">
                  <Folder size={48} className="mx-auto mb-2" />
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  searchTerm={filters.name}
                  // Truyền state và hàm xử lý xuống component con
                  expandedIds={expandedIds}
                  onToggle={toggleCategory}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryListPage;
