// src/components/NotificationProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import clsx from "clsx";

// Context để expose các hàm pop và conFim
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  // Sử dụng ref để đảm bảo ID luôn tăng và không trùng
  const idRef = useRef(0);

  const pop = useCallback((message, type = "info") => {
    idRef.current += 1;
    const newToast = { id: idRef.current, message, type };
    setToasts((prev) => {
      const next = [...prev, newToast];
      return next.slice(-10);
    });
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const conFim = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (result) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ pop, conFim }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bg-white z-9999 top-8 left-1/2 transform -translate-x-1/2 space-y-2 ">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "min-w-[240px] px-4 py-2 rounded-lg shadow-lg flex items-center animate-toast",
              toast.type === "success" && "bg-green-100 text-green-800",
              toast.type === "error" && "bg-red-100   text-red-800",
              toast.type === "info" && "bg-blue-100  text-blue-800"
            )}
            onAnimationEnd={() => remove(toast.id)}
          >
            <span className="mr-2">
              {toast.type === "s" ? "✅" : toast.type === "e" ? "❌" : "ℹ️"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <p className="mb-4">{confirmState.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
}
