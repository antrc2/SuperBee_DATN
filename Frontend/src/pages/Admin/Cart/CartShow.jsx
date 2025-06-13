import React from "react";
import { useParams } from "react-router-dom";

export default function CartShow() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cart Details #{id}</h1>
      <div className="space-y-2">
        <p><strong>Customer:</strong> John Doe</p>
        <p><strong>Total:</strong> $150.00</p>
        <p><strong>Created at:</strong> 2024-06-11</p>
      </div>
    </div>
  );
}
