export default function LoadingDomain() {
  return (
    <div className="flex flex-col items-center mt-12 text-gray-700 font-comic">
      {/* Mèo */}
      <div className="relative w-24 h-24 bg-yellow-300 rounded-[50%_50%_45%_45%] shadow-md animate-bob">
        {/* Tai trái */}
        <div className="absolute top-[-20px] left-2 w-7 h-7 bg-yellow-300 rounded-tl-[50%] rounded-tr-[50%] border-2 border-yellow-700 rotate-[-15deg]"></div>
        {/* Tai phải */}
        <div className="absolute top-[-20px] right-2 w-7 h-7 bg-yellow-300 rounded-tl-[50%] rounded-tr-[50%] border-2 border-yellow-700 rotate-[15deg]"></div>

        {/* Mặt */}
        <div className="relative w-full h-full">
          {/* Mắt trái */}
          <div className="absolute top-7 left-6 w-4.5 h-4.5 bg-gray-800 rounded-full animate-blink origin-center"></div>
          {/* Mắt phải */}
          <div className="absolute top-7 right-6 w-4.5 h-4.5 bg-gray-800 rounded-full animate-blink origin-center animate-delay-2000"></div>

          {/* Mũi */}
          <div className="absolute top-[55px] left-1/2 w-3 h-2 bg-red-600 rounded-[50%/100%] -translate-x-1/2"></div>

          {/* Miệng */}
          <div className="absolute top-[65px] left-1/2 w-5 h-2 border-b-2 border-red-600 rounded-b-[20px] -translate-x-1/2"></div>
        </div>

        {/* Thân */}
        <div className="absolute bottom-[-30px] left-1/2 w-20 h-10 bg-yellow-300 rounded-[40px/25px] -translate-x-1/2 shadow-inner shadow-yellow-700"></div>
      </div>

      <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
    </div>
  );
}
