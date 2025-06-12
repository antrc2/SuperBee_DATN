import { useEffect, useState } from "react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import Breadcrumbs from "../../../utils/Breadcrumbs";
import { useParams } from "react-router-dom";
import api from "@utils/http";

// !!! QUAN TRỌNG: Hãy thay thế URL này bằng domain chứa ảnh của bạn
const IMAGE_BASE_URL = "https://your-api-domain.com";

export default function ProductDetail() {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  // Đổi tên state thành 'product' (số ít) để rõ nghĩa hơn
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState({});

  // State để quản lý ảnh chính đang được hiển thị
  const [mainImg, setMainImg] = useState("");

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/acc/${slug}`);
      const productData = res.data?.data[0];
      if (productData) {
        setProduct(productData);
        setCategory(productData.category || {});
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, [slug]); // Thêm slug vào dependency array để component re-fetch khi slug thay đổi

  // Effect này sẽ chạy khi 'product' đã có dữ liệu
  // để set ảnh đầu tiên làm ảnh chính
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setMainImg(
        `${import.meta.env.VITE_BACKEND_IMG}${product.images[0].image_url}`
      );
    }
  }, [product]);

  if (isLoading) return <LoadingDomain />;

  // Nếu không có sản phẩm, hiển thị thông báo
  if (!product) {
    return (
      <div className="text-center p-10">Không tìm thấy thông tin sản phẩm.</div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg max-w-6xl mx-auto">
      {/* --- Phần hiển thị ảnh --- */}
      <div className="flex flex-col items-center md:w-1/3">
        {/* Ảnh chính */}
        <div className="mb-4 w-full">
          <img
            src={mainImg}
            alt="Main Preview"
            className="w-full h-auto object-contain rounded-lg border"
            style={{ maxHeight: "400px" }} // Giới hạn chiều cao ảnh chính
          />
        </div>
        {/* Danh sách ảnh nhỏ (thumbnails) */}
        <div className="flex flex-wrap justify-center gap-2">
          {product.images &&
            product.images.map((image) => (
              <img
                key={image.id}
                src={`${import.meta.env.VITE_BACKEND_IMG}${image.image_url}`}
                alt={`Thumbnail ${image.id}`}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 hover:border-blue-500 ${
                  mainImg ===
                  `${import.meta.env.VITE_BACKEND_IMG}}${image.image_url}`
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() =>
                  setMainImg(
                    `${import.meta.env.VITE_BACKEND_IMG}${image.image_url}`
                  )
                }
              />
            ))}
        </div>
      </div>

      {/* --- Phần thông tin sản phẩm --- */}
      <div className="flex-1 space-y-4 md:w-2/3">
        <h2 className="text-2xl font-bold uppercase">
          {product.category?.name || "Tên sản phẩm"}
        </h2>
        <p className="text-gray-500">Mã số: #{product.sku}</p>

        {/* Các thuộc tính game */}
        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          {product.game_attributes &&
            product.game_attributes.map((attr) => (
              <p key={attr.attribute_key}>
                {attr.attribute_key}:{" "}
                <span className="font-medium">{attr.attribute_value}</span>
              </p>
            ))}
        </div>

        {/* Giá tiền */}
        <div className="text-pink-500 text-3xl font-bold">
          {product.price.toLocaleString("vi-VN")}đ
        </div>
        {/* Nếu có giá gốc, bạn có thể thêm vào đây */}
        {/* <p className="text-sm text-gray-400 line-through">
           {product.original_price.toLocaleString('vi-VN')}đ
         </p> */}

        {/* Các nút bấm */}
        <div className="flex flex-col gap-2 pt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg">
            Mua Ngay
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-lg text-lg">
            Thêm vào giỏ hàng
          </button>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Chi tiết</h3>
          <p className="text-sm text-gray-600">
            {/* Nếu có mô tả sản phẩm, hiển thị ở đây */}
            {product.description || "Sản phẩm chất lượng, đảm bảo uy tín."}
          </p>
        </div>
      </div>
    </div>
  );
}
