import { Outlet } from "react-router-dom";
import Header from "../../../components/Client/layout/Header";
import Footer from "../../../components/Client/layout/Footer";
import "@styles/theme.css";
export default function HomeLayout() {
  return (
    <div className="bg-gradient-header">
      <header>
        <Header />
      </header>
      <main className="min-h-[90svh]">
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
