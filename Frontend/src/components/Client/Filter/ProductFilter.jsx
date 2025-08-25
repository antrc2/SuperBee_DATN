import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { useHome } from "@contexts/HomeContext";
// import axios from "axios";
import api from "../../../utils/http";

function ProductFilter({ slug, initialFilters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const { homeData, setHomeData } = useHome(); // Giả sử setHomeData có sẵn
  const [categories, setCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // đồng bộ lại khi load initialFilters từ URL
  useEffect(() => {
    if (initialFilters.min_price && initialFilters.max_price) {
      const min = Number(initialFilters.min_price);
      const max = Number(initialFilters.max_price);

      if (min === 0 && max === 500000) setSelectedPriceRange("under500k");
      else if (min === 500000 && max === 1000000)
        setSelectedPriceRange("500k-1m");
      else if (min === 1000000 && max === 5000000)
        setSelectedPriceRange("1m-5m");
      else if (min === 5000000 && max === 10000000)
        setSelectedPriceRange("5m+");
      else if (min === 10000000 && max === 50000000)
        setSelectedPriceRange("10m+");
      else if (min === 50000000 && max === 99999999)
        setSelectedPriceRange("50m+");
      else setSelectedPriceRange(""); // reset nếu không khớp
    } else {
      setSelectedPriceRange("");
    }
  }, [initialFilters]);

  // hàm đổi khoảng giá
  const handlePriceRangeChange = (e) => {
    const value = e.target.value;
    setSelectedPriceRange(value);

    let min = "";
    let max = "";

    if (value === "under500k") {
      min = 0;
      max = 500000;
    } else if (value === "500k-1m") {
      min = 500000;
      max = 1000000;
    } else if (value === "1m-5m") {
      min = 1000000;
      max = 5000000;
    } else if (value === "5m+") {
      min = 5000000;
      max = 10000000;
    } else if (value === "10m+") {
      min = 10000000;
      max = 50000000;
    } else if (value === "50m+") {
      min = 50000000;
      max = 99999999;
    }

    setLocalFilters((prev) => ({
      ...prev,
      min_price: min,
      max_price: max,
    }));
  };
  useEffect(() => {
    setLocalFilters(initialFilters);

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await api.get(`/products/filter/${slug}`, {
          params: { limit: 1, page: 1 }, // Chỉ lấy 1 trang để lấy danh mục
        });
        if (response.data.success) {
          setCategories(response.data.data.category.children || []); // Giả sử category có children
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [initialFilters, slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const cleanedFilters = {
      ...localFilters,
      page: 1,
      limit: 12,
    };
    onApplyFilters(cleanedFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      key: "",
      sku: "",
      categoryId: "",
      min_price: "",
      max_price: "",
      attribute_key: "",
      attribute_value: "",
      sortBy: "newest",
      page: 1,
      limit: 12,
    };
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  return (
    <aside className="w-full lg:w-1/4 space-y-6">
      <div className="bg-content p-6 rounded-xl border-themed space-y-4">
        <h3 className="font-heading text-xl font-semibold text-primary flex items-center gap-2">
          <Filter className="text-highlight" />
          Bộ Lọc Sản Phẩm
        </h3>

        {/* Từ khóa chung
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Từ khóa
          </label>
          <input
            type="text"
            name="key"
            value={localFilters.key || ""}
            onChange={handleInputChange}
            placeholder="Nhập từ khóa (VD: danh mục)"
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          />
        </div> */}

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Mã sản phẩm (SKU)
          </label>
          <input
            type="text"
            name="sku"
            value={localFilters.sku || ""}
            onChange={handleInputChange}
            placeholder="Nhập mã SKU"
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          />
        </div>

        {/* Danh mục
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-primary mb-1"
          >
            Danh mục game
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={localFilters.categoryId || ""}
            onChange={handleInputChange}
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div> */}

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Khoảng giá
          </label>
         <select
            id="priceRange"
            name="priceRange"
            value={selectedPriceRange}
            onChange={handlePriceRangeChange}
            className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
          >
            <option value="">Tất cả giá</option>
            <option value="under500k">Dưới 500.000đ</option>
            <option value="500k-1m">500.000đ - 1.000.000đ</option>
            <option value="1m-5m">1.000.000đ - 5.000.000đ</option>
            <option value="5m+">5.000.000đ - 10.000.000đ</option>
            <option value="10m+">10.000.000đ - 50.000.000đ</option>
            <option value="50m+">Trên 50.000.000đ</option>
          </select>
        </div>

        {/* Thuộc tính động
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Thuộc tính
          </label>
          <div className="space-y-2">
            <input
              type="text"
              name="attribute_key"
              value={localFilters.attribute_key || ""}
              onChange={handleInputChange}
              placeholder="Tên thuộc tính (VD: Rank)"
              className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
            />
            <input
              type="text"
              name="attribute_value"
              value={localFilters.attribute_value || ""}
              onChange={handleInputChange}
              placeholder="Giá trị (VD: Cao thủ)"
              className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
            />
          </div>
        </div> */}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleApply}
            className="action-button action-button-primary flex-1"
          >
            Áp dụng
          </button>
          <button
            onClick={handleReset}
            className="action-button action-button-secondary p-3"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ProductFilter;
