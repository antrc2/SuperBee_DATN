import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/http";
import {
  ImagePlus,
  PlusCircle,
  X,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { useNotification } from "../../../contexts/NotificationContext";

const MAX_IMAGES = 15;

// Helper component for Input Field
const FormField = ({ label, htmlFor, error, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);

// Helper component for Form Card
const FormCard = ({ title, children, error }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  </div>
);

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [formErrors, setFormErrors] = useState({});

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

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData((prev) => ({
        ...prev,
        category_id: initialData.category_id || "",
        import_price: initialData.import_price || "",
        username: initialData.credentials?.[0]?.username || "",
        password: "",
        description: initialData.description || "",
        attributes:
          initialData.game_attributes?.map((attr) => ({
            attribute_key: attr.attribute_key,
            attribute_value: attr.attribute_value,
          })) || [],
        price: initialData.price || 0,
        sale: initialData.sale || "",
      }));
      setExistingImages(initialData.images || []);
      setNewImages([]);
    }
  }, [initialData, isEditing]);

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
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      pop("Một số file không phải là ảnh và đã được bỏ qua.", "w");
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
    e.target.value = null; // Reset input để có thể chọn lại file giống nhau
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
    if (!formData.category_id)
      errors.category_id = "Danh mục không được để trống";
    if (!formData.price) errors.price = "Giá bán không được để trống";
    if (!formData.import_price)
      errors.import_price = "Giá nhập không được để trống";
    if (formData.sale && Number(formData.sale) >= Number(formData.price))
      errors.sale = "Giá sale phải nhỏ hơn giá bán.";
    if (!formData.username) errors.username = "Username không được để trống";
    if (!isEditing && !formData.password)
      errors.password = "Password không được để trống";
    if (!formData.attributes.length)
      errors.attributes = "Cần có ít nhất 1 thuộc tính";
    formData.attributes.forEach((attr, idx) => {
      if (!attr.attribute_key)
        errors[`attribute_key_${idx}`] = "Tên thuộc tính không được để trống";
      if (!attr.attribute_value)
        errors[`attribute_value_${idx}`] =
          "Giá trị thuộc tính không được để trống";
    });
    if (!isEditing && existingImages.length + newImages.length === 0)
      errors.images = "Cần chọn ít nhất 1 ảnh";

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

  const getInputClass = (fieldName) =>
    `w-full p-2 rounded-md border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors ${
      formErrors[fieldName]
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    }`;

  const renderCategory = (cats, lvl = 0) =>
    cats.flatMap((cat) => {
      if (cat.id === 1) return [];
      const isRoot = cat.parent_id === null;
      const prefix = lvl > 0 ? `${"—".repeat(lvl)} ` : "";
      return [
        <option
          key={cat.id}
          value={cat.id}
          disabled={isRoot}
          className={isRoot ? "font-bold text-gray-500" : ""}
        >
          {prefix}
          {cat.name}
        </option>,
        ...(cat.children ? renderCategory(cat.children, lvl + 1) : []),
      ];
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormCard title="Thông tin cơ bản">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Danh mục"
            htmlFor="category_id"
            error={formErrors.category_id}
          >
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={getInputClass("category_id")}
            >
              <option value="">-- Chọn danh mục --</option>
              {renderCategory(categories)}
            </select>
          </FormField>
          <FormField
            label="Giá Nhập"
            htmlFor="import_price"
            error={formErrors.import_price}
          >
            <input
              name="import_price"
              type="number"
              value={formData.import_price}
              onChange={handleChange}
              className={getInputClass("import_price")}
            />
          </FormField>
          <FormField label="Giá Bán" htmlFor="price" error={formErrors.price}>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className={getInputClass("price")}
            />
          </FormField>
          <FormField label="Giá Sale" htmlFor="sale" error={formErrors.sale}>
            <input
              name="sale"
              type="number"
              value={formData.sale}
              onChange={handleChange}
              className={getInputClass("sale")}
            />
          </FormField>
        </div>
        <div className="col-span-1 md:col-span-2">
          <FormField label="Mô tả (tùy chọn)" htmlFor="description">
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={getInputClass("description")}
              placeholder="Nhập mô tả sản phẩm..."
            ></textarea>
          </FormField>
        </div>
      </FormCard>

      <FormCard title="Thông tin đăng nhập">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Tài khoản đăng nhập"
            htmlFor="username"
            error={formErrors.username}
          >
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className={getInputClass("username")}
            />
          </FormField>
          <FormField
            label={`Mật khẩu ${isEditing ? "(Bỏ trống nếu không đổi)" : ""}`}
            htmlFor="password"
            error={formErrors.password}
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={getInputClass("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
        </div>
      </FormCard>

      <FormCard title="Thuộc tính sản phẩm" error={formErrors.attributes}>
        <div className="space-y-4">
          {formData.attributes.map((attr, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
            >
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  name="attribute_key"
                  placeholder="Tên thuộc tính (ví dụ: Rank)"
                  value={attr.attribute_key}
                  onChange={(e) => handleAttributeChange(index, e)}
                  className={getInputClass(`attribute_key_${index}`)}
                />
                {formErrors[`attribute_key_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors[`attribute_key_${index}`]}
                  </p>
                )}
              </div>
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  name="attribute_value"
                  placeholder="Giá trị (ví dụ: Tinh Anh)"
                  value={attr.attribute_value}
                  onChange={(e) => handleAttributeChange(index, e)}
                  className={getInputClass(`attribute_value_${index}`)}
                />
                {formErrors[`attribute_value_${index}`] && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors[`attribute_value_${index}`]}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 rounded-md"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addAttribute}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <PlusCircle size={16} /> Thêm thuộc tính
        </button>
      </FormCard>

      <FormCard title="Hình ảnh minh họa" error={formErrors.images}>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={existingImages.length + newImages.length >= MAX_IMAGES}
          >
            <ImagePlus size={18} />
            <span>Chọn từ máy tính</span>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đã chọn: {existingImages.length + newImages.length} / {MAX_IMAGES}{" "}
            ảnh.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {existingImages.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square border dark:border-gray-600 rounded-md overflow-hidden group"
            >
              <img
                src={img.image_url}
                alt="Ảnh đã có"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {newImages.map((file, index) => (
            <div
              key={file.name + index}
              className="relative aspect-square border dark:border-gray-600 rounded-md overflow-hidden group"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </FormCard>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center items-center gap-2 py-2 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading && <LoaderCircle className="animate-spin" size={18} />}
            {isLoading
              ? "Đang xử lý..."
              : isEditing
              ? "Cập Nhật Sản Phẩm"
              : "Tạo Mới Sản Phẩm"}
          </button>
        </div>
      </div>
    </form>
  );
}
