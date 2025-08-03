// ListPostPage.jsx

import { Link } from "react-router-dom";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";

export default function PostsListPage({ posts, handleKey, handleLock }) {
  const truncateText = (text, maxLength) => {
    if (typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const safePosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              STT
            </th>
            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Tiêu đề
            </th>
            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Danh mục
            </th>
            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {safePosts.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="py-8 px-4 text-center text-gray-500 dark:text-gray-400"
              >
                Không có bài viết nào để hiển thị.
              </td>
            </tr>
          ) : (
            safePosts.map((post, index) => (
              <tr
                key={post.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {truncateText(post.title, 60)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                  {post.category?.name || "Không có"}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(post.created_at)}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      post.status === 1
                        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                        : post.status === 2
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        : post.status === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    }`}
                  >
                    {post.status === 1
                      ? "Xuất bản"
                      : post.status === 2
                      ? "Lưu trữ"
                      : post.status === 0
                      ? "Nháp"
                      : "Không rõ"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <Link to={`/admin/post/${post.slug}`} title="Xem chi tiết">
                      <Eye
                        className="text-gray-500 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors"
                        size={18}
                      />
                    </Link>
                    <Link
                      to={`/admin/post/${post.slug}/edit`}
                      title="Chỉnh sửa"
                    >
                      <FilePenLine
                        className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        size={18}
                      />
                    </Link>
                    {post.status === 1 ? (
                      <button
                        onClick={() => handleLock(post.id)}
                        title="Hủy xuất bản"
                      >
                        <Lock
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                          size={18}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleKey(post.id)}
                        title="Xuất bản"
                      >
                        <Key
                          className="text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 cursor-pointer transition-colors"
                          size={18}
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
