import {
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

// Component hiển thị sản phẩm
const ProductDisplay = ({ productData }) => {
  if (!productData) return null;
  let product = productData;
  if (typeof productData === "string") {
    try {
      product = JSON.parse(productData);
    } catch (e) {
      console.error("Failed to parse product JSON", productData);
      return null;
    }
  }

  const defaultImage = "https://via.placeholder.com/128x128.png?text=No+Image";

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg mx-auto">
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={product.image || defaultImage}
          alt={product.name || product.title || "Product"}
          className="w-full h-full object-cover rounded-lg border border-gray-600"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1 truncate">
          {product.name || product.title || "Tên sản phẩm"}
        </h4>
        {product.price && (
          <div className="text-xl font-bold text-green-400 mb-1">
            {typeof product.price === "number"
              ? product.price.toLocaleString("vi-VN") + " VND"
              : product.price}
          </div>
        )}
        {product.description && (
          <p className="text-gray-400 text-xs line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Xem chi tiết
            </a>
          )}
          {product.buyUrl && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <ShoppingCart className="w-3 h-3 mr-1" /> Mua ngay
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Component hiển thị nhiều sản phẩm
const ProductGrid = ({ products }) => {
  if (!products || !Array.isArray(products) || products.length === 0)
    return null;
  return (
    <div className="space-y-2">
      <h5 className="text-xs font-medium text-gray-400">
        Tìm thấy {products.length} sản phẩm:
      </h5>
      <div className="space-y-2">
        {products.map((product, index) => (
          <ProductDisplay key={index} productData={product} />
        ))}
      </div>
    </div>
  );
};
// Component parse và render nội dung phức tạp
const RichContentRenderer = ({ content }) => {
  if (!content) return null;

  const detectProducts = (text) => {
    try {
      const jsonMatches = text.match(
        /\{[^{}]*"(?:name|title|sku|price)"[^{}]*\}/g
      );
      if (!jsonMatches) return null;
      const products = jsonMatches
        .map((match) => {
          try {
            return JSON.parse(match);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      return products.length > 0 ? products : null;
    } catch (e) {
      return null;
    }
  };

  const products = detectProducts(content);
  const cleanContent = content
    .replace(/\{[^{}]*"(?:name|title|sku|price)"[^{}]*\}/g, "")
    .trim();

  const processMarkdown = (text) => {
    return text
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-700 px-1 py-0.5 rounded text-green-400 text-sm">$1</code>'
      )
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>'
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <>
      {cleanContent && (
        <div
          className="text-gray-100 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processMarkdown(cleanContent) }}
        />
      )}
      {products && (
        <div className="mt-3">
          <ProductGrid products={products} />
        </div>
      )}
    </>
  );
};

// Component hiển thị thinking process theo thời gian thực
const RealTimeThinkingProcess = ({
  toolCalls,
  isVisible,
  onToggle,
  isProcessing = false,
  isComplete = false,
}) => {
  const getToolIcon = (toolName, isProcessing = false) => {
    const iconClass = isProcessing ? "animate-pulse" : "";
    switch (toolName) {
      case "query_router":
        return <Zap className={`w-4 h-4 text-yellow-400 ${iconClass}`} />;
      case "search_product_detail_by_sku":
      case "search_products":
        return <Search className={`w-4 h-4 text-green-400 ${iconClass}`} />;
      case "add_to_cart":
        return (
          <ShoppingCart className={`w-4 h-4 text-blue-400 ${iconClass}`} />
        );
      default:
        return <Brain className={`w-4 h-4 text-purple-400 ${iconClass}`} />;
    }
  };

  const getToolDisplayName = (toolName) => {
    const toolNames = {
      query_router: "Phân tích yêu cầu",
      search_product_detail_by_sku: "Tìm kiếm sản phẩm",
      search_products: "Tìm kiếm sản phẩm",
      add_to_cart: "Thêm vào giỏ hàng",
      get_product_info: "Lấy thông tin sản phẩm",
      calculate_price: "Tính toán giá",
    };
    // return toolNames[toolName] || toolName;
    return JSON.stringify(toolNames[toolName]) || JSON.stringify(toolName);
  };

  if (toolCalls?.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className="mt-3 border-t border-gray-700 pt-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors mb-2"
      >
        <div className="flex items-center space-x-2">
          <Brain
            className={`w-4 h-4 text-blue-400 ${
              isProcessing ? "animate-pulse" : ""
            }`}
          />
          <span className="text-sm font-medium text-gray-300">
            {isProcessing ? "Đang xử lý..." : "Tiến trình tư duy"}
          </span>
          {toolCalls?.length > 0 && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              {toolCalls.length} bước
            </span>
          )}
          {isComplete && <CheckCircle className="w-4 h-4 text-green-400" />}
        </div>
        {isVisible ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isVisible && (
        <div className="bg-gray-900 rounded-lg p-3 space-y-3">
          {isProcessing && toolCalls?.length === 0 && (
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-blue-500">
                <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-200">
                  Đang phân tích yêu cầu...
                </h4>
              </div>
            </div>
          )}
          {toolCalls?.map((tool, index) => {
            const isLastTool = index === toolCalls.length - 1;
            const isToolProcessing = isProcessing && isLastTool;
            return (
              <div key={tool.id || index} className="relative">
                {index < toolCalls.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-gradient-to-b from-blue-500 to-transparent"></div>
                )}
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 ${
                      isToolProcessing
                        ? "border-blue-500 animate-pulse"
                        : "border-green-500"
                    }`}
                  >
                    {getToolIcon(tool.function?.name, isToolProcessing)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-200">
                        {getToolDisplayName(tool.function?.name)}
                      </h4>
                      {!isToolProcessing && (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                    {tool.function?.arguments && (
                      <div className="bg-gray-800 rounded p-2 text-xs break-all">
                        <code className="text-green-400 text-xs">
                          {tool.function.arguments}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isComplete && (
            <div className="mt-4 flex items-center space-x-2 text-xs text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Hoàn thành tất cả các bước.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component câu trả lời có thể inspect được
const InspectableAnswer = ({
  content,
  toolCalls,
  isStreaming = false,
  isComplete = false,
}) => {
  const [showThinking, setShowThinking] = useState(true);
  return (
    <div className="w-full max-w-none">
      <RealTimeThinkingProcess
        toolCalls={toolCalls}
        isVisible={showThinking}
        onToggle={() => setShowThinking(!showThinking)}
        isProcessing={isStreaming}
        isComplete={isComplete}
      />
      {content && (
        <div className="bg-gray-800 text-gray-100 rounded-2xl px-4 py-3 shadow-lg mt-2">
          <div className="prose prose-invert prose-sm max-w-none">
            <RichContentRenderer content={content} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([]);
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && chatRef.current && !chatRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    // Thêm placeholder tạm thời để giữ chỗ cho lượt assistant
    const assistantPlaceholderId = "assistant-placeholder-" + Date.now();
    const assistantPlaceholder = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      tool_calls: [],
      isStreaming: true,
      isComplete: false,
      created_at: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const historyToSend = newMessages.slice(0, -1); // Không gửi placeholder
      const python_url = import.meta.env.VITE_PYTHON_URL || "http://localhost:5000";
      const response = await fetch(`${python_url}/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_API_KEY",
        },
        body: JSON.stringify({ messages: historyToSend }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Lỗi từ server: ${response.status}`);
      if (!response.body) throw new Error("Không có body trong response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        try {
          const parsed = JSON.parse(chunk);
          console.log("Received chunk:", parsed);
          if (parsed.messages) {
            // Lấy các tin nhắn mới từ server (phần sau lịch sử đã gửi)
            const newMessagesFromChunk = parsed.messages.slice(
              historyToSend.length
            );
            if (newMessagesFromChunk.length > 0) {
              setMessages((prev) => {
                // Loại bỏ placeholder
                let base = prev.slice(0, -1);
                // Tạo các tin nhắn mới cho lượt hiện tại, gán ID nếu cần và trạng thái streaming/complete
                const updatedTurn = newMessagesFromChunk.map((m, idx) => ({
                  ...m,
                  id: m.id || `turn-msg-${Date.now()}-${idx}`,
                  isStreaming:
                    !parsed.finished && idx === newMessagesFromChunk.length - 1,
                  isComplete: !!parsed.finished,
                  created_at: m.created_at || new Date().toISOString(),
                }));
                return [...base, ...updatedTurn];
              });
            }
          }
        } catch (e) {
          // Bỏ qua lỗi parse cho các chunk không đầy đủ
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Lỗi khi gửi tin nhắn:", err);
        setMessages((prev) => {
          // Cập nhật placeholder thành thông báo lỗi
          return prev.map((msg) =>
            msg.role === "assistant" && msg.isStreaming
              ? {
                  ...msg,
                  content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
                  isStreaming: false,
                  isComplete: true,
                }
              : msg
          );
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      // Đảm bảo kết thúc streaming
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming
            ? { ...msg, isStreaming: false, isComplete: true }
            : msg
        )
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getGroupedMessages = () => {
    const grouped = [];
    let currentAssistantTurn = [];

    messages.forEach((msg, index) => {
      console.log("Processing message:", msg);
      if (msg.role === "user") {
        if (currentAssistantTurn.length > 0) {
          grouped.push({
            type: "assistant",
            messages: currentAssistantTurn,
            id: `assistant-turn-${index}`,
          });
          currentAssistantTurn = [];
        }
        grouped.push({ type: "user", message: msg, id: msg.id });
      } else if (msg.role === "assistant" || msg.role === "tool") {
        currentAssistantTurn.push(msg);
      }
    });

    if (currentAssistantTurn.length > 0) {
      grouped.push({
        type: "assistant",
        messages: currentAssistantTurn,
        id: `assistant-turn-final`,
      });
    }

    return grouped;
  };

  const groupedMessages = getGroupedMessages();

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group w-16 h-16"
          aria-label="Chat với AI"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img
              src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/13Bee.png"
              alt="13Bee Logo"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all duration-300"></div>
          </div>
        </button>
      ) : (
        <div
          ref={chatRef}
          className="fixed bottom-6 right-6 z-40 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl flex flex-col transition-all duration-500 ease-out w-[800px] h-[80vh]"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-gray-700 rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src="https://superbeeimages.s3.ap-southeast-2.amazonaws.com/uploads/13Bee.png"
                  alt="13Bee Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-white">
                  Trợ lý AI 13Bee
                </span>
                <div className="text-xs text-blue-100">Đang trực tuyến</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-gray-900 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {groupedMessages.map((group) => {
              if (group.type === "user") {
                return (
                  <div key={group.id} className="flex justify-end">
                    <div className="max-w-md bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl px-4 py-3 shadow-lg">
                      <div
                        className="text-white leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: (group.message.content || "").replace(
                            /\n/g,
                            "<br>"
                          ),
                        }}
                      />
                    </div>
                  </div>
                );
              }

              if (group.type === "assistant") {
                const allToolCalls = group.messages
                  .flatMap((m) => m.tool_calls || [])
                  .filter((tc) => tc.type === "function");
                const finalContent =
                  group.messages
                    .slice()
                    .reverse()
                    .find((m) => m.content)?.content || "";
                const isStreaming = group.messages.some((m) => m.isStreaming);

                const isComplete =
                  !isStreaming && (finalContent || allToolCalls.length > 0);

                return (
                  <div key={group.id} className="flex justify-start">
                    <InspectableAnswer
                      content={finalContent}
                      toolCalls={allToolCalls}
                      isStreaming={isStreaming}
                      isComplete={isComplete}
                    />
                  </div>
                );
              }
              return null;
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-3xl">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi trợ lý AI điều gì đó..."
                className="w-full bg-gray-800 border border-gray-600 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[52px] max-h-[200px]"
                rows="1"
                disabled={loading}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                aria-label="Gửi tin nhắn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
