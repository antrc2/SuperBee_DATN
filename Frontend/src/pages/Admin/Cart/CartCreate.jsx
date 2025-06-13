import React from "react";
import { useNavigate } from "react-router-dom";

export default function CartCreate() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Thực hiện API tạo mới cart ở đây
    alert("Cart created successfully");
    navigate("/admin/Cart");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Cart</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Customer Name:</label>
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <label>Total:</label>
          <input type="number" className="border p-2 w-full" placeholder="0.00" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}
