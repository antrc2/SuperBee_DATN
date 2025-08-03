// Gợi ý đường dẫn: src/components/Client/DisputeModal.jsx (File mới)
"use client";

import { useState } from "react";
import { X, AlertCircle, Upload, Paperclip, Loader2 } from "lucide-react";
import api from "../../utils/http"; // <<<< Đảm bảo đường dẫn tới file 'api' là chính xác

const DISPUTE_TYPES = {
  incorrect_login: "Sai thông tin đăng nhập",
  account_banned: "Tài khoản bị khóa/hạn chế",
  wrong_description: "Sản phẩm không đúng mô tả",
  account_retrieved: "Tài khoản bị chủ cũ lấy lại",
  other: "Lý do khác",
};
const MAX_FILES = 5; // ✅ CẢI TIẾN 3: Đặt hằng số cho dễ thay đổi

export const DisputeModal = ({ item, order, onClose, onDisputeSuccess }) => {
  const [disputeType, setDisputeType] = useState("incorrect_login");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ CẢI TIẾN 4: Dùng object để chứa lỗi cho từng trường
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleFileChange = (e) => {
    setErrors({}); // Xóa lỗi cũ khi người dùng chọn lại file
    const newFiles = Array.from(e.target.files);

    // Kiểm tra tổng số file
    if (attachments.length + newFiles.length > MAX_FILES) {
      setErrors({ attachments: `Chỉ được tải lên tối đa ${MAX_FILES} ảnh.` });
      return;
    }

    // Thêm các file mới vào danh sách
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setErrors({}); // Xóa lỗi khi người dùng xóa file
  };

  const validateForm = () => {
    const newErrors = {};
    if (!description.trim()) {
      newErrors.description = "Vui lòng mô tả chi tiết sự cố.";
    }
    if (attachments.length === 0) {
      newErrors.attachments = "Vui lòng cung cấp ít nhất một ảnh bằng chứng.";
    }
    setErrors(newErrors);
    // Trả về true nếu không có lỗi
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ✅ CẢI TIẾN 4: Validate trước khi gửi
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const formData = new FormData();
    formData.append("order_item_id", item.id);
    formData.append("dispute_type", disputeType);
    formData.append("description", description);
    attachments.forEach((file) => {
      formData.append("attachments[]", file); // Tên key nên là 'attachments[]' để backend nhận dạng mảng file
    });

    try {
      await api.post("/disputes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDisputeSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setErrors({ form: errorMsg }); // Hiển thị lỗi chung từ server
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                Báo cáo sự cố
              </h3>
              <p className="text-secondary text-sm">
                Sản phẩm: {item.product?.sku || item.product_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 space-y-6"
        >
          {/* Dispute Type */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Loại sự cố
            </label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover"
            >
              {Object.entries(DISPUTE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover min-h-[120px] ${
                errors.description ? "border-red-500" : ""
              }`}
              placeholder="Vui lòng mô tả rõ ràng vấn đề bạn gặp phải..."
              required
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Ảnh bằng chứng (Tối đa {MAX_FILES} ảnh, bắt buộc)
            </label>
            <div
              className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 bg-input ${
                errors.attachments ? "border-red-500" : "border-themed"
              }`}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-secondary/50" />
                <div className="mt-4 flex text-sm leading-6 text-secondary">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-accent focus-within:outline-none hover:text-accent/80"
                  >
                    <span>Tải tệp lên</span>
                    <input
                      id="file-upload"
                      name="attachments"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      disabled={attachments.length >= MAX_FILES}
                    />
                  </label>
                  <p className="pl-1">hoặc kéo và thả</p>
                </div>
                <p className="text-xs leading-5 text-secondary/70">
                  PNG, JPG, JPEG tối đa 2MB mỗi tệp
                </p>
              </div>
            </div>
            {errors.attachments && (
              <p className="text-red-500 text-sm mt-1">{errors.attachments}</p>
            )}

            {/* ✅ CẢI TIẾN 2: Hiển thị ảnh preview */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-primary mb-2">
                  Tệp đã chọn: {attachments.length}/{MAX_FILES}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {attachments.map((file, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview ${index}`}
                        className="h-full w-full object-cover rounded-md border border-themed"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.form && (
            <div className="alert alert-danger">{errors.form}</div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="action-button action-button-secondary !w-auto"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="action-button action-button-primary !w-auto bg-gradient-danger hover:brightness-110"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Gửi Khiếu nại"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
