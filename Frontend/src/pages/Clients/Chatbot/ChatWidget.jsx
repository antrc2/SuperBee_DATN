// File: src/pages/Clients/Chatbot/ChatWidget.jsx (Fixed version)
import {
  Send,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Search,
  ShoppingCart,
  CheckCircle,
  Settings,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";

// Sao chép các component từ ChatWidget gốc
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
    <div className="flex items-center gap-4 p-4 bg-input border-themed rounded-xl transition-all duration-300 hover:border-hover category-card-glow w-full max-w-lg mx-auto">
      <div className="flex-shrink-0 w-24 h-24">
        <img
          src={product.image || defaultImage}
          alt={product.name || product.title || "Product"}
          className="w-full h-full object-cover rounded-lg border border-themed"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-heading font-bold text-primary mb-2 truncate">
          {product.name || product.title || "Tên sản phẩm"}
        </h4>
        {product.price && (
          <div className="text-lg font-bold text-accent mb-2">
            {typeof product.price === "number"
              ? product.price.toLocaleString("vi-VN") + " VND"
              : product.price}
          </div>
        )}
        {product.description && (
          <p className="text-secondary text-xs line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-button modal-button-cancel text-xs"
            >
              Xem chi tiết
            </a>
          )}
          {product.buyUrl && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-button modal-button-confirm text-xs inline-flex items-center"
            >
              <ShoppingCart className="w-3 h-3 mr-1" /> Mua ngay
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductGrid = ({ products }) => {
  if (!products || !Array.isArray(products) || products.length === 0)
    return null;
  return (
    <div className="space-y-3">
      <h5 className="text-xs font-heading font-semibold text-secondary">
        Tìm thấy {products.length} sản phẩm:
      </h5>
      <div className="space-y-3">
        {products.map((product, index) => (
          <ProductDisplay key={index} productData={product} />
        ))}
      </div>
    </div>
  );
};

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

  // ✅ MARKDOWN OPTIONS
  const markdownOptions = {
    overrides: {
      // Headers
      h1: {
        component: "h1",
        props: {
          className: "text-2xl font-heading font-bold text-primary mt-5 mb-4",
        },
      },
      h2: {
        component: "h2",
        props: {
          className: "text-xl font-heading font-bold text-primary mt-5 mb-3",
        },
      },
      h3: {
        component: "h3",
        props: {
          className: "text-lg font-heading font-bold text-primary mt-4 mb-3",
        },
      },

      // Text formatting
      strong: {
        component: "strong",
        props: { className: "font-heading font-bold text-primary" },
      },
      em: {
        component: "em",
        props: { className: "italic text-secondary" },
      },

      // Links
      a: {
        component: "a",
        props: {
          className:
            "text-accent hover:text-highlight underline transition-colors duration-200",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },

      // Images
      img: {
        component: "img",
        props: { className: "max-w-full h-auto rounded-lg my-3" },
      },

      // Code
      code: {
        component: "code",
        props: {
          className: "bg-same px-2 py-1 rounded text-accent text-sm font-mono",
        },
      },

      // Code blocks
      pre: {
        component: "pre",
        props: { className: "bg-same p-4 rounded-lg overflow-x-auto my-3" },
      },

      // Paragraphs
      p: {
        component: "p",
        props: { className: "mb-3 last:mb-0" },
      },

      // Lists
      ul: {
        component: "ul",
        props: { className: " mb-3 space-y-1 ml-4" },
      },
      ol: {
        component: "ol",
        props: { className: " mb-3 space-y-1 ml-4" },
      },
      li: {
        component: "li",
        props: { className: "text-primary" },
      },

      // Blockquotes
      blockquote: {
        component: "blockquote",
        props: {
          className: "border-l-4 border-accent pl-4 my-4 italic text-secondary",
        },
      },

      // Tables (bonus)
      table: {
        component: "table",
        props: {
          className: "min-w-full border-collapse border border-themed my-4",
        },
      },
      thead: {
        component: "thead",
        props: { className: "bg-input" },
      },
      th: {
        component: "th",
        props: {
          className:
            "border border-themed px-4 py-2 text-left font-heading font-semibold",
        },
      },
      td: {
        component: "td",
        props: { className: "border border-themed px-4 py-2" },
      },

      // Horizontal rule
      hr: {
        component: "hr",
        props: { className: "my-6 border-themed" },
      },
    },
  };

  return (
    <>
      {cleanContent && (
        <div className="text-primary leading-relaxed">
          <Markdown options={markdownOptions}>{cleanContent}</Markdown>
        </div>
      )}
      {products && (
        <div className="mt-4">
          <ProductGrid products={products} />
        </div>
      )}
    </>
  );
};

// ✅ NEW: Enhanced thinking process with both tool calls and tool responses
const RealTimeThinkingProcess = ({
  thinkingSteps,
  isVisible,
  onToggle,
  isProcessing = false,
  isComplete = false,
}) => {
  const getToolIcon = (stepType, toolName, isProcessing = false) => {
    const iconClass = isProcessing ? "animate-pulse" : "";

    if (stepType === "tool_response") {
      return <Settings className={`w-4 h-4 text-highlight ${iconClass}`} />;
    }

    switch (toolName) {
      case "query_router":
        return <Zap className={`w-4 h-4 text-accent ${iconClass}`} />;
      case "search_product_detail_by_sku":
      case "search_products":
      case "get_list_product_by_category":
        return <Search className={`w-4 h-4 text-tertiary ${iconClass}`} />;
      case "add_to_cart":
        return (
          <ShoppingCart className={`w-4 h-4 text-highlight ${iconClass}`} />
        );
      case "sitemap_crawl":
      case "url_crawl":
        return <Brain className={`w-4 h-4 text-accent ${iconClass}`} />;
      default:
        return <Brain className={`w-4 h-4 text-accent ${iconClass}`} />;
    }
  };

  const getStepDisplayName = (stepType, toolName) => {
    if (stepType === "tool_response") {
      return "Kết quả từ công cụ";
    }

    const toolNames = {
      query_router: "Phân tích yêu cầu",
      search_product_detail_by_sku: "Tìm kiếm sản phẩm",
      search_products: "Tìm kiếm sản phẩm",
      add_to_cart: "Thêm vào giỏ hàng",
      get_product_info: "Lấy thông tin sản phẩm",
      calculate_price: "Tính toán giá",
      sitemap_crawl: "Thu thập dữ liệu sitemap",
      url_crawl: "Thu thập dữ liệu trang web",
      get_list_product_by_category: "Tìm kiếm sản phẩm theo danh mục",
    };
    return toolNames[toolName] || toolName;
  };

  // ✅ Always show thinking process if there are steps OR if processing
  if (!thinkingSteps && !isProcessing) {
    return null;
  }

  const displaySteps = thinkingSteps || [];

  return (
    <div className="mt-4 border-t border-themed pt-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 bg-input hover:bg-same border-themed rounded-lg transition-all duration-200 mb-3 border-hover"
      >
        <div className="flex items-center space-x-3">
          <Brain
            className={`w-5 h-5 text-accent ${
              isProcessing ? "animate-pulse" : ""
            }`}
          />
          <span className="text-sm font-heading font-semibold text-primary">
            {isProcessing ? "Đang xử lý..." : "Tiến trình tư duy"}
          </span>
          {displaySteps.length > 0 && (
            <span className="text-xs bg-gradient-button text-accent-contrast px-3 py-1 rounded-full font-bold">
              {displaySteps.length} bước
            </span>
          )}
          {isComplete && <CheckCircle className="w-4 h-4 text-tertiary" />}
        </div>
        {isVisible ? (
          <ChevronUp className="w-5 h-5 text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary" />
        )}
      </button>

      {isVisible && (
        <div className="section-bg space-y-4">
          {isProcessing && displaySteps.length === 0 && (
            <div className="flex items-center space-x-4 p-4 bg-input rounded-lg border-themed">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-button rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-accent-contrast animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-heading font-semibold text-primary">
                  Đang phân tích yêu cầu...
                </h4>
              </div>
            </div>
          )}
          {displaySteps.map((step, index) => {
            const isLastStep = index === displaySteps.length - 1;
            const isStepProcessing = isProcessing && isLastStep;
            return (
              <div key={step.id || `step-${index}`} className="relative">
                {index < displaySteps.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-accent to-transparent opacity-50"></div>
                )}
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isStepProcessing
                        ? "bg-gradient-button animate-pulse shadow-themed"
                        : step.type === "tool_response"
                        ? "bg-gradient-success"
                        : "bg-gradient-success"
                    }`}
                  >
                    {getToolIcon(step.type, step.toolName, isStepProcessing)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-heading font-semibold text-primary">
                        {getStepDisplayName(step.type, step.toolName)}
                      </h4>
                      {!isStepProcessing && (
                        <CheckCircle className="w-4 h-4 text-tertiary" />
                      )}
                    </div>
                    {step.content && (
                      <div className="bg-same rounded-lg p-3 text-xs break-all border border-themed">
                        {step.type === "tool_response" ? (
                          <div className="text-highlight font-mono">
                            {typeof step.content === "string"
                              ? step.content.slice(0, 200) +
                                (step.content.length > 200 ? "..." : "")
                              : JSON.stringify(step.content).slice(0, 200) +
                                "..."}
                          </div>
                        ) : (
                          <code className="text-accent font-mono">
                            {step.content}
                          </code>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isComplete && displaySteps.length > 0 && (
            <div className="mt-5 flex items-center space-x-2 text-sm text-tertiary font-heading">
              <CheckCircle className="w-5 h-5" />
              <span>Hoàn thành tất cả các bước.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InspectableAnswer = ({
  content,
  thinkingSteps,
  isStreaming = false,
  isComplete = false,
}) => {
  const [showThinking, setShowThinking] = useState(false);
  return (
    <div className="w-full max-w-none">
      <RealTimeThinkingProcess
        thinkingSteps={thinkingSteps}
        isVisible={showThinking}
        onToggle={() => setShowThinking(!showThinking)}
        isProcessing={isStreaming}
        isComplete={isComplete}
      />
      {content && (
        <div className="bg-input border-themed rounded-2xl px-5 py-4 shadow-themed mt-3 border-hover transition-all duration-300">
          <div className="prose prose-invert prose-sm max-w-none">
            <RichContentRenderer content={content} />
          </div>
        </div>
      )}
    </div>
  );
};

// Component đơn giản hóa chỉ chứa nội dung chat
export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const pythonUrl = import.meta.env.VITE_PYTHON_URL;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ✅ NEW: Function to process thinking steps from messages
  const processThinkingSteps = (messages) => {
    const steps = [];
    const seenSignatures = new Set();

    messages.forEach((msg, msgIndex) => {
      // Add tool calls from assistant messages
      if (
        msg.role === "assistant" &&
        msg.tool_calls &&
        Array.isArray(msg.tool_calls)
      ) {
        msg.tool_calls.forEach((tc, tcIndex) => {
          if (tc.type === "function" && tc.function) {
            const signature = `${tc.function.name}:${JSON.stringify(
              tc.function.arguments || {}
            )}`;
            if (!seenSignatures.has(signature)) {
              seenSignatures.add(signature);
              steps.push({
                id: `tc-${msgIndex}-${tcIndex}`,
                type: "tool_call",
                toolName: tc.function.name,
                content: tc.function.arguments || "{}",
              });
            }
          }
        });
      }

      // Add tool responses
      if (msg.role === "tool" && msg.content) {
        steps.push({
          id: `tr-${msgIndex}`,
          type: "tool_response",
          toolName: msg.tool_call_id ? "response" : "unknown",
          content: msg.content,
        });
      }
    });

    return steps;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const assistantPlaceholder = {
      role: "assistant",
      content: "",
      tool_calls: [],
      isStreaming: true,
      isComplete: false,
    };

    const newMessages = [...messages, userMessage, assistantPlaceholder];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    abortControllerRef.current = new AbortController();
    const api_token = sessionStorage.getItem("access_token") ?? null;

    try {
      const historyToSend = newMessages.slice(0, -1);

      const historyToSendAI = historyToSend.map((msg) => {
        const cleanMsg = {
          role: msg.role,
          content: msg.content,
          tool_call_id: msg.tool_call_id,
        };

        if (msg.tool_calls) {
          cleanMsg.tool_calls = msg.tool_calls.map((tc) => {
            return {
              ...tc,
              id: "",
            };
          });
        }

        return cleanMsg;
      });

      const response = await fetch(`${pythonUrl}/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api_token}`,
        },
        body: JSON.stringify({ messages: historyToSendAI }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`Lỗi từ server: ${response.status}`);
      if (!response.body) throw new Error("Không có body trong response.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // ✅ NEW: Track the initial history length to process only new messages
      const initialHistoryLength = historyToSend.length;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        try {
          const parsed = JSON.parse(chunk);
          if (parsed.messages) {
            // ✅ FIXED: Replace entire message history with new data from server
            // But only show messages from the current conversation
            setMessages((prev) => {
              // Keep user messages up to current conversation
              const userMessages = prev.filter((msg) => msg.role === "user");

              // Get new messages from server (excluding the history we sent)
              const serverMessages = parsed.messages || [];

              // Process all messages but mark streaming status correctly
              const processedMessages = serverMessages.map((msg, idx) => {
                let processedMsg = {
                  ...msg,
                  id: msg.id || `msg-${Date.now()}-${idx}`,
                  created_at: msg.created_at || new Date().toISOString(),
                };

                // Only mark as streaming if it's the last assistant message and not finished
                if (
                  msg.role === "assistant" &&
                  idx === serverMessages.length - 1
                ) {
                  processedMsg.isStreaming = !parsed.finished;
                  processedMsg.isComplete = !!parsed.finished;
                } else {
                  processedMsg.isStreaming = false;
                  processedMsg.isComplete = true;
                }

                // Keep all tool calls with unique IDs
                if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
                  processedMsg.tool_calls = msg.tool_calls.map((tc, tcIdx) => ({
                    ...tc,
                    id: tc.id || `tc-${Date.now()}-${idx}-${tcIdx}`,
                  }));
                }

                return processedMsg;
              });

              return processedMessages;
            });
          }
        } catch (e) {
          console.warn("Chunk parse warning:", e);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Lỗi khi gửi tin nhắn:", err);
        setMessages((prev) => {
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
      // ✅ Ensure all messages are marked as complete
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isStreaming: false,
          isComplete: true,
        }))
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
      if (msg.role === "user") {
        if (currentAssistantTurn.length > 0) {
          grouped.push({
            type: "assistant",
            messages: currentAssistantTurn,
            id: `assistant-turn-${index}`,
          });
          currentAssistantTurn = [];
        }
        grouped.push({
          type: "user",
          message: msg,
          id: msg.id || `user-${index}`,
        });
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
    <div className="flex flex-col h-full min-h-[480px] max-h-[62svh] ">
      {/* Khu vực hiển thị tin nhắn */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar-notification  ">
        {groupedMessages.map((group) => {
          if (group.type === "user") {
            return (
              <div key={group.id} className="flex justify-end">
                <div className="max-w-md bg-gradient-button text-accent-contrast rounded-2xl px-5 py-4 shadow-themed category-card-glow">
                  <div
                    className="font-body leading-relaxed whitespace-pre-wrap"
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
            // ✅ NEW: Process thinking steps from all messages in the group
            const thinkingSteps = processThinkingSteps(group.messages);

            // Get the final content and streaming status
            const finalContent =
              group.messages.filter((m) => m.content && m.content.trim()).pop()
                ?.content || "";

            const isStreaming = group.messages.some((m) => m.isStreaming);
            const isComplete =
              group.messages.every((m) => m.isComplete) && !isStreaming;

            return (
              <div key={group.id} className="flex justify-start">
                <InspectableAnswer
                  content={finalContent}
                  thinkingSteps={thinkingSteps}
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

      {/* Khu vực nhập tin nhắn */}
      <div className="flex items-center p-3 bg-content-bg border-t border-themed flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-3 bg-input text-input border-themed rounded-xl focus:outline-none border-hover placeholder-theme"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="action-button action-button-primary !w-auto ml-2 !px-5 !py-3"
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
