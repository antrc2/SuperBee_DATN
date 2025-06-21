// src/pages/OtherPage/UnauthorizedPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Skull } from "lucide-react"; // Using Skull for a "cute" error vibe

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-100 p-4 font-sans relative overflow-hidden">
      {/* Background patterns/elements for Wibu vibe */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-sm w-full border-4 border-dashed border-red-300 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
        <Skull className="w-24 h-24 mx-auto mb-6 text-purple-500 animate-pulse-slow drop-shadow-lg" />
        <h1 className="text-6xl font-extrabold text-red-500 mb-2 font-display select-none">
          403
        </h1>
        <p className="text-2xl font-bold text-gray-700 mb-4 font-display select-none">
          Oopsie! Trang này là vùng cấm!
        </p>
        <p className="text-base text-gray-600 mb-8 leading-relaxed font-sans">
          Có vẻ bạn đã đi lạc vào khu vực VIP rồi. Hmm... cần một vé phép thuật
          để vào đây đó!
        </p>
        <Link
          to="/"
          className="inline-block bg-pink-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md border-b-4 border-pink-700 hover:border-pink-800 font-display"
        >
          &lt;-- Về nhà chơi thôi!
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
