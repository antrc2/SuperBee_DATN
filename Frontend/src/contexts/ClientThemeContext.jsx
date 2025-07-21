import { createContext, useContext, useEffect, useState } from "react";

const ClientThemeContext = createContext(null);

export function ClientThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("clientTheme"); // Dùng key riêng: 'clientTheme'
    setTheme(savedTheme || "light");
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    root.classList.remove("dark", "theme-pink", "theme-blue","theme-green","theme-purple"); // Xóa các class theme cũ
    if (theme !== "light") {
      root.classList.add(theme); // Thêm class của theme hiện tại (vd: 'dark', 'theme-pink')
    }

    localStorage.setItem("clientTheme", theme);
  }, [theme, isInitialized]);

  // Hàm `setTheme` linh hoạt hơn, cho phép đặt bất kỳ theme nào
  // (Bạn không cần hàm toggle ở đây vì có nhiều hơn 2 lựa chọn)
  const value = { theme, setTheme };

  return (
    <ClientThemeContext.Provider value={value}>
      {children}
    </ClientThemeContext.Provider>
  );
}

// Custom hook để sử dụng trong các component của trang Client
export function useClientTheme() {
  const context = useContext(ClientThemeContext);
  if (context === null) {
    throw new Error("useClientTheme must be used within a ClientThemeProvider");
  }
  return context;
}
