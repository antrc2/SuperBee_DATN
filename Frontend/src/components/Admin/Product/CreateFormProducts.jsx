import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/http";
import { ImagePlus, PlusCircle, X, Eye, EyeOff } from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";

const MAX_IMAGES = 15;

export default function CreateFormProducts({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const { pop } = useNotification();
  const [formData, setFormData] = useState({
    category_id: "",
    price: "",
    import_price: "",
    sale: "",
    username: "",
    password: "",
    description: "",
    attributes: [],
  });

  const [selectedGame, setSelectedGame] = useState("");
  const [availableGames, setAvailableGames] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesSelect, setCategoriesSelect] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  // Thêm state lưu lỗi
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data?.data?.treeCategories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Mock available games with their attributes
  useEffect(() => {
    setAvailableGames([
      {
        id: 1,
        code: "LQ",
        name: "Liên Quân",
        category_id: 18,
        attributes: [
          { key: "Mức Rank", label: "Mức Rank (LQ)" },
          { key: "Đẳng Ký", label: "Đẳng Ký (LQ)" },
          { key: "Số tướng", label: "Số tướng (LQ)" },
          { key: "Số Skin", label: "Số Skin (LQ)" },
        ],
      },
      {
        id: 2,
        code: "FF",
        name: "Free Fire",
        category_id: 7,
        attributes: [
          { key: "Thẻ Võ Cực", label: "Thẻ Võ Cực (FF)" },
          { key: "Skin Súng", label: "Skin Súng (FF)" },
          { key: "Đăng Ký", label: "Đăng Ký (FF)" },
          { key: "Mức Rank", label: "Mức Rank (FF)" },
        ],
      },
    ]);
  }, []);

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        category_id: initialData.category_id || "",
        import_price: initialData.import_price || "",
        username: initialData.credentials?.[0]?.username || "",
        password: initialData.credentials?.[0]?.password || "",
        description: initialData.description || "",
        attributes:
          initialData.game_attributes?.map((attr) => ({
            attribute_key: attr.attribute_key,
            attribute_value: attr.attribute_value,
          })) || [],
        price: initialData.price || 0,
        sale: initialData.sale || "",
      }));
      setSelectedGame(initialData.game_code || "none");
      setExistingImages(initialData.images || []);
      setNewImages([]);
    }
  }, [initialData]);

  useEffect(() => {
    // Bỏ qua nếu đang trong chế độ chỉnh sửa
    if (isEditing) return;

    // Tìm game được chọn trong danh sách
    const selected = availableGames.find((g) => g.code === selectedGame);

    // TRƯỜNG HỢP 1: Người dùng đã chọn một game cụ thể
    if (selected) {
      // Tìm danh mục cha của game đó
      const parentCategory = categories.find(
        (c) => c.id === selected.category_id
      );

      // Cập nhật danh sách select chỉ với các danh mục con
      setCategoriesSelect(parentCategory?.children || []);

      // Tự động điền các thuộc tính của game vào form
      setFormData((prev) => ({
        ...prev,
        category_id: "", // Reset lại lựa chọn danh mục con
        attributes: selected.attributes.map((a) => ({
          attribute_key: a.label,
          attribute_value: "",
        })),
      }));
    }
    // TRƯỜNG HỢP 2: Người dùng chọn "Không chọn" hoặc trạng thái ban đầu
    else {
      // Đưa danh sách select về mảng rỗng để render lại toàn bộ
      setCategoriesSelect([]);

      // Xóa các thuộc tính đã điền tự động
      setFormData((prev) => ({
        ...prev,
        attributes: [],
        category_id: "", // Reset lại lựa chọn danh mục
      }));
    }
  }, [selectedGame, categories, availableGames, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttributeChange = (idx, e) => {
    const { name, value } = e.target;
    const arr = [...formData.attributes];
    arr[idx][name] = value;
    setFormData((prev) => ({ ...prev, attributes: arr }));
  };

  const addAttribute = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { attribute_key: "", attribute_value: "" },
      ],
    }));
  };

  const removeAttribute = (idx) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== idx),
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "image/heic",
      "image/heif",
    ];
    const validFiles = files.filter((f) => allowedTypes.includes(f.type));
    if (validFiles.length !== files.length) {
      pop("Chỉ chấp nhận các định dạng ảnh: jpg, jpeg, png, webp, gif, svg, avif, heic", "w");
    }
    const total = existingImages.length + newImages.length + validFiles.length;
    if (total > MAX_IMAGES) {
      pop(`Chỉ được tối đa ${MAX_IMAGES} ảnh.`, "w");
      return;
    }
    const withPreview = validFiles.map((f) =>
      Object.assign(f, { preview: URL.createObjectURL(f) })
    );
    setNewImages((prev) => [...prev, ...withPreview]);
  };

  const removeExistingImage = (i) =>
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeNewImage = (i) => {
    URL.revokeObjectURL(newImages[i].preview);
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  useEffect(
    () => () => newImages.forEach((f) => URL.revokeObjectURL(f.preview)),
    [newImages]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!formData.category_id) {
      errors.category_id = "Danh mục không được để trống";
    }
    if (!formData.price) {
      errors.price = "Giá bán không được để trống";
    }
    if (!formData.import_price) {
      errors.import_price = "Giá nhập không được để trống";
    }
    if (formData.sale && Number(formData.sale) >= Number(formData.price)) {
      errors.sale = "Giá sale phải nhỏ hơn giá bán.";
    }
    if (!formData.username) {
      errors.username = "Username không được để trống";
    }
    if (!isEditing && !formData.password) {
      errors.password = "Password không được để trống";
    }
    // Validate thuộc tính sản phẩm
    if(!formData.attributes.length){
      errors.attributes = "Cần có ít nhất 1 thuộc tính";
    }
    formData.attributes.forEach((attr, idx) => {
      if (!attr.attribute_key) {
        errors[`attribute_key_${idx}`] = "Tên thuộc tính không được để trống";
      }
      if (!attr.attribute_value) {
        errors[`attribute_value_${idx}`] = "Giá trị thuộc tính không được để trống";
      }
    });
 
    // Validate ảnh (chỉ khi tạo mới)
    if (!isEditing && existingImages.length + newImages.length === 0) {
      errors.images = "Cần chọn ít nhất 1 ảnh";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) =>
      data.append(k, typeof v === "object" ? JSON.stringify(v) : v)
    );
    newImages.forEach((f) => data.append("images[]", f));
    if (isEditing)
      data.append(
        "existing_images",
        JSON.stringify(existingImages.map((img) => img.image_url))
      );
    onSubmit(data);
  };

  // Render category options
  const renderCategory = (cats, lvl = 0) =>
    cats.flatMap((cat) => {
      // Bỏ qua danh mục có id là 1
      if (cat.id === 1) return [];
      // Nếu là danh mục gốc (parent_id === null), disabled
      const isRoot = cat.parent_id === null;
      const prefix = lvl > 0 ? `${">".repeat(lvl * 1)} ` : "";
      return [
        <option key={cat.id} value={cat.id} disabled={isRoot}>
          {prefix}{cat.name}
        </option>,
        ...(cat.children ? renderCategory(cat.children, lvl + 1) : []),
      ];
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Game selection optional, FE-only */}
      {!isEditing && (
        <div className="p-6 border shadow transition-all border-themed/50 p-6 rounded shadow-sm">
          <h3 className="mb-4 font-medium text-sm-900">
            Chọn trò chơi (tuỳ chọn)
          </h3>
          <div className="flex gap-4">
            {availableGames.map((g) => (
              <label key={g.id}>
                <input
                  type="radio"
                  name="game"
                  value={g.code}
                  checked={selectedGame === g.code}
                  onChange={() => setSelectedGame(g.code)}
                  className="mr-2"
                />
                {g.name}
              </label>
            ))}
            <label>
              <input
                type="radio"
                name="game"
                value=""
                checked={selectedGame == "none"}
                onChange={() => setSelectedGame("none")}
                className="mr-2"
              />
              Không chọn
            </label>
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="p-6 border shadow transition-all border-themed/50 p-6 rounded shadow-sm">
        <h3 className="mb-4 font-medium text-gray-900">Thông tin cơ bản</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* <div>
            <label htmlFor="sku" className="block mb-1 text-sm">
              SKU
            </label>
            <input
              name="sku"
              id="sku"
              value={formData.sku}
              onChange={handleChange}
              readOnly
              className="w-full p-2 bg-gray-100 rounded border"
            />
          </div> */}
          <div>
            <label htmlFor="category_id" className="block mb-1 text-sm">
              Danh mục
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value="">-- Chọn --</option>

              {categoriesSelect.length > 0
                ? categoriesSelect.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                : renderCategory(categories)}
            </select>
            {formErrors.category_id && (
              <p className="text-xs text-red-500 mt-1">{formErrors.category_id}</p>
            )}
          </div>
          {/* Admin: hiển thị đủ các trường */}
          <div>
            <label htmlFor="import_price" className="block mb-1 text-sm">
              Giá Nhập
            </label>
            <input
              name="import_price"
              type="number"
              value={formData.import_price}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
            {formErrors.import_price && (
              <p className="text-xs text-red-500 mt-1">{formErrors.import_price}</p>
            )}
          </div>
          <div>
            <label htmlFor="price" className="block mb-1 text-sm">
              Giá Bán
            </label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
            {formErrors.price && (
              <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="sale" className="block mb-1 text-sm">
              Giá sale
            </label>
            <input
              name="sale"
              type="number"
              value={formData.sale}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
            {formErrors.sale && (
              <p className="text-xs text-red-500 mt-1">{formErrors.sale}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="description" className="block mb-1 text-sm">
            Mô tả (tùy chọn)
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 rounded border"
            placeholder="Nhập mô tả sản phẩm (không bắt buộc)"
          />
        </div>
      </div>
      {/* Phần thông tin đăng nhập */}
      <div className="p-6 border shadow transition-all border-themed/50 p-6 shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-xl-900 mb-4">
          Thông tin đăng nhập
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-sm-700 mb-1"
            >
              Tài khoản đăng nhập
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            />
            {formErrors.username && (
              <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-sm-700 mb-1"
            >
              Mật khẩu {isEditing && "(Bỏ trống nếu không đổi)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
            )}
          </div>
        </div>
      </div>

      {/* Phần thuộc tính sản phẩm */}
      <div className="p-6 border shadow transition-all p-6 shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-xl-900 mb-4">
          Thuộc tính sản phẩm
        </h3>
        {formErrors.attributes && (
              <p className="text-xs text-red-500 mt-1">{formErrors.attributes}</p>
            )}
        <div className="space-y-4">
          {formData.attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-full">
                <input
                  type="text"
                  name="attribute_key"
                  placeholder="Tên thuộc tính"
                  value={attr.attribute_key}
                  onChange={(e) => handleAttributeChange(index, e)}
                  className="w-full p-2 rounded border"
                />
                {formErrors[`attribute_key_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[`attribute_key_${index}`]}</p>
                )}
              </div>
              <div className="w-full">
                <input
                  type="text"
                  name="attribute_value"
                  placeholder="Giá trị"
                  value={attr.attribute_value}
                  onChange={(e) => handleAttributeChange(index, e)}
                  className="w-full p-2 rounded border"
                />
                {formErrors[`attribute_value_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">{formErrors[`attribute_value_${index}`]}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAttribute}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <PlusCircle size={18} /> Thêm thuộc tính
        </button>
      </div>

      {/* Phần hình ảnh sản phẩm */}
      <div className="p-6 border shadow transition-all border-themed/50 p-6 shadow-sm">
        <h3 className="text-lg font-medium leading-6 text-xl-900 mb-4">
          Hình ảnh minh họa
        </h3>
        <input
          type="file"
          multiple
          accept="image/png, image/jpeg, image/gif, image/webp"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="mb-4 flex items-center gap-2 text-sm text-white bg-gray-700 hover:bg-gray-800 py-2 px-3 rounded-md"
          disabled={existingImages.length + newImages.length >= MAX_IMAGES}
        >
          <ImagePlus size={18} /> Chọn ảnh từ máy tính
        </button>
        {formErrors.images && (
          <p className="text-xs text-red-500 mb-2">{formErrors.images}</p>
        )}
        <p className="text-sm text-gray-500 mb-4">
          Đã chọn: {existingImages.length + newImages.length} / {MAX_IMAGES} ảnh.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {existingImages.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square border rounded-md overflow-hidden"
            >
              <img
                src={`${img.image_url}`}
                alt="Ảnh cũ"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {newImages.map((file, index) => (
            <div
              key={file.name + index}
              className="relative aspect-square border rounded-md overflow-hidden"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Nút Submit */}
      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Đang lưu..." : isEditing ? "Cập Nhật" : "Tạo Sản Phẩm"}
        </button>
      </div>
    </form>
  );
}
