import { Outlet } from "react-router-dom";
import Header from "../../../components/Client/layout/Header";
import Footer from "../../../components/Client/layout/Footer";

export default function HomeLayout() {
  return (
    <div>
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
