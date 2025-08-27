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

// =================================================================================
// CÁC TÙY CHỌN GIAO DIỆN (THEMES) - CHỌN 1 TRONG 3 BỘ DƯỚI ĐÂY
// =================================================================================

// -------- OPTION 1: Giao diện "Modern & Clean" (Hiện đại & Sạch sẽ) --------
const toastTypes_Modern = {
  s: {
    // Success
    Icon: CheckCircle,
    style: "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500",
    progressStyle: "bg-emerald-500",
  },
  e: {
    // Error
    Icon: XCircle,
    style: "bg-rose-50 text-rose-800 border-l-4 border-rose-500",
    progressStyle: "bg-rose-500",
  },
  i: {
    // Info
    Icon: Info,
    style: "bg-sky-50 text-sky-800 border-l-4 border-sky-500",
    progressStyle: "bg-sky-500",
  },
  w: {
    // Warning
    Icon: AlertCircle,
    style: "bg-amber-50 text-amber-800 border-l-4 border-amber-500",
    progressStyle: "bg-amber-500",
  },
};

// -------- OPTION 2: Giao diện "Soft & Subtle" (Mềm mại & Tinh tế) --------
const toastTypes_Soft = {
  s: {
    Icon: CheckCircle,
    style: "bg-white text-slate-700 border border-slate-200 shadow-md",
    iconColor: "text-green-500",
    progressStyle: "bg-green-400",
  },
  e: {
    Icon: XCircle,
    style: "bg-white text-slate-700 border border-slate-200 shadow-md",
    iconColor: "text-red-500",
    progressStyle: "bg-red-400",
  },
  i: {
    Icon: Info,
    style: "bg-white text-slate-700 border border-slate-200 shadow-md",
    iconColor: "text-blue-500",
    progressStyle: "bg-blue-400",
  },
  w: {
    Icon: AlertCircle,
    style: "bg-white text-slate-700 border border-slate-200 shadow-md",
    iconColor: "text-yellow-500",
    progressStyle: "bg-yellow-400",
  },
};

// -------- OPTION 3: Giao diện "Gradient & Bold" (Gradient & Táo bạo) --------
const toastTypes_Gradient = {
  s: {
    Icon: CheckCircle,
    style: "bg-gray-800 text-white border-l-4 border-green-400",
    progressStyle: "bg-gradient-to-r from-green-400 to-teal-500",
  },
  e: {
    Icon: XCircle,
    style: "bg-gray-800 text-white border-l-4 border-red-500",
    progressStyle: "bg-gradient-to-r from-red-500 to-pink-500",
  },
  i: {
    Icon: Info,
    style: "bg-gray-800 text-white border-l-4 border-blue-400",
    progressStyle: "bg-gradient-to-r from-blue-400 to-indigo-500",
  },
  w: {
    Icon: AlertCircle,
    style: "bg-gray-800 text-white border-l-4 border-yellow-400",
    progressStyle: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
};

// Component Toast đơn lẻ để quản lý state và timer của riêng nó
function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    const removeTimer = setTimeout(() => onRemove(toast.id), 500); // Duration phải khớp với animation `toast-exit`
    return () => clearTimeout(removeTimer);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const timer = setTimeout(handleClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, handleClose]);

  // *** CHỌN GIAO DIỆN BẠN MUỐN SỬ DỤNG TẠI ĐÂY ***
  const toastTypes = toastTypes_Modern; // Thay đổi thành toastTypes_Soft hoặc toastTypes_Gradient nếu muốn

  const { Icon, style, progressStyle, iconColor } =
    toastTypes[toast.type] || toastTypes.i;

  return (
    <div
      className={clsx(
        "min-w-[320px] max-w-sm rounded-lg shadow-lg flex items-start relative overflow-hidden p-4",
        "toast-enter",
        isExiting && "toast-exit",
        style // Áp dụng class style từ theme đã chọn
      )}
    >
      <span className={clsx("mr-3 text-2xl flex-shrink-0 mt-0.5", iconColor)}>
        <Icon size={24} />
      </span>
      <div className="flex-1">
        <p className="font-semibold line-clamp-3">
          {" "}
          {/* Giới hạn 3 dòng */}
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="ml-2 p-1 rounded-full hover:bg-black/10 flex-shrink-0 -mt-1 -mr-1"
        aria-label="Đóng thông báo"
      >
        <X size={18} />
      </button>

      <div
        className={clsx(
          "absolute bottom-0 left-0 h-1 progress-bar-animate",
          progressStyle
        )}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setNotificationQueue((prevQueue) => prevQueue.filter((n) => n.id !== id));
  }, []);

  const pop = useCallback((message, type = "i", duration = 4000) => {
    idRef.current += 1;
    const newToast = { id: idRef.current, message, type, duration };
    setNotificationQueue((prevQueue) => [newToast, ...prevQueue]);
  }, []);

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

  // *** THAY ĐỔI: Chỉ lấy tối đa 5 thông báo để hiển thị ***
  const visibleToasts = notificationQueue.slice(0, 5);

  return (
    <NotificationContext.Provider value={{ pop, conFim, showAlert }}>
      {children}

      {/* Container cho các thông báo Toast */}
      <div className="fixed top-28 right-5 z-[9999] flex flex-col items-end space-y-3">
        {visibleToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={remove} />
        ))}
      </div>

      {/* Hộp thoại xác nhận (Confirm Modal) - Giao diện mới */}
      {confirmState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 modal-enter">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 modal-enter">
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

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
