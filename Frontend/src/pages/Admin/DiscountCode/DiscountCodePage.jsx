import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@utils/http";

const DiscountCodePage = () => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý mã giảm giá</h1>
        <Link to="/admin/discountcode/new">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            + Thêm mã giảm giá
          </button>
        </Link>
      </div>

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
              <td className="px-3 py-2 text-center space-x-2">
                <Link to={`/admin/discountcode/${d.id}/edit`}>
                  <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">
                    Sửa
                  </button>
                </Link>
                <Link to={`/admin/discountcode/${d.id}`}>
                  <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">
                    Chi tiết
                  </button>
                </Link>
                {d.status === 1 ? (
                   <button
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                  onClick={() => handleDelete(d.id)}
                >
                  Xoá
                </button>
                ) : (
                   <button
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                  onClick={() => handleUpdate(d.id)}
                >
                  Khôi phục
                </button>
                ) }
               
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountCodePage;