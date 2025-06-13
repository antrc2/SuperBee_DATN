import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CartEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Thực hiện API update cart ở đây
    alert(`Cart ${id} updated successfully`);
    navigate("/admin/Cart");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Cart #{id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Customer Name:</label>
          <input type="text" className="border p-2 w-full" defaultValue="John Doe" />
        </div>
        <div>
          <label>Total:</label>
          <input type="number" className="border p-2 w-full" defaultValue="100.00" />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
