// src/contexts/HomeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/http";

const HomeContext = createContext();

export function HomeProvider({ children }) {
  return <HomeContext.Provider value={{}}>{children}</HomeContext.Provider>;
}

export function useHome() {
  return useContext(HomeContext);
}
