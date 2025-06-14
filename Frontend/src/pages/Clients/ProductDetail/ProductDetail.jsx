import { useEffect, useState } from "react";
import LoadingDomain from "@components/Loading/LoadingDomain";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "@utils/http";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState({});
  const [mainImg, setMainImg] = useState("");
  const [isAdding, setIsAdding] = useState(false);  // loading khi thêm vào giỏ

  const getData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/acc/${slug}`);
      const productData = res.data?.data[0];

      if (productData) {
        setProduct(productData);
        setCategory(productData.category || {});
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [slug]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImg(`${import.meta.env.VITE_BACKEND_IMG}${product.images[0].image_url}`);
    }
  }, [product]);

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsAdding(true);
      const userId = 1; // Sau này lấy từ token
      const payload = { user_id: userId, product_id: product.id };

      const res = await api.post("/carts", payload);

      if (res.data.status) {
        alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
        navigate("/cart");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      // Bắt lỗi chính xác từ BE trả về
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("❌ Lỗi hệ thống, vui lòng thử lại sau.");
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <LoadingDomain />;

  if (!product) {
    return (
      <div className="text-center p-10">Không tìm thấy thông tin sản phẩm.</div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-white rounded-2xl shadow-lg max-w-6xl mx-auto">
      {/* Hình ảnh */}
      <div className="flex flex-col items-center md:w-1/3">
        <div className="mb-4 w-full">
          <img
            src={mainImg}
            alt="Main Preview"
            className="w-full h-auto object-contain rounded-lg border"
            style={{ maxHeight: "400px" }}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {product.images?.map((image) => {
            const imageUrl = `${import.meta.env.VITE_BACKEND_IMG}${image.image_url}`;
            return (
              <img
                key={image.id}
                src={imageUrl}
                alt={`Thumbnail ${image.id}`}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                  mainImg === imageUrl ? "border-blue-500" : "border-transparent"
                }`}
                onClick={() => setMainImg(imageUrl)}
              />
            );
          })}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1 space-y-4 md:w-2/3">
        <h2 className="text-2xl font-bold uppercase">
          {product.category?.name || "Tên sản phẩm"}
        </h2>
        <p className="text-gray-500">Mã số: #{product.sku}</p>

        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
          {product.game_attributes?.map((attr) => (
            <p key={attr.attribute_key}>
              {attr.attribute_key}:{" "}
              <span className="font-medium">{attr.attribute_value}</span>
            </p>
          ))}
        </div>

        <div className="text-pink-500 text-3xl font-bold">
          {product.price.toLocaleString("vi-VN")}đ
        </div>

        <div className="flex flex-col gap-2 pt-4">
          <Link to={`/cart`} className="w-full">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg">
              Mua Ngay
            </button>
          </Link>

          <button
            onClick={handleAddToCart}
            className={`${
              isAdding ? "bg-pink-300 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"
            } text-white font-bold py-3 rounded-lg text-lg`}
            disabled={isAdding}
          >
            {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
          </button>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold">Chi tiết</h3>
          <p className="text-sm text-gray-600">
            {product.description || "Sản phẩm chất lượng, đảm bảo uy tín."}
          </p>
        </div>
      </div>
    </div>
  );
}
