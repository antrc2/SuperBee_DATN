// src/components/ErrorPage.jsx
import React from "react";
import { Ghost, RefreshCw } from "lucide-react"; // Importing Ghost for a cute error, RefreshCw for retry

export default function ErrorPage({ message, onRetry }) {
  const onReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 p-4 font-sans relative overflow-hidden">
      {/* Background patterns/elements for Chibi vibe */}
      <div className="absolute top-1/4 left-10 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="relative text-center bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-10 rounded-3xl shadow-2xl max-w-sm w-full border-4 border-dashed border-purple-300 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <Ghost className="w-24 h-24 mx-auto mb-6 text-purple-500 animate-float drop-shadow-lg" />
        <h2 className="text-4xl font-extrabold text-purple-600 mb-3 font-display">
          Ối! Có gì đó sai sai...
        </h2>
        <p className="text-lg text-red-500 mb-6 leading-relaxed font-sans whitespace-pre-wrap">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onReload}
            className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md border-b-4 border-green-700"
          >
            <RefreshCw className="w-6 h-6 mr-2 animate-spin-slow" /> Thử lại lần
            nữa!
          </button>
        )}
      </div>
    </div>
  );
}
