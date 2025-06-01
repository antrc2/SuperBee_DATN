import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Pagination from "@components/Admin/Category/Pagination";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([
    { id: 1, name: "Điện thoại", description: "Mobile Devices", status: "active" },
    { id: 2, name: "Laptop", description: "Portable Computers", status: "active" },
    { id: 3, name: "Phụ kiện", description: "Accessories", status: "inactive" },
    // ... thêm data demo
  ]);
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 5;

  const filtered = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [categories, query]);
  const paged = useMemo(() => filtered.slice(offset, offset + limit), [filtered, offset]);
  const totalPages = Math.ceil(filtered.length / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handleDelete = (id) => { if (window.confirm("Xóa danh mục này?")) setCategories(prev => prev.filter(c => c.id !== id)); };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOffset(0); }}
          className="border px-3 py-2 rounded"
        />
        <button onClick={() => navigate("/admin/categories/new")} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          + Thêm danh mục
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Tên</th>
            <th className="px-4 py-2">Mô tả</th>
            <th className="px-4 py-2">Trạng thái</th>
            <th className="px-4 py-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paged.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.id}</td>
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.description}</td>
              <td className="px-4 py-2">{c.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <Link to={`/admin/categories/${c.id}/edit`} className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500 text-white">Sửa</Link>
                <button onClick={() => handleDelete(c.id)} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white">Xóa</button>
              </td>
            </tr>
          ))}
          {paged.length === 0 && <tr><td colSpan="5" className="py-4 text-center text-gray-500">Không có kết quả</td></tr>}
        </tbody>
      </table>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={() => setOffset(offset - limit)} onNext={() => setOffset(offset + limit)} />
    </div>
  );
}