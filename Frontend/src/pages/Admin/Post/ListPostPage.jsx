// @pages/Admin/Posts/PostsListPage.jsx
import { Link } from "react-router-dom";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";

export default function PostsListPage({ posts, handleKey, handleLock }) {
  // Hàm giới hạn ký tự
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

  // Đảm bảo posts là mảng
  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              STT
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Tiêu đề
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Danh mục
            </th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Ngày tạo
            </th>
           
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {safePosts.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-3 px-4 text-center text-sm text-gray-700">
                Không có bài viết nào.
              </td>
            </tr>
          ) : (
            safePosts.map((post, index) => (
              <tr key={post.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{index + 1}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {truncateText(post.title, 50)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {post.category?.name || "Không có danh mục"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {formatDate(post.created_at)}
                </td>
                
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      post.status === 1
                        ? "bg-green-100 text-green-800"
                        : post.status === 2
                        ? "bg-yellow-100 text-yellow-800"
                        : post.status === 0
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {post.status === 1
                      ? "Đã xuất bản"
                      : post.status === 2
                      ? "Lưu trữ"
                      : post.status === 0
                      ? "Nháp"
                      : "Không xác định"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-4">
                    <Link to={`/admin/post/${post.slug}`} title="Xem chi tiết">
                      <Eye
                        className="text-green-500 hover:text-green-700 cursor-pointer"
                        size={20}
                      />
                    </Link>
                    <Link to={`/admin/post/${post.slug}/edit`} title="Chỉnh sửa">
                      <FilePenLine
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        size={20}
                      />
                    </Link>
                    {post.status === 1 ? (
                      <button
                        onClick={() => handleLock(post.id)}
                        title="Hủy xuất bản"
                      >
                        <Lock
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          size={20}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleKey(post.id)}
                        title="Xuất bản lại"
                      >
                        <Key
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          size={20}
                        />
                      </button>
                    )}
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