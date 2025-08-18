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
import api from "../../../utils/http";
import { useCallback, useEffect, useState } from "react";
const Footer = () => {
  const [settings, setSettings] = useState({});
  const fetchData = useCallback(async () => {
    const response = await api.get("/settings");
    console.log(response.data);

    setSettings(response.data.data);
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const business = settings.businessSettings?.[0] || {};
  const generals = settings.generalSettings || [];
  const products = settings.productSettings || [];
  // console.log(business);
  // console.log(general);
  // console.log(products);

  return (
    <footer className="bg-gradient-header text-secondary py-12 ">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg">
                <img src={business.logo_url} alt="Logo" className="h-12 w-12 rounded-lg"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {business.shop_name}
                </h3>
                <p className="text-secondary text-sm">Gaming Store Premium</p>
              </div>
            </div>

            <p className="text-secondary text-sm leading-relaxed">
              {business.slogan}
            </p>
          </div>

          {/* Thông tin chung */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-highlight flex items-center">
              <div className="w-1 h-6 bg-highlight mr-3"></div>
              THÔNG TIN CHUNG
            </h4>
            <ul className="space-y-3">
              {generals.map((item) => (
                <li key={item.id}>
                  {" "}
                  <a
                    href={`/tin-tuc/huong-dan/${item.slug}`}
                    className="text-secondary hover:text-highlight transition-colors flex items-center text-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sản phẩm */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-highlight flex items-center">
              <div className="w-1 h-6 bg-highlight mr-3"></div>
              SẢN PHẨM
            </h4>
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product.id}>
                  <a
                    href={`/mua-acc/${product.slug}`}
                    className="text-secondary hover:text-highlight transition-colors flex items-center justify-between text-sm"
                  >
                    {product.name}
                    {/* Bạn có thể thêm logic hiển thị HOT ở đây nếu cần */}
                    {/* {product.is_hot && (
                      <span className="bg-gradient-danger text-white text-xs px-2 py-1 rounded-full">
                        HOT
                      </span>
                    )} */}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-highlight flex items-center">
              <div className="w-1 h-6 bg-highlight mr-3"></div>
              HỖ TRỢ
            </h4>
            <div className="space-y-4">
              {/* Zalo Support */}
              <a href={business.zalo_link}>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-success p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-primary font-medium">Zalo Support</p>
                    <p className="font-bold text-lg text-tertiary">
                      {business.phone_number}
                    </p>
                    <p className="text-secondary text-xs">
                      Bấm vào đây để chat
                    </p>
                  </div>
                </div>
              </a>

              {/* Facebook Admin */}
              <a href={business.facebook_link}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-info">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-primary font-medium">Facebook Admin</p>
                    <span className="text-info hover:brightness-110 transition-all text-sm">
                      {business.shop_name}
                    </span>
                  </div>
                </div>
              </a>

              {/* Địa chỉ */}
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg mt-1 bg-gradient-danger">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-primary font-medium">Địa chỉ</p>
                  <p className="text-secondary text-sm leading-relaxed">
                    {business.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-themed mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary text-sm">
              © {new Date().getFullYear()} SuperBee Gaming Store. Tất cả quyền
              được bảo lưu.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-secondary text-sm">
                Theo dõi chúng tôi:
              </span>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className="p-2 rounded-lg bg-gradient-info hover:brightness-110 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-white" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg bg-gradient-success hover:brightness-110 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg bg-gradient-danger hover:brightness-110 transition-colors"
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
};
export default Footer;
