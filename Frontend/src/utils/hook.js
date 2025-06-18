import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./http";
import queryString from "query-string";
import { jwtDecode } from "jwt-decode";
// useDebounce - Trì hoãn cập nhật giá trị
// Công dụng: Trì hoãn cập nhật giá trị, hữu ích trong các trường hợp như tìm kiếm để giảm tần suất xử lý.
// const debouncedValue = useDebounce(inputValue, 500);
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
// . useLocalStorage - Lưu trữ dữ liệu trong localStorage
// Công dụng: Đồng bộ hóa dữ liệu với localStorage để duy trì trạng thái giữa các phiên làm việc.
// const [name, setName] = useLocalStorage("name", "Người dùng");
function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
// useClickOutside - Phát hiện click bên ngoài element
// Công dụng: Phát hiện khi người dùng nhấp chuột bên ngoài một element, thường dùng để đóng modal hoặc dropdown.
// const ref = useRef(null);
// useClickOutside(ref, () => {
//   console.log("Nhấn ngoài element");
// });
function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
// useScrollPosition - Lấy vị trí cuộn
// Công dụng: Cung cấp vị trí cuộn hiện tại của trang hoặc element, hữu ích cho các hiệu ứng liên quan đến cuộn.
// const scrollPosition = useScrollPosition();
function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  return scrollPosition;
}
function writeToLocalStorage(key, value) {
  try {
    const valueToStore = typeof value === "function" ? value() : value;
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  } catch (error) {
    console.error("Lỗi khi ghi vào localStorage:", error);
  }
}
let apiKey = null;

function setApiKeyHook(key) {
  apiKey = key;
}

function getApiKey() {
  return apiKey;
}
function useSessionStorage(key, initialValue = null) {
  // Khởi tạo state từ sessionStorage (hoặc initialValue nếu chưa có)
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Lỗi đọc sessionStorage key="${key}":`, error);
      return initialValue;
    }
  });

  // Mỗi khi key hoặc storedValue thay đổi, update vào sessionStorage
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Lỗi ghi sessionStorage key="${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
function setSessionValue(key, value) {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
  } catch (e) {
    console.error(`Không thể lưu sessionStorage với key="${key}":`, e);
  }
}

const viewImage = (url) => {
  const urlBE = import.meta.env.VITE_BACKEND_URL;
  const imageUrl = `${urlBE}${url}`;
  return imageUrl;
};

const decodeData = (token) => {
  const decoded = jwtDecode(token);
  return decoded;
};

// export default MyComponent;
export {
  viewImage,
  useClickOutside,
  useDebounce,
  useLocalStorage,
  useScrollPosition,
  writeToLocalStorage,
  getApiKey,
  setApiKeyHook,
  setSessionValue,
  useSessionStorage,
  decodeData,
};
