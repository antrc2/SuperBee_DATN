// src/components/NotificationProvider.jsx
import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useContext,
} from "react";
import clsx from "clsx";
import { Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [alertState, setAlertState] = useState(null);
  // Sử dụng ref để tạo ID duy nhất cho mỗi thông báo
  const idRef = useRef(0);

  // --- HÀM REMOVE ĐƯỢC ĐƯA LÊN TRƯỚC HÀM POP ---
  // Hàm để xóa một thông báo toast theo ID
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id)); // Lọc bỏ toast có ID tương ứng
  }, []);

  // Hàm để hiển thị thông báo toast
  const pop = useCallback(
    (message, type = "info", duration = 3000) => {
      idRef.current += 1; // Tăng ID
      const newToast = { id: idRef.current, message, type }; // Tạo đối tượng toast mới

      setToasts((prev) => {
        const next = [...prev, newToast]; // Thêm toast mới vào danh sách
        const limitedNext = next.slice(-10); // Giới hạn chỉ hiển thị tối đa 10 toast

        // Thiết lập thời gian tự động ẩn toast
        setTimeout(() => {
          remove(newToast.id); // <--- Giờ thì hàm remove đã được định nghĩa rồi!
        }, duration);

        return limitedNext;
      });
    },
    [remove] // Phụ thuộc vào hàm remove để đảm bảo nó luôn được cập nhật
  );

  // Hàm để hiển thị hộp thoại xác nhận (Confirm Dialog)
  const conFim = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve }); // Lưu tin nhắn và hàm resolve của Promise
    });
  }, []);

  // Xử lý kết quả khi người dùng nhấn nút trong hộp thoại xác nhận
  const handleConfirm = (result) => {
    if (confirmState) {
      confirmState.resolve(result); // Giải quyết Promise với true (Xác nhận) hoặc false (Hủy)
      setConfirmState(null); // Đóng hộp thoại xác nhận
    }
  };

  // Hàm để hiển thị hộp thoại thông báo (Alert Dialog)
  const showAlert = useCallback((message) => {
    return new Promise((resolve) => {
      setAlertState({ message, resolve }); // Lưu tin nhắn và hàm resolve của Promise
    });
  }, []);

  // Xử lý khi người dùng nhấn nút "OK" trong hộp thoại thông báo
  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve(); // Giải quyết Promise
      setAlertState(null); // Đóng hộp thoại thông báo
    }
  };

  return (
    <NotificationContext.Provider value={{ pop, conFim, showAlert }}>
      {children}

      {/* Container cho các thông báo Toast */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 space-y-3 z-[9999]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "min-w-[280px] max-w-sm p-4 rounded-lg shadow-xl flex items-start text-sm transition-all duration-300 ease-out transform",
              {
                "bg-green-50 text-green-800 border border-green-200":
                  toast.type === "s",
                "bg-red-50 text-red-800 border border-red-200":
                  toast.type === "e",
                "bg-blue-50 text-blue-800 border border-blue-200":
                  toast.type === "i",
                "bg-yellow-50 text-yellow-800 border border-yellow-200":
                  toast.type === "w",
              }
            )}
          >
            <span className="mr-3 text-lg flex-shrink-0">
              {toast.type === "s" && <CheckCircle size={20} />}
              {toast.type === "e" && <XCircle size={20} />}
              {toast.type === "i" && <Info size={20} />}
              {toast.type === "w" && <AlertCircle size={20} />}
            </span>
            <span className="flex-1 whitespace-pre-wrap">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Hộp thoại xác nhận (Confirm Modal) */}
      {confirmState && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 animate-scaleIn">
            <p className="mb-6 text-lg font-medium text-gray-800">
              {confirmState.message}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConfirm(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleConfirm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hộp thoại thông báo (Alert Modal) */}
      {alertState && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 animate-scaleIn">
            <p className="mb-6 text-lg font-medium text-gray-800">
              {alertState.message}
            </p>
            <button
              onClick={handleAlertClose}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// Hook tùy chỉnh để sử dụng các hàm thông báo
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
}
