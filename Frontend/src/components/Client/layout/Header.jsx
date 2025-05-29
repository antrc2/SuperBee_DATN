import { Bell, Menu, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="mx-auto flex h-16 items-center justify-between max-w-7xl">

        {/* Left: Logo + Danh mục + Đã xem */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center text-3xl font-bold">
            {/* <img
              src="/logo.png"
              alt="ShopTi.com"
              width={120}
              height={40}
              className="h-auto w-auto"
            /> */}
            SuperBee
          </a>

          <button className="flex items-center gap-2 rounded-md p-2 text-gray-600 hover:bg-gray-100">
            <Menu className="h-5 w-5" />
            <span className="text-sm font-medium">Danh mục</span>
          </button>

          <button className="flex items-center gap-2 rounded-md p-2 text-gray-600 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm font-medium">Đã xem</span>
          </button>
        </div>

        {/* Center: Tìm kiếm */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="relative w-full max-w-xl">
            <div className="flex items-center rounded-full bg-gray-100 px-4">
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-full bg-transparent py-2 outline-none"
              />
              <button className="ml-2 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Nạp tiền + icons */}
        <div className="flex items-center gap-4">
          <Link
            className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            to={"/recharge-atm"}
          >
            Nạp Tiền
          </Link>
          <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Link to={"/auth/login"}>
              <User className="h-5 w-5" />
            </Link>
          </button>
        </div>
      </div>
    </header>
  );
}
