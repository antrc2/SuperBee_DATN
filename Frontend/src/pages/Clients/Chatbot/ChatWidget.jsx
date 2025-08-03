import { Link2, X } from "lucide-react";
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
  const python_url = import.meta.env.VITE_PYTHON_URL;
  // const [product, setProduct] = useState(null);
  const toggleChat = async () => {
    if (!open) {
    }
    setOpen(!open);
  };
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

  const chatRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (open && chatRef.current && !chatRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

      const res = await fetch(`${python_url}/chat`, {
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
      {!open ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="fixed bottom-25 right-6 z-80 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
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
      ) : (
        <button
          onClick={toggleChat}
          className="fixed bottom-[80px] right-6 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-button text-accent-contrast shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-xl"
          style={{
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={open ? "Đóng chat" : "Mở chat"}
        >
          {" "}
          <X className="w-8 h-8" />
        </button>
      )}
      {/* ####################################### */}
      {/* Khung chat */}
      {open && (
        <div ref={chatRef} className="fixed bottom-[130px] right-6 z-90 w-[800px] h-full max-h-[500px] bg-dropdown border border-themed rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 bg-content-bg border-b border-themed flex-shrink-0">
            <span className="font-bold text-lg text-primary">13Bee</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {cartError && (
            <div className="p-3 bg-red-100 text-red-700 text-sm">
              {cartError.message}
            </div>
          )}

          <div className="flex-1 bg-background p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar relative min-h-[300px]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2.5 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <span
                  className={`px-4 py-3 rounded-2xl shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-button text-accent-contrast rounded-br-none"
                      : "bg-content-bg text-primary rounded-bl-none"
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
                                  <>🛒 Thêm vào giỏ</>
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
                                  <>⚡ Mua ngay</>
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

          <div className="flex items-center p-3 bg-content-bg border-t border-themed flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 p-3 bg-input text-input border-themed rounded-xl focus:outline-none border-hover placeholder-theme"
              placeholder="Nhập câu hỏi về sản phẩm hoặc thêm vào giỏ hàng..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="action-button action-button-primary !w-auto ml-2 !px-5 !py-3"
              disabled={loading}
            >
              {loading ? <span className="animate-spin">⏳</span> : "Gửi"}
            </button>
          </div>
        </div>
      )}
      {/* <button
            onClick={toggleChat}
            className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-button text-accent-contrast shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-xl"
            aria-label={open ? "Đóng chat" : "Mở chat"}
          ></button> */}
    </>
  );
}
