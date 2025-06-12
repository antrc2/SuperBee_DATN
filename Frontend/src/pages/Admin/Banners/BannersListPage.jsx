import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePenLine, LoaderCircle, Eye, Lock, Key } from "lucide-react";
import BannersPageLayout from "./BannersPageLayout"; // Tái sử dụng layout sản phẩm
import api from "@utils/http";
import { X } from "lucide-react";
export default function BannersListPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/banners");
      setBanners(response.data.data);
    } catch (err) {
      setError("Không thể tải danh sách banner.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);


const handleDelete = async (id) => {
  if (window.confirm("Bạn có chắc chắn muốn xoá banner này?")) {
    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert("Xoá banner thất bại.");
    }
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <BannersPageLayout>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ảnh</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tiêu đề</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Link</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <img src={banner.image_url} alt="Banner" className="w-32 h-auto rounded" />
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{banner.title || "Không có tiêu đề"}</td>
                <td className="py-3 px-4 text-sm text-blue-600 underline">{banner.link}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      banner.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {banner.status === 1 ? "Hiển thị" : "Đã ẩn"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-4">
                    <Link to={`/admin/banners/${banner.id}`} title="Xem chi tiết">
                      <Eye className="text-green-500 hover:text-green-700 cursor-pointer" size={20} />
                    </Link>
                    <Link to={`/admin/banners/${banner.id}/edit`} title="Chỉnh sửa">
                      <FilePenLine className="text-blue-500 hover:text-blue-700 cursor-pointer" size={20} />
                    </Link>
                    <button onClick={() => handleDelete(banner.id)} title="Xoá banner">
                        <X className="text-red-500 hover:text-red-700 cursor-pointer" size={20} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BannersPageLayout>
  );
}
