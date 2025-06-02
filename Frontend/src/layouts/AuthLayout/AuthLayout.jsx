import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/Client/layout/Header";
import Footer from "@components/Client/layout/footer";

export default function AuthLayout() {
  return (
    <div>
      <header>
        <Header />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
