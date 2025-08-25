import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useContext,
  useEffect,
} from "react";
import clsx from "clsx";
import { Info, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const NotificationContext = createContext();

// Component Toast đơn lẻ để quản lý state và timer của riêng nó
function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  // Hàm xử lý đóng toast (khi click nút X hoặc hết giờ)
  const handleClose = useCallback(() => {
    setIsExiting(true); // Bắt đầu hiệu ứng thoát
    // Sau khi hiệu ứng thoát hoàn thành (500ms), thực sự xóa toast khỏi DOM
    const removeTimer = setTimeout(() => onRemove(toast.id), 500);
    // Cleanup timer này nếu component bị unmount sớm
    return () => clearTimeout(removeTimer);
  }, [onRemove, toast.id]);

  // useEffect giờ sẽ gọi handleClose
  useEffect(() => {
    // Bắt đầu timer để tự động ẩn
    const timer = setTimeout(handleClose, toast.duration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.duration, handleClose]); // Thêm handleClose vào dependency array

  const toastTypes = {
    s: {
      // Success - Xanh Teal
      Icon: CheckCircle,
      style: {
        backgroundColor: "#F0FDFA", // Nền
        color: "#145369", // Chữ & Icon
        borderLeft: "4px solid #0D9488",
      },
      progressStyle: {
        backgroundColor: "#14B8A6", // Thanh tiến trình
      },
    },
    e: {
      // Error - Đỏ
      Icon: XCircle,
      style: {
        backgroundColor: "#FEF2F2", // Nền
        color: "#991B1B", // Chữ & Icon
        borderLeft: "4px solid #DC2626",
      },
      progressStyle: {
        backgroundColor: "#EF4444", // Thanh tiến trình
      },
    },
    i: {
      // Info - Chàm (Indigo)
      Icon: Info,
      style: {
        backgroundColor: "#EEF2FF", // Nền
        color: "#3730A3", // Chữ & Icon
        borderLeft: "4px solid #4F46E5",
      },
      progressStyle: {
        backgroundColor: "#6366F1", // Thanh tiến trình
      },
    },
    w: {
      // Warning - Vàng Hổ Phách (Amber)
      Icon: AlertCircle,
      style: {
        backgroundColor: "#FFFBEB", // Nền
        color: "#92400E", // Chữ & Icon
        borderLeft: "4px solid #D97706",
      },
      progressStyle: {
        backgroundColor: "#F59E0B", // Thanh tiến trình
      },
    },
  };
  const { Icon, style, progressStyle } = toastTypes[toast.type] || toastTypes.i;

  return (
    <div
      className={clsx(
        "min-w-[320px] max-w-sm rounded-lg shadow-themed flex items-start relative overflow-hidden p-4", // Thêm padding p-4
        "toast-enter",
        isExiting && "toast-exit"
      )}
      style={style} // Áp dụng style cho khung Toast
    >
      <span className="mr-3 text-2xl flex-shrink-0 mt-[-2px]">
        <Icon size={22} />
      </span>
      <span className="flex-1 whitespace-pre-wrap font-semibold">
        {toast.message}
      </span>

      {/* Nút X để đóng toast */}
      <button
        onClick={handleClose}
        style={{ color: "inherit" }} // Thừa hưởng màu từ thẻ div cha
        className="ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 flex-shrink-0"
        aria-label="Đóng thông báo"
      >
        <X size={18} />
      </button>

      <div
        className="absolute bottom-0 left-0 h-1 progress-bar-animate"
        style={{
          ...progressStyle,
          animationDuration: `${toast.duration}ms`,
        }}
      />
    </div>
  );
}

export function NotificationProvider({ children }) {
  // notificationQueue chứa TOÀN BỘ hàng đợi thông báo
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const idRef = useRef(0);

  // Hàm `remove` để xóa một thông báo khỏi hàng đợi
  const remove = useCallback((id) => {
    setNotificationQueue((prevQueue) => prevQueue.filter((n) => n.id !== id));
  }, []);

  // Hàm `pop` giờ chỉ có nhiệm vụ THÊM thông báo vào đầu hàng đợi
  const pop = useCallback((message, type = "i", duration = 4000) => {
    idRef.current += 1;
    const newToast = { id: idRef.current, message, type, duration };
    setNotificationQueue((prevQueue) => [newToast, ...prevQueue]); // Thêm vào ĐẦU hàng đợi
  }, []);

  // Các hàm cho Modal (Confirm, Alert)
  const conFim = useCallback((message) => {
    return new Promise((resolve) => setConfirmState({ message, resolve }));
  }, []);

  const handleConfirm = (result) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  const showAlert = useCallback((message) => {
    return new Promise((resolve) => setAlertState({ message, resolve }));
  }, []);

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve();
      setAlertState(null);
    }
  };

  // Chỉ lấy tối đa 10 thông báo từ ĐẦU hàng đợi để hiển thị
  const visibleToasts = notificationQueue.slice(0, 10);

  return (
    <NotificationContext.Provider value={{ pop, conFim, showAlert }}>
      {children}

      {/* Container cho các thông báo Toast */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end space-y-3">
        {visibleToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={remove} />
        ))}
      </div>

      {/* Hộp thoại xác nhận (Confirm Modal) */}
      {confirmState && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-input p-6 rounded-lg shadow-themed max-w-sm w-full text-center m-4">
            <p className="mb-6 text-lg text-primary">{confirmState.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConfirm(true)}
                className="modal-button modal-button-confirm"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleConfirm(false)}
                className="modal-button modal-button-cancel"
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
          <div className="bg-input p-6 rounded-lg shadow-themed max-w-sm w-full text-center m-4">
            <p className="mb-6 text-lg text-primary">{alertState.message}</p>
            <button
              onClick={handleAlertClose}
              className="modal-button modal-button-confirm w-full"
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
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
