import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/http";
import { ImagePlus, PlusCircle, X, Eye, EyeOff } from "lucide-react";

const MAX_IMAGES = 15;

export default function CreateFormProductsPartner({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    category_id: "",
    import_price: "",
    username: "",
    password: "",
    attributes: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

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

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        category_id: initialData.category_id || "",
        import_price: initialData.import_price || "",
        username: initialData.credentials?.[0]?.username || "",
        password: initialData.credentials?.[0]?.password || "",
        attributes:
          initialData.game_attributes?.map((attr) => ({
            attribute_key: attr.attribute_key,
            attribute_value: attr.attribute_value,
          })) || [],
      }));
      setExistingImages(initialData.images || []);
      setNewImages([]);
    }
  }, [initialData]);

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
      "image/heif"
    ];
    const validFiles = files.filter(f => allowedTypes.includes(f.type));
    if (validFiles.length !== files.length) {
      alert("Chỉ chấp nhận các định dạng ảnh: jpg, jpeg, png, webp, gif, svg, avif, heic");
    }
    const total = existingImages.length + newImages.length + validFiles.length;
    if (total > MAX_IMAGES) return alert(`Chỉ được tối đa ${MAX_IMAGES} ảnh.`);
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
    if (!formData.category_id) return alert("Vui lòng chọn danh mục.");
    if (!formData.import_price) return alert("Vui lòng nhập giá bán.");
    if(formData.import_price > 999999999) return alert("Giá phải nhỏ hơn 999.999.999đ");
    if (!formData.username) return alert("Vui lòng nhập username.");
    if (!isEditing && !formData.password)
      return alert("Vui lòng nhập password.");

    const data = new FormData();
    data.append("category_id", formData.category_id);
    data.append("import_price", formData.import_price);
    data.append("username", formData.username);
    data.append("password", formData.password);
    data.append("attributes", JSON.stringify(formData.attributes));
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
    cats.flatMap((cat) => [
      <option key={cat.id} value={cat.id}>
        {" ".repeat(lvl * 4)}
        {cat.name}
      </option>,
      ...(cat.children ? renderCategory(cat.children, lvl + 1) : []),
    ]);

  // Định nghĩa className tái sử dụng cho form dark mode
  const inputClass =
    "w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition";
  const blockClass =
    "p-6 border bg-white dark:bg-[#121212] rounded-lg shadow-md transition";
  const buttonClass =
    "flex items-center gap-2 text-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 py-2 px-4 rounded-lg transition";
  const iconClass = "text-gray-500 dark:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className={blockClass}>
        <h3 className="mb-4 font-medium text-gray-900 dark:text-white">Thông tin cơ bản</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category_id" className="block mb-1 text-sm text-gray-700 dark:text-gray-200">
              Danh mục
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              {renderCategory(categories)}
            </select>
          </div>
          <div>
            <label htmlFor="import_price" className="block mb-1 text-sm text-gray-700 dark:text-gray-200">
              Giá Bán
            </label>
            <input
              name="import_price"
              type="number"
              value={formData.import_price}
              onChange={handleChange}
              required
              className={inputClass}
              disabled={isEditing && (initialData?.status === 1 || initialData?.status === 4)}
              placeholder="Nhập giá bán"
            />
            {isEditing && (initialData?.status === 1 || initialData?.status === 4) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Không thể sửa giá khi sản phẩm đang bán hoặc đã bán.</p>
            )}
          </div>
        </div>
      </div>
      {/* Phần thông tin đăng nhập */}
      <div className={blockClass}>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
          Thông tin đăng nhập
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Tài khoản đăng nhập
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Nhập tài khoản"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Mật khẩu {isEditing && "(Bỏ trống nếu không đổi)"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className={inputClass}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iconClass}`}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Phần thuộc tính sản phẩm */}
      <div className={blockClass}>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
          Thuộc tính sản phẩm
        </h3>
        <div className="space-y-4">
          {formData.attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="text"
                name="attribute_key"
                placeholder="Tên thuộc tính"
                value={attr.attribute_key}
                onChange={(e) => handleAttributeChange(index, e)}
                className={inputClass}
              />
              <input
                type="text"
                name="attribute_value"
                placeholder="Giá trị"
                value={attr.attribute_value}
                onChange={(e) => handleAttributeChange(index, e)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className={`text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 ${iconClass}`}
                tabIndex={-1}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAttribute}
          className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition"
        >
          <PlusCircle size={18} className={iconClass} /> Thêm thuộc tính
        </button>
      </div>
      {/* Phần hình ảnh sản phẩm */}
      <div className={blockClass}>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
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
          className="mb-4 flex items-center gap-2 text-sm text-white bg-gray-700 dark:bg-[#2d2d2d] hover:bg-gray-800 dark:hover:bg-[#3a3a3a] py-2 px-3 rounded-lg transition"
          disabled={existingImages.length + newImages.length >= MAX_IMAGES}
        >
          <ImagePlus size={18} className={iconClass} /> Chọn ảnh từ máy tính
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Đã chọn: {existingImages.length + newImages.length} / {MAX_IMAGES} ảnh.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {existingImages.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square border rounded-md overflow-hidden border-gray-300 dark:border-[#333]"
            >
              <img
                src={`${img.image_url}`}
                alt="Ảnh cũ"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className={`absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 ${iconClass}`}
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {newImages.map((file, index) => (
            <div
              key={file.name + index}
              className="relative aspect-square border rounded-md overflow-hidden border-gray-300 dark:border-[#333]"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className={`absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 ${iconClass}`}
                tabIndex={-1}
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
          className={buttonClass}
        >
          {isLoading ? "Đang lưu..." : isEditing ? "Cập Nhật" : "Tạo Sản Phẩm"}
        </button>
      </div>
    </form>
  );
} 