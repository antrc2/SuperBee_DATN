import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./http";
import queryString from "query-string";
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
function useFetchBase(url, method, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stableOptions = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    const fetchData = async () => {
      try {
        const res = await api.request({
          url,
          method,
          signal: controller.signal,
          ...options
        });
        if (res.status >= 200 && res.status < 300) {
          setData(res.data);
          setLoading(false); // Chỉ tắt loading sau khi setData
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(err);
          setLoading(false); // Tắt loading khi có lỗi
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, method, stableOptions]);

  return { data, loading, error };
}
// Hook cho GET
function useGet(url, options = {}) {
  return useFetchBase(url, "get", options);
}

// Hook cho POST
function usePost(url, options = {}) {
  return useFetchBase(url, "post", options);
}

// Hook cho PUT
function usePut(url, options = {}) {
  return useFetchBase(url, "put", options);
}

// Hook cho DELETE
function useDelete(url, options = {}) {
  return useFetchBase(url, "delete", options);
}

// Hook cho PATCH
function usePatch(url, options = {}) {
  return useFetchBase(url, "patch", options);
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
function useUrlUtils() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a new URL
   * @param {string} url - target URL/path
   * @param {{ replace?: boolean, state?: any }} options
   */
  const navigateTo = (url, options = {}) => {
    const { replace = false, state } = options;
    navigate(url, { replace, state });
  };

  /**
   * Get current URL information
   */
  const getCurrentUrlInfo = () => ({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    fullUrl: `${location.pathname}${location.search}${location.hash}`
  });

  /**
   * Parse and return query parameters as an object
   */
  const getQueryParams = () => queryString.parse(location.search);

  /**
   * Add or update query parameters
   * @param {Record<string, any>} newParams
   * @param {{ replace?: boolean, state?: any }} options
   */
  const updateQueryParams = (newParams, options = {}) => {
    const currentParams = queryString.parse(location.search);
    const updated = { ...currentParams, ...newParams };
    const newSearch = queryString.stringify(updated);
    const path = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    navigate(path, options);
  };

  /**
   * Remove a specific query parameter
   * @param {string} paramName
   * @param {{ replace?: boolean, state?: any }} options
   */
  const removeQueryParam = (paramName, options = {}) => {
    const currentParams = queryString.parse(location.search);
    delete currentParams[paramName];
    const newSearch = queryString.stringify(currentParams);
    const path = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    navigate(path, options);
  };

  return {
    navigateTo,
    getCurrentUrlInfo,
    getQueryParams,
    updateQueryParams,
    removeQueryParam
  };
}

// Ví dụ sử dụng trong một component
// function MyComponent() {
//   const {
//     navigateTo,
//     getCurrentUrlInfo,
//     getQueryParams,
//     updateQueryParams,
//     removeQueryParam
//   } = useUrlUtils();

//   const handleNavigate = () => {
//     navigateTo("/home", { state: { from: "MyComponent" } });
//   };

//   const handleUpdateQuery = () => {
//     updateQueryParams({ search: "react", page: 1 });
//   };

//   const handleRemoveQuery = () => {
//     removeQueryParam("page");
//   };

//   const urlInfo = getCurrentUrlInfo();
//   const queryParams = getQueryParams();

//   return (
//     <div>
//       <button onClick={handleNavigate}>Go to Home</button>
//       <button onClick={handleUpdateQuery}>Update Query Params</button>
//       <button onClick={handleRemoveQuery}>Remove Page Param</button>
//       <p>Current URL Info: {JSON.stringify(urlInfo)}</p>
//       <p>Query Params: {JSON.stringify(queryParams)}</p>
//     </div>
//   );
// }

// export default MyComponent;
export {
  useClickOutside,
  useDebounce,
  useLocalStorage,
  useScrollPosition,
  useToggle,
  writeToLocalStorage,
  getApiKey,
  setApiKeyHook,
  setSessionValue,
  useSessionStorage,
  useGet,
  usePost,
  usePut,
  useDelete,
  usePatch,
  useUrlUtils
};
