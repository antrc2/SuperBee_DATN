import { Facebook, MapPin, MessageCircle, Star, Zap } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16  ">
      <div className="container  py-16 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 md:gap-y-12 md:gap-x-8 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="space-y-8">
              {/* <Image
                src="/logo.png"
                alt="ShopTi.com"
                width={180}
                height={60}
                className="h-auto w-auto brightness-0 invert"
              /> */}

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-2xl font-bold">SuperBee</h3>
                    <p className="text-gray-400">Gaming Store Premium</p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  Bán nick Liên quân, Free fire, Roblox với chất lượng cao và
                  giá cả hợp lý nhất thị trường
                </p>

                <div className="flex flex-wrap gap-3">
                  {["UY TÍN", "GIÁ RẺ", "CHẤT LƯỢNG"].map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                THÔNG TIN CHUNG
              </h3>

              <div className="space-y-4">
                {[
                  "Về chúng tôi",
                  "Chính sách bảo mật và đổi trả",
                  "Điều khoản sử dụng",
                  "Hướng dẫn nạp tiền thẻ cào"
                ].map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="group flex items-center gap-4 py-2 hover:text-gray-300 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gray-500 rounded-full group-hover:bg-white transition-colors"></div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {item}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                SẢN PHẨM
              </h3>

              <div className="space-y-4">
                {[
                  { name: "Nick Liên Quân Giá Rẻ", hot: true },
                  { name: "Nick Random Freefire 2k", hot: false },
                  { name: "Nick Random Liên quân 2k", hot: false },
                  { name: "Nick Random Blox Fruit 20k", hot: true },
                  { name: "Tặng 100 acc liên quân miễn phí", hot: true }
                ].map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="group flex items-center gap-4 py-2 hover:text-gray-300 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gray-500 rounded-full group-hover:bg-white transition-colors"></div>
                    <div className="flex-1">
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      {item.hot && (
                        <span className="ml-2 px-2 py-1 bg-red-600 text-xs rounded-full text-white font-bold">
                          HOT
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                HỖ TRỢ
              </h3>

              <div className="space-y-6">
                {/* Zalo Contact */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                    <span className="font-semibold">Zalo Support</span>
                  </div>
                  <p className="text-green-400 font-bold text-xl ml-9">
                    0365818471
                  </p>
                  <p className="text-gray-400 text-sm ml-9">
                    Bấm vào đây để chat
                  </p>
                </div>

                {/* Facebook Contact */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Facebook className="w-6 h-6 text-blue-400" />
                    <span className="font-semibold">Facebook Admin</span>
                  </div>
                  <p className="text-blue-400 ml-9">Hà Đức Mạnh SHOPTI</p>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-red-400" />
                    <span className="font-semibold">Địa chỉ</span>
                  </div>
                  <p className="text-gray-300 text-sm ml-9 leading-relaxed">
                    105A ngõ 12 Phan Văn Trường
                    <br />
                    Cầu Giấy, Hà Nội
                  </p>
                </div>

                <div className="ml-9 pt-4">
                  <a
                    href="https://www.facebook.com/adshopti"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    facebook.com/adshopti
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 flex-wrap">
              <p className="text-gray-400">
                © 2025 ShopTi.com - All rights reserved
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-yellow-400 font-semibold ml-2">
                  4.9/5 Rating
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-green-400 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Online 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
