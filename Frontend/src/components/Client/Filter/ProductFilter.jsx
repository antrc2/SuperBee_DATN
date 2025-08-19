import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { useHome } from "@contexts/HomeContext";
import axios from "axios";

function ProductFilter({ slug, initialFilters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(initialFilters);
  const { homeData, setHomeData } = useHome(); // Giả sử setHomeData có sẵn
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setLocalFilters(initialFilters);

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/filter/${slug}`, {
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

        {/* Từ khóa chung */}
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
        </div>

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

        {/* Danh mục */}
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
        </div>

        {/* Khoảng giá */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Khoảng giá
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min_price"
              value={localFilters.min_price || ""}
              onChange={handleInputChange}
              placeholder="Từ"
              className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
            />
            <input
              type="number"
              name="max_price"
              value={localFilters.max_price || ""}
              onChange={handleInputChange}
              placeholder="Đến"
              className="block w-full px-4 py-2 text-sm rounded-lg border-hover bg-input text-input"
            />
          </div>
        </div>

        {/* Thuộc tính động */}
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
        </div>

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
