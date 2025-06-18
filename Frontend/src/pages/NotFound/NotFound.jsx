import React from "react";
// Using Link from 'react-router-dom' for proper routing in a React app.
// Ensure your routing setup uses react-router-dom, not just 'react-router'.
import { Link } from "react-router-dom";
import { Map, Compass, Home } from "lucide-react"; // Icons for a journey/lost theme

// Assuming PageMeta is still needed for SEO
import PageMeta from "@components/Admin/common/PageMeta";

// GridShape seems to be an existing background component; we'll integrate it.

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="404 - Lạc Mất Thế Giới | Chibi Adventures"
        description="Bạn đã lạc vào một nơi xa lạ! Đây là trang 404 theo phong cách Chibi đáng yêu."
      />
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 font-chibi">
        {/* Replace GridShape with Chibi-themed background elements */}
        {/* Floating clouds/stars/leaves for whimsical background */}
        <div className="absolute top-1/4 left-1/4 w-28 h-28 bg-white opacity-60 rounded-full blur-xl animate-float-slow animation-delay-0"></div>
        <div className="absolute bottom-1/4 right-1/4 w-36 h-36 bg-yellow-100 opacity-60 rounded-full blur-xl animate-float-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-pink-100 opacity-60 rounded-full blur-xl animate-float-slow animation-delay-4000"></div>
        <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-green-100 opacity-60 rounded-full blur-xl animate-float-slow animation-delay-1000"></div>

        <div className="relative z-10 text-center bg-white bg-opacity-95 backdrop-filter backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-lg w-full border-4 border-dashed border-blue-300 transform rotate-1 hover:rotate-0 transition-transform duration-500">
          {/* Main "lost" icon */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Map className="w-24 h-24 text-blue-500 animate-pulse-chibi drop-shadow-lg" />
            <Compass className="w-24 h-24 text-orange-400 animate-spin-chibi drop-shadow-lg" />
          </div>

          <h1 className="text-7xl font-extrabold text-blue-600 mb-4 tracking-wider select-none">
            404
          </h1>

          <p className="text-2xl font-bold text-gray-700 mb-4 font-display select-none">
            Ồ không! Lạc mất rồi!
          </p>
          <p className="text-base text-gray-600 mb-8 leading-relaxed font-sans">
            Có vẻ như bạn đã đi lạc ra khỏi bản đồ của chúng ta rồi. Trang bạn
            tìm không có ở đây mất tiêu!
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md border-b-4 border-green-700"
          >
            <Home className="w-6 h-6 mr-2" /> Về Làng An Toàn Thôi!
          </Link>
        </div>

        {/* Footer, maybe re-style or remove for a full chibi experience */}
        <p className="absolute text-sm text-center text-gray-600 -translate-x-1/2 bottom-6 left-1/2 opacity-70">
          &copy; {new Date().getFullYear()} - Chibi Adventures
        </p>
      </div>
    </>
  );
}
