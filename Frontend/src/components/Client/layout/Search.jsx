import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react"; // Đảm bảo bạn đã cài đặt lucide-react
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // State để kiểm soát trạng thái mở rộng
  const inputRef = useRef(null); // Ref để tham chiếu đến input element
  const navigate = useNavigate();
  // Effect để tự động focus vào input khi nó mở rộng
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Xử lý khi nhấn nút tìm kiếm hoặc Enter
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Chỉ tìm kiếm nếu có nội dung
      console.log("Searching for:", searchQuery);
      navigate(`/search?key=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
      setSearchQuery("");
    } else {
      // Nếu không có nội dung, chỉ thu gọn thanh tìm kiếm (hoặc có thể hiển thị cảnh báo)
      setIsExpanded(false);
    }
  };

  // Xử lý khi nhấn phím (dùng cho phím Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Xử lý khi input mất focus (blur)
  const handleInputBlur = () => {
    // Đặt một độ trễ nhỏ để tránh việc thanh tìm kiếm thu gọn ngay lập tức
    // khi người dùng cố gắng click vào nút tìm kiếm trong trạng thái mở rộng
    setTimeout(() => {
      if (!document.activeElement.closest(".search-container")) {
        // Kiểm tra xem focus có ra ngoài container không
        setIsExpanded(false);
      }
    }, 100); // Độ trễ 100ms
  };

  return (
    <div className="relative flex items-center search-container">
      {/* Input Field - Điều chỉnh độ rộng và hiển thị theo trạng thái isExpanded */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm acc game..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsExpanded(true)} // Giữ mở rộng khi input được focus
        onBlur={handleInputBlur} // Thu gọn khi input mất focus
        className={`
          flex-grow
          rounded-full
          backdrop-blur-md
          py-3 pl-6 pr-14
          text-sm
          placeholder-white/60
          shadow-lg
          outline-none
          transition-all duration-300 ease-in-out
          border-hover // Lớp CSS của bạn
          ${
            isExpanded
              ? "w-64 opacity-100 visible"
              : "w-0 opacity-0 invisible pointer-events-none"
          }
        `}
      />

      {/* Search Button - Luôn hiển thị, điều khiển việc mở rộng và gửi tìm kiếm */}
      <button
        onClick={isExpanded ? handleSearchSubmit : () => setIsExpanded(true)} // Nếu đang mở, gửi tìm kiếm; nếu không, mở rộng
        className={`
          absolute
          ${
            isExpanded ? "right-2" : "right-0"
          } // Điều chỉnh vị trí nút khi mở rộng/thu gọn
          top-1/2
          -translate-y-1/2
          rounded-full
          bg-gradient-button
          p-2.5
          text-main-title
          transition-all duration-300 ease-in-out
          
          ${isExpanded ? "" : "shadow-lg"} // Thêm shadow khi là nút độc lập
        `}
        aria-label={isExpanded ? "Tìm kiếm" : "Mở thanh tìm kiếm"}
      >
        <Search size={18} />
      </button>
    </div>
  );
}
