import { useState, useEffect } from "react";
import { Star, X, Loader2 } from "lucide-react";
import api from "../../../utils/http";
import { useNotification } from "@contexts/NotificationContext";

const ReviewModal = ({ isOpen, onClose, userId, webId, existingReview, onReviewSuccess }) => {
  const { pop } = useNotification();
  const [rating, setRating] = useState(existingReview ? existingReview.star : 0);
  const [comment, setComment] = useState(existingReview ? existingReview.comment || "" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cập nhật trạng thái khi existingReview thay đổi
    if (existingReview) {
      setRating(existingReview.star || 0);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (existingReview) {
        // Cập nhật đánh giá
        const response = await api.put(`/reviews/${existingReview.id}`, {
          star: rating,
          comment: comment.trim() || null,
        });
        if (response.data.status) {
          pop("Cập nhật đánh giá thành công!", "success");
          onReviewSuccess();
        }
      } else {
        // Tạo đánh giá mới
        const response = await api.post("/reviews", {
          web_id: webId,
          star: rating,
          comment: comment.trim() || null,
        });
        if (response.data.status) {
          pop("Tạo đánh giá thành công!", "success");
          onReviewSuccess();
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Đã có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/reviews/${existingReview.id}`);
      if (response.data.status) {
        pop("Xóa đánh giá thành công!", "success");
        onReviewSuccess();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Đã có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại.";
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-dropdown border border-themed rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-themed">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Star className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-primary">
                {existingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}
              </h3>
              <p className="text-secondary text-sm">Chia sẻ trải nghiệm của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Đánh giá của bạn
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`h-6 w-6 cursor-pointer ${
                    value <= rating ? "text-yellow-500" : "text-secondary/50"
                  }`}
                  fill={value <= rating ? "currentColor" : "none"}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Nhận xét
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-input text-input border-themed border-hover min-h-[120px]"
              placeholder="Viết nhận xét của bạn về trang web..."
              maxLength={1000}
            ></textarea>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
        </form>

        <div className="p-4 border-t border-themed bg-background/50 text-right flex-shrink-0 flex justify-between gap-3">
          {existingReview && (
            <button
              onClick={handleDelete}
              className="action-button action-button-secondary !w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20"
              disabled={loading}
            >
              Xóa đánh giá
            </button>
          )}
          <div className="flex gap-3">
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
              className="action-button action-button-primary !w-auto bg-gradient-accent hover:brightness-110"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : existingReview ? (
                "Cập nhật"
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;