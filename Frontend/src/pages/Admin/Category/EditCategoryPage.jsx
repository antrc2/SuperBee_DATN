import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CategoryForm from "@components/Admin/Category/CategoryForm";

export default function EditCategoryPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    // mock fetch
    const mock = { id: Number(id), name: "Laptop", description: "Portable Computers", status: "active", created_at: "2025-01-01", updated_at: "2025-03-10", created_by: "admin", updated_by: "editor" };
    setData(mock);
  }, [id]);

  const handleSave = (payload) => {
    console.log("Update #", id, payload);
  };

  if (!data) return <p>Đang tải...</p>;
  return <div className="p-6"><CategoryForm initialData={data} onSave={handleSave} /></div>;
}