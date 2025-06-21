import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { CartProvider } from "./contexts/CartContexts.jsx";
import { NotificationProvider } from "./contexts/NotificationProvider.jsx";
import "@styles/theme.css";
import { HomeProvider } from "./contexts/HomeContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <HomeProvider>
          <NotificationProvider>
            <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthProvider>
          </NotificationProvider>
        </HomeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
