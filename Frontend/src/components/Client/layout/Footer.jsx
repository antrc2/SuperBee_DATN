import {
  Zap,
  Phone,
  MapPin,
  Facebook,
  MessageCircle,
  Shield,
  Users,
  CreditCard,
  HelpCircle,
} from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-gradient-header text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SuperBee</h3>
                <p className="text-gray-400 text-sm">Gaming Store Premium</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Bán nick Liên quân, Free fire, Roblox với chất lượng cao và giá cả
              hợp lý nhất thị trường.
            </p>
          </div>

          {/* Thông tin chung */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 flex items-center">
              <div className="w-1 h-6 bg-yellow-400 mr-3"></div>
              THÔNG TIN CHUNG
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center text-sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center text-sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Chính sách bảo mật và đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center text-sm"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center text-sm"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Hướng dẫn nạp tiền thẻ cào
                </a>
              </li>
            </ul>
          </div>

          {/* Sản phẩm */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 flex items-center">
              <div className="w-1 h-6 bg-yellow-400 mr-3"></div>
              SẢN PHẨM
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center justify-between text-sm"
                >
                  Nick Liên Quân Giá Rẻ
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    HOT
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-sm"
                >
                  Nick Random Freefire 2k
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-sm"
                >
                  Nick Random Liên quân 2k
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center justify-between text-sm"
                >
                  Nick Random Blox Fruit 20k
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    HOT
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center justify-between text-sm"
                >
                  Tặng 100 acc liên quân miễn phí
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    HOT
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400 flex items-center">
              <div className="w-1 h-6 bg-yellow-400 mr-3"></div>
              HỖ TRỢ
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Zalo Support</p>
                  <p className="text-green-400 font-bold text-lg">0987654321</p>
                  <p className="text-gray-400 text-xs">Bấm vào đây để chat</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Facebook Admin</p>
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    SuperBee
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-red-500 p-2 rounded-lg mt-1">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Địa chỉ</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Số 1, Trịnh Văn Bô, Nam Từ Liêm, Hà Nội
                  </p>
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    facebook.com/superbee
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SuperBee Gaming Store. Tất cả quyền
              được bảo lưu.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Theo dõi chúng tôi:</span>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
                <a
                  href="#"
                  className="bg-green-500 p-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                </a>
                <a
                  href="#"
                  className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Phone className="h-4 w-4 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
