"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Zap,
    Shield,
    Award,
    ChevronLeft,
    ChevronRight,
    Info,
    Copy,
    Tag as PriceTag,
    ListCollapse,
    FileText,
    BookOpen,
    HelpCircle,
} from "lucide-react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";
import { useCart } from "@contexts/CartContext";
import { useNotification } from "@contexts/NotificationContext";
import { formatCurrencyVND } from "@utils/hook";
import Image from "../../../components/Client/Image/Image";
import Breadcrumbs from "../../../utils/Breadcrumbs";

// Component cho nội dung trong các Tab
const TabContent = ({ product }) => {
    const [activeTab, setActiveTab] = useState("attributes");

    const tabs = [
        { id: "description", label: "Mô tả chi tiết", icon: FileText },
        { id: "attributes", label: "Thông số Game", icon: ListCollapse },
        { id: "guide", label: "Hướng dẫn", icon: HelpCircle },
    ];

    return (
        <div className="section-bg mt-8 p-4 sm:p-6 lg:p-8">
            {/* Tab Buttons */}
            <div className="flex border-b border-themed mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? "tab-button-active" : ""}`}
                    >
                        <div className="flex justify-center">
                            <div>
                                <tab.icon size={18} className="mr-2" />
                            </div>
                            <div> {tab.label}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div>
                {activeTab === "description" && (
                    <div className="prose prose-sm md:prose-base max-w-none text-secondary prose-headings:text-primary prose-strong:text-primary">
                        <h3>Giới thiệu về tài khoản</h3>
                        <p>
                            Đây là một trong những tài khoản độc quyền, được chúng tôi tuyển chọn kỹ lưỡng để đảm bảo chất lượng và trải nghiệm tốt
                            nhất cho người chơi. Với các chỉ số ấn tượng và vật phẩm hiếm có, tài khoản này sẽ giúp bạn dễ dàng chinh phục mọi thử
                            thách trong game.
                        </p>
                        <p>
                            Tài khoản đã được xác minh thông tin đầy đủ, đảm bảo an toàn tuyệt đối và không có tranh chấp. Bạn có thể thay đổi mật
                            khẩu và các thông tin cá nhân ngay sau khi nhận được.
                        </p>
                        <ul>
                            <li>
                                <strong>Trang bị VIP:</strong> Sở hữu nhiều trang bị VIP phiên bản giới hạn.
                            </li>
                            <li>
                                <strong>Trang phục hoặc skin súng độc quyền:</strong> bộ sưu tập trang phục và skin súng sự kiện mới nhất.
                            </li>
                        </ul>
                        <h3>Lưu ý quan trọng</h3>
                        <p>
                            Vui lòng không chia sẻ thông tin tài khoản cho bất kỳ ai khác để tránh rủi ro. Chúng tôi hỗ trợ 24/7 nếu bạn gặp bất kỳ
                            vấn đề nào trong quá trình sử dụng.
                        </p>
                    </div>
                )}
                {activeTab === "attributes" && (
                    <div>
                        {product.game_attributes?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.game_attributes.map((attr) => (
                                    <div
                                        key={attr.id}
                                        className="flex justify-between items-center py-3 px-4 bg-input rounded-lg border border-themed text-sm"
                                    >
                                        <span className="text-secondary">{attr.attribute_key}</span>
                                        <span className="text-primary font-bold">{attr.attribute_value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary text-center py-4">Sản phẩm này không có thông số chi tiết.</p>
                        )}
                    </div>
                )}
                {activeTab === "guide" && (
                    <div className="prose prose-sm md:prose-base max-w-none text-secondary prose-headings:text-primary prose-strong:text-primary">
                        <h3>Các bước nhận tài khoản</h3>
                        <ol>
                            <li>
                                <strong>Thanh toán thành công:</strong> Sau khi hoàn tất thanh toán, hệ thống sẽ tự động xử lý đơn hàng của bạn.
                            </li>
                            <li>
                                <strong>Kiểm tra mục "Tài khoản đã mua":</strong> Thông tin đăng nhập (tên tài khoản và mật khẩu) sẽ được hiển thị
                                trong trang cá nhân của bạn.
                            </li>
                            <li>
                                <strong>Đăng nhập và đổi mật khẩu:</strong> Sử dụng thông tin được cung cấp để đăng nhập vào game. Hãy đổi mật khẩu
                                ngay lập tức để đảm bảo an toàn.
                            </li>
                            <li>
                                <strong>Hoàn tất:</strong> Tận hưởng tài khoản mới và những trận đấu đỉnh cao!
                            </li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ProductDetail() {
    const { slug } = useParams();
    const { handleAddToCart, handlePayNow } = useCart();
    const { pop } = useNotification();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/products/acc/${slug}`);
                setProduct(res.data?.data[0]);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
                setProduct(null);
            }
        };
        fetchProductData();
    }, [slug]);

    const handleAddToCartClick = async () => {
        if (product) {
            setIsAddingToCart(true);
            await handleAddToCart(product);
            setIsAddingToCart(false);
        }
    };

    const handleBuyNowClick = async () => {
        if (product) {
            await handlePayNow(product);
        }
    };

    const handleCopyId = () => {
        if (!product?.sku) return;
        navigator.clipboard.writeText(product.sku);
        pop("Đã sao chép mã tài khoản!", "success");
    };

    const nextImage = () => product && setSelectedImageIndex((p) => (p + 1) % product.images.length);

    const prevImage = () => product && setSelectedImageIndex((p) => (p - 1 + product.images.length) % product.images.length);

    if (loading) return <LoadingDomain />;

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center text-secondary">Không tìm thấy sản phẩm.</div>
            </div>
        );
    }

    const currentImageSrc = product.images?.[selectedImageIndex]?.image_url || "/placeholder.svg";
    const breadcrumbItems = product
        ? [
              { label: "Trang chủ", href: "/" },
              { label: "Mua Acc", href: "/mua-acc" },
              {
                  label: product.category.name,
                  href: `/mua-acc/${product.category.slug}`,
              },
              { label: `Tài khoản #${product.sku}` },
          ]
        : [];

    const hasSale = product.sale > 0 && product.sale < product.price;

    return (
        <div className="min-h-screen py-8 ">
            <div className="max-w-screen-xl mx-auto">
                <Breadcrumbs items={breadcrumbItems} />

                {/* --- KHU VỰC THÔNG TIN CHÍNH --- */}
                <div className="section-bg mt-6 p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* --- Cột Hình Ảnh --- */}
                        <div className="space-y-4">
                            <div className="relative group aspect-[4/3] rounded-2xl overflow-hidden bg-input border-themed shadow-lg">
                                <Image
                                    url={currentImageSrc}
                                    alt="Product"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {product.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                        >
                                            <ChevronLeft />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                        >
                                            <ChevronRight />
                                        </button>
                                        <div className="absolute bottom-3 right-3 bg-black/40 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                                            {selectedImageIndex + 1} / {product.images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                            {product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 w-20 h-20 thumbnail-button ${
                                                selectedImageIndex === index ? "thumbnail-button-active" : ""
                                            }`}
                                        >
                                            <Image url={image.image_url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- Cột Thông Tin & Mua Hàng --- */}
                        <div className="flex flex-col">
                            <div>
                                <h1 className="font-heading text-2xl lg:text-4xl font-bold text-primary leading-tight">
                                    {product.category?.name || "Tên sản phẩm"}
                                </h1>
                                <div
                                    className="flex items-center gap-2 mt-3 bg-input px-3 py-2 rounded-lg w-fit cursor-pointer border border-transparent hover:border-accent transition-colors"
                                    onClick={handleCopyId}
                                >
                                    <span className="text-sm text-secondary">Mã:</span>
                                    <code className="text-highlight font-semibold tracking-wider">#{product.sku}</code>
                                    <Copy size={16} className="text-secondary" />
                                </div>
                            </div>

                            <div className="text-sm text-secondary leading-relaxed my-6">
                                {product.description ||
                                    "Tài khoản chất lượng cao với nhiều vật phẩm giá trị. Cam kết thông tin chính xác, bảo hành uy tín. Giao dịch ngay để sở hữu!"}
                            </div>

                            {/* KHỐI GIÁ BÁN */}
                            <div className="bg-input rounded-xl p-5 border-themed my-auto">
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <h3 className="font-heading text-lg font-semibold text-secondary mb-1">Giá chỉ còn</h3>
                                        <p className="font-heading text-5xl font-bold text-highlight">
                                            {formatCurrencyVND(hasSale ? product.sale : product.price)}
                                        </p>
                                        {hasSale && (
                                            <p className="text-secondary line-through text-lg mt-1">Giá gốc: {formatCurrencyVND(product.price)}</p>
                                        )}
                                    </div>
                                    {hasSale && (
                                        <div className="bg-gradient-danger text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                            GIẢM {formatCurrencyVND(product.price - product.sale)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* KHỐI HÀNH ĐỘNG */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleBuyNowClick}
                                    disabled={loading}
                                    className="action-button action-button-primary text-base font-bold h-14"
                                >
                                    <Zap className="w-5 h-5 mr-2" /> Mua Ngay
                                </button>
                                <button onClick={handleAddToCartClick} disabled={isAddingToCart} className="action-button action-button-secondary">
                                    {isAddingToCart ? (
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5 mr-2" /> Thêm vào giỏ
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* KHỐI CAM KẾT */}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-themed">
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <Shield className="w-5 h-5 text-tertiary" />
                                    <span>Bảo hành uy tín</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <Zap className="w-5 h-5 text-highlight" />
                                    <span>Giao dịch nhanh</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <Award className="w-5 h-5 text-info" />
                                    <span>Chất lượng 100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <TabContent product={product} />
            </div>
        </div>
    );
}
