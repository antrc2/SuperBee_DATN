import { Link2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useCart } from "@contexts/CartContext";

function getUserIdFromJWT(token) {
  try {
    const payload = token.split(".")[1]; // Lấy phần payload của JWT
    const decoded = JSON.parse(atob(payload));
    return decoded.user_id || null;
  } catch (e) {
    console.error("Không lấy được user_id từ token:", e);
    return null;
  }
}

export default function ChatWidget() {
  const { handleAddToCart, handlePayNow, loadingCart, cartError } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi có thể giúp gì cho bạn về sản phẩm hoặc thêm vào giỏ hàng?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  // const [product, setProduct] = useState(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Auto-focus input when chat widget opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const accessToken = sessionStorage.getItem("access_token");

      const apiKey = sessionStorage.getItem("web");

      const userId =
        getUserIdFromJWT(accessToken) || sessionStorage.getItem("guestId");
        
      const guestId =
        sessionStorage.getItem("guest_id") ||
        "guest_" + Math.random().toString(36).substring(2);

      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          message: input,
          user_id: userId || guestId,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.type === "product_list") {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: data.message,
            products: data.products,
            type: "product_list",
          },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: data.message || "Xin lỗi, tôi chưa hiểu ý bạn.",
          },
        ]);
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Lỗi kết nối máy chủ: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Nút bật/tắt chatbot */}
      {!open && (
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-5 z-80 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
        style={{
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Chat với AI"
      >
        <img
          src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/13Bee.png" // Corrected path
          alt="13Bee Logo" // Added meaningful alt text
          className="w-full h-full rounded-full object-cover" // Fills the button
        />
      </button>
    )}

    {/* Khung chat */}
    {open && (
      <div className="fixed bottom-20 right-6 z-90 w-80 md:w-96 bg-white rounded-xl shadow-2xl flex flex-col border border-blue-200">
        <div className="flex justify-between items-center px-4 py-2 bg-blue-600 rounded-t-xl">
          <span className="text-white font-bold">13Bee</span>
          <button
            onClick={() => setOpen(false)}
            className="text-white text-xl font-bold"
          >
            ×
          </button>
        </div>

          {/* Hiển thị lỗi nếu có */}
          {cartError && (
            <div className="p-3 bg-red-100 text-red-700 text-sm">
              {cartError.message}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 400 }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="prose prose-sm max-w-full text-left">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.type === "product_list" && msg.products && (
                      <div className="mt-3 space-y-4">
                        {msg.products.map((product, pIdx) => (
                          <div
                            key={pIdx}
                            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                          >
                            <Link to={`/acc/${product.sku}`}>
                              <div className="font-semibold text-blue-600">
                                Acc {product.category}
                              </div>
                              <div className="text-red-600 font-bold">
                                Giá: {product.price.toLocaleString()}đ
                              </div>

                              {/* Hiển thị attributes */}
                              {Object.entries(product.attributes).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="text-sm text-gray-600"
                                  >
                                    <span className="font-medium">{key}:</span>{" "}
                                    {value}
                                  </div>
                                )
                              )}

                              <div className="text-sm text-gray-500">
                                Mã SP: {product.sku}
                              </div>
                            </Link>

                            {/* Hiển thị hình ảnh */}
                            {product.image && (
                              <img
                                src={product.image}
                                alt={`Hình ảnh acc ${product.sku}`}
                                className="mt-2 max-w-full h-auto rounded"
                                style={{ maxHeight: "150px" }}
                              />
                            )}

                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                disabled={loadingCart}
                              >
                                {loadingCart ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <>
                                    🛒 Thêm vào giỏ
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handlePayNow(product)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                disabled={loadingCart}
                              >
                                {loadingCart ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  <>
                                    ⚡ Mua ngay
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="mt-2 text-xs text-blue-500">
                              Gõ: "Thêm acc {product.sku} vào giỏ"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="flex border-t p-2 bg-gray-50">
            <input
              ref={inputRef}
              type="text"
              className="text-black flex-1 border rounded px-3 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu hỏi về sản phẩm hoặc thêm vào giỏ hàng..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? <span className="animate-spin">⏳</span> : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}