import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { CartProvider } from "./contexts/CartContexts.jsx";
import { HomeProvider } from "./contexts/HomeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationProvider.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <NotificationProvider>
        <HomeProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </HomeProvider>
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
  // </StrictMode>
);
