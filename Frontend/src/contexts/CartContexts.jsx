import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@utils/http";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationProvider";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export function CartProvider({ children }) {
  const navigator = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { pop } = useNotification();
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartError, setCartError] = useState(null);

  const fetchCartItems = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }
    setLoadingCart(true);
    setCartError(null);
    try {
      const response = await api.get("/carts");
      if (response.data.status) {
        setCartItems(response.data?.data);
      } else {
        pop("Không thể tải giỏ hàng: " + response.data?.data.message, "e");
        setCartError({ message: response.data?.data.message });
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tải giỏ hàng.";
      pop(errorMessage, "e");
      setCartError({ message: errorMessage });
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, pop]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleAddToCart = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        pop("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", "i");
        localStorage.setItem("location", `acc/${product.sku}`);
        return { success: false, message: "Not logged in" };
      }
      if (!product) return;
      const payload = { product_id: product.id };
      const a = cartItems.find((item) => item.product.id === product.id);
      if (a) {
        pop("Sản phẩm đã có trong giỏ hàng!", "i");
        return;
      }
      setLoadingCart(true);
      try {
        const response = await api.post("/carts", payload);
        if (response.data.status) {
          const dataNew = { product: { ...product } };
          setCartItems((prevItems) => [...prevItems, dataNew]);
          pop("Thêm sản phẩm vào giỏ hàng thành công!", "s");
          return { success: true };
        } else {
          pop("Không thể thêm sản phẩm: " + response.data.message, "e");
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Lỗi khi thêm sản phẩm vào giỏ hàng.";
        pop(errorMessage, "e");
        return { success: false, message: errorMessage };
      } finally {
        setLoadingCart(false);
      }
    },
    [cartItems, isLoggedIn, pop]
  );
  // Hàm xóa một sản phẩm khỏi giỏ hàng
  const removeItem = useCallback(
    async (itemId) => {
      try {
        if (!user) return;
        await api.delete(`/carts/${itemId}`);
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      } catch (error) {
        console.error(`Lỗi khi xóa sản phẩm ${itemId}:`, error);
        pop("Xóa sản phẩm thất bại, vui lòng thử lại.", "e");
      }
    },
    [pop, user]
  );
  const handlePayNow = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        pop("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", "i");
        localStorage.setItem("location", `acc/${product.sku}`);
        return { success: false, message: "Not logged in" };
      }
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
    },
    [cartItems, isLoggedIn, pop]
  );

  // Cung cấp cả state và các hàm để thao tác với state
  const value = {
    cartItems,
    handlePayNow,
    loadingCart,
    cartError,
    fetchCartItems,
    removeItem,
    handleAddToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
