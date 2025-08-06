import React, { useState, useEffect, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

export default function CreateFormBanners({
  initialData,
  onSubmit,
  isEditing = false,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link: "",
    status: 1,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        image_url: initialData.image_url || "",
        link: initialData.link || "",
        status: initialData.status ?? 1,
      });
      if (initialData.image_url) {
        setExistingImage({ image_url: initialData.image_url });
      }
      setNewImage(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const withPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });
    setNewImage(withPreview);
    setExistingImage(null);
  };

  const removeImage = () => {
    if (newImage) URL.revokeObjectURL(newImage.preview);
    setNewImage(null);
    setExistingImage(null);
  };

  useEffect(
    () => () => {
      if (newImage) URL.revokeObjectURL(newImage.preview);
    },
    [newImage]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!existingImage && !newImage) {
      alert("Vui lòng chọn một ảnh banner.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    if (newImage) {
      data.append("image", newImage);
    }

    // Không cần gửi lại `existing_images` nếu không thay đổi
    // API có thể được thiết kế để không cần trường này
    if (isEditing && !newImage && existingImage) {
      data.delete("image_url"); // Xóa image_url để không gửi đi
    }

    onSubmit(data);
  };

  // --- Lớp CSS cho input và label để tái sử dụng ---
  const labelClass =
    "block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300";
  const inputClass =
    "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Thông tin */}
        <div className="lg:col-span-2 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin banner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className={labelClass}>
                Tiêu đề
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ví dụ: Banner khuyến mãi hè"
              />
            </div>
            <div>
              <label htmlFor="link" className={labelClass}>
                Link (URL)
              </label>
              <input
                type="url"
                name="link"
                id="link"
                value={formData.link}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://example.com/khuyen-mai"
              />
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>
                Trạng thái
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cột phải: Hình ảnh */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Hình ảnh
          </h3>
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          {existingImage || newImage ? (
            <div className="relative group w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <img
                src={newImage ? newImage.preview : existingImage.image_url}
                alt="Xem trước banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-white text-sm bg-gray-800 bg-opacity-70 py-1 px-3 rounded-md mr-2"
                >
                  Thay đổi
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <ImagePlus
                size={40}
                className="text-gray-400 dark:text-gray-500 mb-2"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Nhấn để tải ảnh lên</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PNG, JPG, GIF hoặc WEBP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nút Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 dark:focus:ring-blue-800 transition-colors"
        >
          {isLoading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Lưu banner"}
        </button>
      </div>
    </form>
  );
}
