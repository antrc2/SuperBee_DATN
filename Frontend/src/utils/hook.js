import { useState, useEffect, useMemo } from "react";
import api from "./http";
// Quản lý trạng thái bật/tắt
// const [isOpen, toggleOpen] = useToggle(false);
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(!value);
  return [value, toggle];
}
// useFetch - Gọi API và quản lý trạng thái
// Công dụng: Xử lý việc gọi API, quản lý trạng thái loading, dữ liệu trả về và lỗi.
// post
// const { data, loading, error } = useFetch("/login", "post", {
//   data: { username: "admin", password: "123456" }
// });
// get
// const { data, loading, error } = useFetch("/products", "get", {
//   params: { category: "fruit" }
// });
function useFetch(url, method = "get", options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stableOptions = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null); // reset lại khi url/method/options thay đổi

    const fetchData = async () => {
      try {
        const res = await api.request({
          url,
          method,
          signal: controller.signal,
          ...options
        });
        if (res.status == 200) {
          setData(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url, method, stableOptions]);

  return { data, loading, error };
}

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
export {
  useClickOutside,
  useDebounce,
  useFetch,
  useLocalStorage,
  useScrollPosition,
  useToggle,
  writeToLocalStorage,
  getApiKey,
  setApiKeyHook
};
