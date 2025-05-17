import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CategoryForm({ initialData, onSave }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [createdBy, setCreatedBy] = useState("");
  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "active");
      setCreatedBy(initialData.created_by || "");
      setUpdatedBy(initialData.updated_by || "");
    } else {
      setName("");
      setDescription("");
      setStatus("active");
      setCreatedBy("");
      setUpdatedBy("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      status,
      created_by: createdBy,
      updated_by: updatedBy,
    });
    navigate("/admin/categories");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        {initialData ? `Sửa danh mục #${initialData.id}` : "Thêm danh mục mới"}
      </h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Tên danh mục</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {initialData && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Ngày tạo</label>
            <input
              type="text"
              value={initialData.created_at}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Ngày sửa</label>
            <input
              type="text"
              value={initialData.updated_at}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Người tạo</label>
          <input
            type="text"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Người sửa</label>
          <input
            type="text"
            value={updatedBy}
            onChange={(e) => setUpdatedBy(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => navigate("/admin/categories")}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Hủy
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Lưu
        </button>
      </div>
    </form>
  );
}
