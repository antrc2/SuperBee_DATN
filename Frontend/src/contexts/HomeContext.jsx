// src/contexts/HomeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/http";

// eslint-disable-next-line react-refresh/only-export-components
const HomeContext = createContext();

export function HomeProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    // Khởi tạo với cấu trúc rỗng để tránh lỗi undefined
    categories: [],
    banners: [],
    top: [],
  });

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/home");
        if (res.data.status) {
          const d = {
            categories: res.data?.data?.categories ?? [],
            banners: res.data?.data?.banners ?? [],
            top: res.data?.data?.top ?? [],
          };
          setData(d);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <HomeContext.Provider value={{ data, isLoading }}>
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
