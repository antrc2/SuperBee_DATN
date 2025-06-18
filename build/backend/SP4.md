# 🧩 Hệ thống Lấy Đơn Hàng Theo Role (User/Admin) + Phân Trang

## ✅ Trường hợp 1: Dùng Phân Trang (`paginate()`)

### 🔹 Backend (Laravel)

```php
public function index(Request $request)
{
    // Role được xác định từ middleware trước đó
    $isAdmin = $request->role;

    $query = Order::query()->with(['items.product']);

    if ($isAdmin === 'admin') {
        // Admin có thể xem tất cả đơn hàng
        $query->select(['id', 'user_id', 'total', 'created_at']);
    } else {
        // User chỉ xem đơn của mình
        $query->where('user_id', $request->user()->id);
    }

    // Phân trang để tránh trả về quá nhiều bản ghi
    $orders = $query->paginate(20);

    return response()->json([
        "message" => "value",
        "data" => $orders
    ]);
}
```

### Frontend (Reactjs)

```js
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const loadOrders = async (page = 1) => {
        const res = await fetch(`/api/orders?page=${page}`);
        const json = await res.json();

        setOrders(json.data.data);
        setPagination({
            current_page: json.data.current_page,
            last_page: json.data.last_page,
            total: json.data.total,
        });
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Đơn hàng</h1>
            <ul className="space-y-2">
                {orders.map((order) => (
                    <li key={order.id} className="p-3 border rounded">
                        <p>ID: {order.id}</p>
                        <p>Tổng tiền: {order.total}</p>
                        <p>Ngày tạo: {order.created_at}</p>
                    </li>
                ))}
            </ul>

            <Pagination
                meta={pagination}
                onPageChange={(page) => loadOrders(page)}
            />
        </div>
    );
}
```

## ✅ Trường hợp 2: Không Dùng Phân Trang

## Backend

```php

public function index(Request $request)
{
    $isAdmin = $request->role;

    $query = Order::query()->with(['items.product']);

    if ($isAdmin === 'admin') {
        $query->select(['id', 'user_id', 'total', 'created_at']);
    } else {
        $query->where('user_id', $request->user()->id);
    }

    $orders = $query->get(); // Lấy toàn bộ không phân trang

    return response()->json([
        "message" => "value",
        "data" => $orders
    ]);
}
```

### Frontend

```js
import React, { useEffect, useState } from "react";

export default function OrderList() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((json) => {
                setOrders(json.data);
            });
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Tất cả đơn hàng</h1>
            <ul className="space-y-2">
                {orders.map((order) => (
                    <li key={order.id} className="p-3 border rounded">
                        <p>ID: {order.id}</p>
                        <p>Tổng tiền: {order.total}</p>
                        <p>Ngày tạo: {order.created_at}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
```
