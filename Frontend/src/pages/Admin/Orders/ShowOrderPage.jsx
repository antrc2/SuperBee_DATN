import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../utils/http";

export default function ShowOrderPage() {
  const [order, setOrder] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/admin/orders/${id}`);
        const productData = response.data;
        setOrder(productData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!order || !order.order || order.order.length === 0) {
    return <div className="p-4 text-center">No order details available.</div>;
  }

  const orderDetails = order.order[0].order; // Assuming all items belong to the same order
  const productsInOrder = order.order;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h1>

      {/* Order Summary */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Order Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p>
            <strong className="text-gray-700">Order Code:</strong>{" "}
            {orderDetails.order_code}
          </p>
          <p>
            <strong className="text-gray-700">Total Amount:</strong>{" "}
            {orderDetails.total_amount}
          </p>
          <p>
            <strong className="text-gray-700">Status:</strong>{" "}
            {orderDetails.status === 1 ? "Completed" : "Pending"}
          </p>
          <p>
            <strong className="text-gray-700">Discount Amount:</strong>{" "}
            {orderDetails.discount_amount}
          </p>
          <p>
            <strong className="text-gray-700">Ordered By:</strong>{" "}
            {orderDetails.user.username} ({orderDetails.user.email})
          </p>
          <p>
            <strong className="text-gray-700">Order Date:</strong>{" "}
            {new Date(orderDetails.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Products in Order */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">
          Products in This Order
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Product SKU</th>
                <th className="py-3 px-6 text-left">Unit Price</th>
                <th className="py-3 px-6 text-left">Product Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {productsInOrder.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {item.product.sku}
                  </td>
                  <td className="py-3 px-6 text-left">{item.unit_price}</td>
                  <td className="py-3 px-6 text-left">{item.product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
