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
      setExistingImage(
        initialData.image_url ? { image_url: initialData.image_url } : null
      );
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
    setExistingImage(null); // Nếu chọn ảnh mới thì bỏ ảnh cũ
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
    if (!existingImage && !newImage)
      return alert("Vui lòng chọn một ảnh banner.");

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    if (newImage) {
      data.append("image", newImage);
    }

    if (isEditing && existingImage) {
      data.append("existing_images", JSON.stringify([existingImage.image_url]));
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Thông tin cơ bản */}
      <div className="p-6 border bg-white rounded shadow-sm">
        <h3 className="mb-4 font-medium text-gray-900">Thông tin banner</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block mb-1 text-sm">
              Tiêu đề
            </label>
            <input
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
          </div>
          <div>
            <label htmlFor="link" className="block mb-1 text-sm">
              Link
            </label>
            <input
              name="link"
              id="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            />
          </div>
          <div>
            <label htmlFor="status" className="block mb-1 text-sm">
              Trạng thái
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 rounded border"
            >
              <option value={1}>Hiển thị</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hình ảnh banner */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hình ảnh banner
        </h3>
        <input
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="mb-4 flex items-center gap-2 text-sm text-white bg-gray-700 hover:bg-gray-800 py-2 px-3 rounded-md"
        >
          <ImagePlus size={18} /> Chọn ảnh từ máy tính
        </button>

        {(existingImage || newImage) ? (
          <div className="relative w-48 aspect-square border rounded-md overflow-hidden">
            <img
              src={
                newImage
                  ? newImage.preview
                  : `${import.meta.env.VITE_BACKEND_IMG}${existingImage.image_url}`
              }
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa chọn ảnh nào.</p>
        )}
      </div>

      {/* Nút Submit */}
      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Đang lưu..." : isEditing ? "Cập nhật Banner" : "Tạo Banner"}
        </button>
      </div>
    </form>
  );
}
