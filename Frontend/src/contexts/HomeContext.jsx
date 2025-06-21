// src/contexts/HomeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/http";
import LoadingDomain from "../components/Loading/LoadingDomain";

const HomeContext = createContext();

export function HomeProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

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
          setData({ ...d });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };
    getData();
  }, [setData]);
  if (isLoading) return <LoadingDomain />;

  return (
    <HomeContext.Provider value={{ data }}>{children}</HomeContext.Provider>
  );
}

export function useHome() {
  return useContext(HomeContext);
}
