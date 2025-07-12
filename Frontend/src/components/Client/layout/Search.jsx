import React, { useState, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?key=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      // Mất focus khỏi input sau khi tìm kiếm để thanh search thu gọn lại trên mobile
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleButtonClick = () => {
    // Luôn submit nếu đang ở màn hình lớn (PC/Tablet)
    if (window.innerWidth >= 768) {
      handleSearchSubmit();
      return;
    }

    // Trên mobile, nếu input đang được focus thì submit, nếu không thì focus để mở nó ra
    if (document.activeElement === inputRef.current) {
      handleSearchSubmit();
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative flex items-center search-container group w-full pr-2 ">
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`
          flex-grow rounded-full backdrop-blur-md py-3 pl-6 pr-14 text-sm
          text-primary placeholder-theme shadow-lg outline-none
          transition-all duration-300 ease-in-out border-hover
        
          w-0 opacity-0 pointer-events-none
          
          group-focus-within:w-full group-focus-within:opacity-100 group-focus-within:pointer-events-auto

          md:w-full md:opacity-100 md:pointer-events-auto
        `}
      />
      <button
        onClick={handleButtonClick}
        className={`
          absolute top-1/2 -translate-y-1/2 rounded-full bg-gradient-button p-2.5
          text-accent-contrast transition-all duration-300 ease-in-out
          right-0 group-focus-within:right-4
          md:right-4 md:focus:border-hover
        `}
        aria-label="Tìm kiếm"
      >
        <Search size={18} />
      </button>
    </div>
  );
}
