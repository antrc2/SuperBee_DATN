// src/contexts/CartContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../utils/http"; // Giả định bạn đã có file cấu hình axios này
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();
  const navigator = useNavigate();
  // Sử dụng useCallback để tránh tạo lại hàm getCart mỗi lần render
  const getCart = useCallback(async () => {
    try {
      if (!user) return;
      const res = await api.get("/carts");
      setCartItems(res.data?.data?.items || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      // Nếu có lỗi (ví dụ: token hết hạn), set giỏ hàng về rỗng
      setCartItems([]);
    }
  }, []);

  // Hàm xóa một sản phẩm khỏi giỏ hàng
  const removeItem = async (itemId) => {
    try {
      if (!user) return;
      // Giả sử endpoint để xóa item là `/cart/items/{id}` với phương thức DELETE
      // Bạn cần thay đổi endpoint này cho đúng với API của bạn
      await api.delete(`/carts/${itemId}`);

      // Sau khi xóa thành công ở server, gọi lại getCart để cập nhật UI
      await getCart();
      // Hoặc cập nhật state trực tiếp để có hiệu ứng tức thì
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm ${itemId}:`, error);
      // Thông báo cho người dùng nếu cần
      alert("Xóa sản phẩm thất bại, vui lòng thử lại.");
    }
  };
  // thêm một sản phẩm vào giỏ hàng
  const handleAddToCart = async (product) => {
    if (!user) return;
    if (!product) return;
    const payload = { product_id: product.id };
    const a = cartItems.find((item) => item.product.id === product.id);
    if (a) {
      alert("Sản phẩm đã có trong giỏ hàng!");
      return;
    }
    try {
      const res = await api.post("/carts", payload);
      if (res.data.status) {
        setCartItems((prevItems) => [...prevItems, product]);
        alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      // Bắt lỗi chính xác từ BE trả về
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("❌ Lỗi hệ thống, vui lòng thử lại sau.");
      }
    }
  };
  const handlePayNow = async (product) => {
    if (!user) return;
    if (!product) return;
    const payload = { product_id: product.id };
    const a = cartItems.find((item) => item.product.id === product.id);
    if (a) {
      navigator("/cart");
      return;
    }
    try {
      const res = await api.post("/carts", payload);
      if (res.data.status) {
        navigator("/cart");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      // Bắt lỗi chính xác từ BE trả về
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("❌ Lỗi hệ thống, vui lòng thử lại sau.");
      }
    }
  };

  useEffect(() => {
    getCart();
  }, [getCart]);

  // Cung cấp cả state và các hàm để thao tác với state
  const value = {
    cartItems,
    handlePayNow,
    getCart,
    removeItem,
    handleAddToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook để sử dụng context dễ dàng hơn
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
