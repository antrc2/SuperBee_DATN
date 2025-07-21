import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@utils/http";
import { FilePenLine, Eye, Lock, Key } from "lucide-react";
import Layout from "../../../components/Admin/Layout/Layout";
import { useNavigate } from "react-router-dom";

const DiscountCodePage = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const res = await api.get("/admin/discountcode");
        setDiscountCodes(res.data?.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountCodes();
  }, []);
  const handleAdd = () => navigate("/admin/discountcode/new");
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá mã giảm giá này không?")) {
      try {
        const res = await api.delete(`/admin/discountcode/${id}`);

        if (res.data?.data) {
          // Xoá mềm: cập nhật lại trạng thái trong danh sách
          setDiscountCodes((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ...res.data.data } : item
            )
          );
        } else {
          // Xoá cứng: loại bỏ khỏi danh sách
          setDiscountCodes((prev) => prev.filter((item) => item.id !== id));
        }
      } catch (err) {
        alert("Xoá thất bại!");
      }
    }
  };
  const handleUpdate = async (id) => {
    try {
      const res = await api.patch(`/admin/discountcode/${id}`);
      setDiscountCodes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...res.data.data } : item
        )
      );
    } catch (err) {
      alert("Khôi phục thất bại!");
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error)
    return (
      <div className="text-red-500">
        Lỗi tải dữ liệu: {error.message}
        <pre>{JSON.stringify(error.response?.data, null, 2)}</pre>
      </div>
    );

  return (
    <Layout title="Quản lý mã giảm giá"
    showAddButton={true}
    onAdd={handleAdd}
    >
      <div className="flex-grow bg-sm p-6 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="rounded-lg border transition-all border-themed/50 shadow text-sm">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Stt</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Code</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Giới hạn</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Đã dùng</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Giá trị</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Bắt đầu</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Kết thúc</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600">Trạng thái</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-sm-600 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes.map((d, index) => (
                <tr key={d.id} className="border-b">
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{index + 1}</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{d.code}</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">
                    {d.usage_limit === -1 ? "Không giới hạn" : d.usage_limit}
                  </td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{d.total_used}</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{d.discount_value}%</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{d.start_date}</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">{d.end_date}</td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600">
                    {d.status === 1 ? "Hoạt động" : "Không hoạt động"}
                  </td>
                  <td className="py-3 px-4 text-left text-sm font-semibold text-sm-600 text-center space-x-3">
                    <Link
                      to={`/admin/discountcode/${d.id}/edit`}
                      className="inline-block text-yellow-500 hover:text-yellow-600"
                      title="Sửa"
                    >
                      <FilePenLine size={20} />
                    </Link>

                    <Link
                      to={`/admin/discountcode/${d.id}`}
                      className="inline-block text-blue-500 hover:text-blue-600"
                      title="Chi tiết"
                    >
                      <Eye size={20} />
                    </Link>
      <table className="min-w-full bg-white shadow rounded text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2">Stt</th>
            <th className="px-3 py-2">Code</th>
            <th className="px-3 py-2">Giới hạn</th>
            <th className="px-3 py-2">Đã dùng</th>
            <th className="px-3 py-2">Giá trị</th>
            <th className="px-3 py-2">Bắt đầu</th>
            <th className="px-3 py-2">Kết thúc</th>
            <th className="px-3 py-2">Trạng thái</th>
            <th className="px-3 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {discountCodes.map((d,index) => (
            <tr key={d.id} className="border-b">
              <td className="px-3 py-2">{index + 1}</td>
              <td className="px-3 py-2">{d.code}</td>
              <td className="px-3 py-2">{d.usage_limit === -1 ? "Không giới hạn" : d.usage_limit}</td>
              <td className="px-3 py-2">{d.total_used}</td>
              <td className="px-3 py-2">{d.discount_value}%</td>
              <td className="px-3 py-2">{d.start_date}</td>
              <td className="px-3 py-2">{d.end_date}</td>
              <td className="px-3 py-2">{d.status===1 ? "Hoạt động" :"Không hoạt động"}</td>
              <td className="px-3 py-2 text-center space-x-3">
  <Link
    to={`/admin/discountcode/${d.id}/edit`}
    className="inline-block text-yellow-500 hover:text-yellow-600"
    title="Sửa"
  >
    <FilePenLine size={20} />
  </Link>

  <Link
    to={`/admin/discountcode/${d.id}`}
    className="inline-block text-blue-500 hover:text-blue-600"
    title="Chi tiết"
  >
    <Eye size={20} />
  </Link>

  {d.status === 1 ? (
    <span
      onClick={() => handleDelete(d.id)}
      className="inline-block text-red-500 hover:text-red-600 cursor-pointer"
      title="Xoá"
    >
      <Lock size={20} />
    </span>
  ) : (
    <span
      onClick={() => handleUpdate(d.id)}
      className="inline-block text-green-500 hover:text-green-600 cursor-pointer"
      title="Khôi phục"
    >
      <Key size={20} />
    </span>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountCodePage;
