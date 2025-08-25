// File: src/pages/Clients/Chatbot/ChatWidget.jsx (Improved Responsive Version)
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

// Enhanced ProductDisplay with full responsive design
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-input border-themed rounded-xl transition-all duration-300 hover:border-hover category-card-glow w-full max-w-full sm:max-w-lg mx-auto">
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0">
        <img
          src={product.image || defaultImage}
          alt={product.name || product.title || "Product"}
          className="w-full h-full object-cover rounded-lg border border-themed"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h4 className="text-sm sm:text-base font-heading font-bold text-primary mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-1">
          {product.name || product.title || "Tên sản phẩm"}
        </h4>
        {product.price && (
          <div className="text-base sm:text-lg font-bold text-accent mb-2">
            {typeof product.price === "number"
              ? product.price.toLocaleString("vi-VN") + " VND"
              : product.price}
          </div>
        )}
        {product.description && (
          <p className="text-secondary text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
            {product.description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center sm:justify-start">
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-button modal-button-cancel text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
            >
              Xem chi tiết
            </a>
          )}
          {product.buyUrl && (
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-button modal-button-confirm text-xs sm:text-sm min-h-[44px] inline-flex items-center justify-center"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Mua ngay
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
    <div className="space-y-2 sm:space-y-3">
      <h5 className="text-xs sm:text-sm font-heading font-semibold text-secondary text-center sm:text-left">
        Tìm thấy {products.length} sản phẩm:
      </h5>
      <div className="space-y-2 sm:space-y-3">
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

  // Enhanced MARKDOWN OPTIONS with mobile responsiveness
  const markdownOptions = {
    overrides: {
      // Headers - responsive sizes
      h1: {
        component: "h1",
        props: {
          className:
            "text-xl sm:text-2xl font-heading font-bold text-primary mt-4 sm:mt-5 mb-3 sm:mb-4",
        },
      },
      h2: {
        component: "h2",
        props: {
          className:
            "text-lg sm:text-xl font-heading font-bold text-primary mt-4 sm:mt-5 mb-2 sm:mb-3",
        },
      },
      h3: {
        component: "h3",
        props: {
          className:
            "text-base sm:text-lg font-heading font-bold text-primary mt-3 sm:mt-4 mb-2 sm:mb-3",
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

      // Links - better touch targets
      a: {
        component: "a",
        props: {
          className:
            "text-accent hover:text-highlight underline transition-colors duration-200 min-h-[44px] inline-flex items-center",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },

      // Images - responsive
      img: {
        component: "img",
        props: { className: "max-w-full h-auto rounded-lg my-2 sm:my-3" },
      },

      // Code - responsive
      code: {
        component: "code",
        props: {
          className:
            "bg-same px-1 sm:px-2 py-1 rounded text-accent text-xs sm:text-sm font-mono break-all",
        },
      },

      // Code blocks - responsive
      pre: {
        component: "pre",
        props: {
          className:
            "bg-same p-2 sm:p-4 rounded-lg overflow-x-auto my-2 sm:my-3 text-xs sm:text-sm",
        },
      },

      // Paragraphs
      p: {
        component: "p",
        props: {
          className:
            "mb-2 sm:mb-3 last:mb-0 text-sm sm:text-base leading-relaxed",
        },
      },

      // Lists - responsive spacing
      ul: {
        component: "ul",
        props: {
          className: "mb-2 sm:mb-3 space-y-1 ml-4 text-sm sm:text-base",
        },
      },
      ol: {
        component: "ol",
        props: {
          className: "mb-2 sm:mb-3 space-y-1 ml-4 text-sm sm:text-base",
        },
      },
      li: {
        component: "li",
        props: { className: "text-primary leading-relaxed" },
      },

      // Blockquotes
      blockquote: {
        component: "blockquote",
        props: {
          className:
            "border-l-4 border-accent pl-3 sm:pl-4 my-3 sm:my-4 italic text-secondary text-sm sm:text-base",
        },
      },

      // Tables - responsive
      table: {
        component: "table",
        props: {
          className:
            "min-w-full border-collapse border border-themed my-3 sm:my-4 text-xs sm:text-sm",
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
            "border border-themed px-2 sm:px-4 py-1 sm:py-2 text-left font-heading font-semibold text-xs sm:text-sm",
        },
      },
      td: {
        component: "td",
        props: {
          className:
            "border border-themed px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm",
        },
      },

      // Horizontal rule
      hr: {
        component: "hr",
        props: { className: "my-4 sm:my-6 border-themed" },
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
        <div className="mt-3 sm:mt-4">
          <ProductGrid products={products} />
        </div>
      )}
    </>
  );
};

// Enhanced thinking process with better mobile experience
const RealTimeThinkingProcess = ({
  thinkingSteps,
  isVisible,
  onToggle,
  isProcessing = false,
  isComplete = false,
}) => {
  const getToolIcon = (stepType, toolName, isProcessing = false) => {
    const iconClass = isProcessing ? "animate-pulse" : "";
    const iconSize = "w-3 h-3 sm:w-4 sm:h-4";

    if (stepType === "tool_response") {
      return <Settings className={`${iconSize} text-highlight ${iconClass}`} />;
    }

    switch (toolName) {
      case "query_router":
        return <Zap className={`${iconSize} text-accent ${iconClass}`} />;
      case "search_product_detail_by_sku":
      case "search_products":
      case "get_list_product_by_category":
        return <Search className={`${iconSize} text-tertiary ${iconClass}`} />;
      case "add_to_cart":
        return (
          <ShoppingCart className={`${iconSize} text-highlight ${iconClass}`} />
        );
      case "sitemap_crawl":
      case "url_crawl":
        return <Brain className={`${iconSize} text-accent ${iconClass}`} />;
      default:
        return <Brain className={`${iconSize} text-accent ${iconClass}`} />;
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

  if (!thinkingSteps && !isProcessing) {
    return null;
  }

  const displaySteps = thinkingSteps || [];

  return (
    <div className="mt-3 sm:mt-4 border-t border-themed pt-3 sm:pt-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 sm:p-3 bg-input hover:bg-same border-themed rounded-lg transition-all duration-200 mb-2 sm:mb-3 border-hover min-h-[44px]"
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Brain
            className={`w-4 h-4 sm:w-5 sm:h-5 text-accent ${
              isProcessing ? "animate-pulse" : ""
            }`}
          />
          <span className="text-xs sm:text-sm font-heading font-semibold text-primary">
            {isProcessing ? "Đang xử lý..." : "Tiến trình tư duy"}
          </span>
          {displaySteps.length > 0 && (
            <span className="text-xs bg-gradient-button text-accent-contrast px-2 sm:px-3 py-1 rounded-full font-bold">
              {displaySteps.length}
            </span>
          )}
          {isComplete && (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-tertiary" />
          )}
        </div>
        {isVisible ? (
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
        )}
      </button>

      {isVisible && (
        <div className="section-bg space-y-2 sm:space-y-3 md:space-y-4">
          {isProcessing && displaySteps.length === 0 && (
            <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-input rounded-lg border-themed">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-button rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-accent-contrast animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-heading font-semibold text-primary">
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
                  <div className="absolute left-4 sm:left-5 top-10 sm:top-12 bottom-0 w-px bg-gradient-to-b from-accent to-transparent opacity-50"></div>
                )}
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
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
                    <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                      <h4 className="text-xs sm:text-sm font-heading font-semibold text-primary">
                        {getStepDisplayName(step.type, step.toolName)}
                      </h4>
                      {!isStepProcessing && (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-tertiary" />
                      )}
                    </div>
                    {step.content && (
                      <div className="bg-same rounded-lg p-2 sm:p-3 text-xs break-all border border-themed">
                        {step.type === "tool_response" ? (
                          <div className="text-highlight font-mono">
                            {typeof step.content === "string"
                              ? step.content.slice(0, 150) +
                                (step.content.length > 150 ? "..." : "")
                              : JSON.stringify(step.content).slice(0, 150) +
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
            <div className="mt-4 sm:mt-5 flex items-center space-x-2 text-xs sm:text-sm text-tertiary font-heading">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
        <div className="bg-input border-themed rounded-2xl px-3 sm:px-4 md:px-5 py-3 sm:py-4 shadow-themed mt-2 sm:mt-3 border-hover transition-all duration-300">
          <div className="prose prose-invert prose-sm max-w-none">
            <RichContentRenderer content={content} />
          </div>
        </div>
      )}
    </div>
  );
};

// Main ChatWidget with full responsive design
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

  const processThinkingSteps = (messages) => {
    const steps = [];
    const seenSignatures = new Set();

    messages.forEach((msg, msgIndex) => {
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

      const initialHistoryLength = historyToSend.length;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        try {
          const parsed = JSON.parse(chunk);
          if (parsed.messages) {
            setMessages((prev) => {
              const userMessages = prev.filter((msg) => msg.role === "user");
              const serverMessages = parsed.messages || [];

              const processedMessages = serverMessages.map((msg, idx) => {
                let processedMsg = {
                  ...msg,
                  id: msg.id || `msg-${Date.now()}-${idx}`,
                  created_at: msg.created_at || new Date().toISOString(),
                };

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
    <div className="flex flex-col h-full min-h-[400px] sm:min-h-[480px] max-h-[60vh] sm:max-h-[62vh]">
      {/* Messages area with responsive design */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto space-y-3 sm:space-y-4 md:space-y-5 custom-scrollbar-notification">
        {groupedMessages.map((group) => {
          if (group.type === "user") {
            return (
              <div key={group.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-sm md:max-w-md bg-gradient-button text-accent-contrast rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 shadow-themed category-card-glow">
                  <div
                    className="font-body leading-relaxed whitespace-pre-wrap text-sm sm:text-base"
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
            const thinkingSteps = processThinkingSteps(group.messages);

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

      {/* Input area with enhanced mobile design */}
      <div className="flex items-center p-2 sm:p-3 bg-content-bg border-t border-themed flex-shrink-0 gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-2 sm:p-3 bg-input text-input border-themed rounded-xl focus:outline-none border-hover placeholder-theme text-sm sm:text-base min-h-[44px]"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="action-button action-button-primary !w-auto !px-3 sm:!px-4 md:!px-5 !py-2 sm:!py-3 min-h-[44px] min-w-[44px]"
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
