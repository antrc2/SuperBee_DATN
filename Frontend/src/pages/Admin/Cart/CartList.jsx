import React from "react";
import { Link } from "react-router-dom";

const mockCarts = [
  { id: 1, customer: "John Doe", total: 150.5 },
  { id: 2, customer: "Jane Smith", total: 299.99 },
  { id: 3, customer: "Alice Johnson", total: 89.75 },
];

export default function CartList() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cart List</h1>
      <Link
        to="/admin/Cart/new"
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block"
      >
        Create New Cart
      </Link>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockCarts.map((cart) => (
            <tr key={cart.id}>
              <td className="p-2 border">{cart.id}</td>
              <td className="p-2 border">{cart.customer}</td>
              <td className="p-2 border">${cart.total}</td>
              <td className="p-2 border space-x-2">
                <Link
                  to={`/admin/Cart/${cart.id}`}
                  className="text-blue-500 underline"
                >
                  View
                </Link>
                <Link
                  to={`/admin/Cart/${cart.id}/edit`}
                  className="text-green-500 underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
