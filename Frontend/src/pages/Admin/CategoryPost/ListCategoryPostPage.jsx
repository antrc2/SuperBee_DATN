// @pages/Admin/Posts/PostsListPage.jsx
import { Await, Link } from "react-router-dom";
import { FilePenLine,Trash,  Eye, Lock, Key } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";
import api from "../../../utils/http";

export default function ListCategoryPostPage({ categories,onRefresh}) {
  // Hàm giới hạn ký tự
  const { pop, conFim } = useNotification();
  const truncateText = (text, maxLength) => {
    if (typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
 const handleDeleteCategory = async (slug) => {
  const ok = await conFim("Bạn có chắc chắn muốn xóa danh mục này không?");
  if (!ok) return;

  try {
    const response = await api.delete(`/admin/categoryPost/${slug}`);

    if (response.data?.status === true) {
      pop("Xóa danh mục thành công", "s");
      // Gọi lại danh sách thay vì reload trang
      await onRefresh(); // gọi hàm bạn đã truyền từ props
    } else {
      pop(response.data?.message || "Xóa danh mục thất bại", "e");
    }
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    pop("Xóa danh mục thất bại", "e");
  }
};


  // Đảm bảo posts là mảng
  const safeCategoryPosts = Array.isArray(categories) ? categories : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              STT
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Tên danh mục
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Mô tả
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
             Ngày tạo
            </th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {safeCategoryPosts.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-3 px-4 text-center text-sm text-gray-700">
                Không có bài viết nào.
              </td>
            </tr>
          ) : (
            safeCategoryPosts.map((category, index) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {truncateText(category.name)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {category.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {formatDate(category.created_at)}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-4">
                   
                    <Link to={`/admin/categoryPost/${category.slug}/edit`} title="Chỉnh sửa">
                      <FilePenLine
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        size={20}
                      />
                    </Link>
                    <button title="Xóa danh mục" onClick={() => handleDeleteCategory(category.slug)}>
                      <Trash
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        size={20}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}