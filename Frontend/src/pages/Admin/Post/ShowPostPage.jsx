
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../utils/http"; // axios instance
import ReactMarkdown from "react-markdown";

export default function ShowPostPage() {
  const { id } = useParams(); // Lấy slug từ URL
  const navigate = useNavigate();
console.log("Slug from URL:", id); // Debugging line to check slug value

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy slug trong URL.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/post/${id}`);
        setPostData(response.data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("Bài viết không tồn tại.");
        } else {
          setError("Lỗi khi tải bài viết.");
        }
        setPostData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);
  
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Nháp";
      case 1:
        return "Đã xuất bản";
      case 2:
        return "Lưu trữ";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "#6b7280"; // gray
      case 2:
        return "#10b981"; // green
      case 3:
        return "#ef4444"; // red
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontSize: "1.2rem",
        color: "#4b5563",
      }}>
        Đang tải bài viết...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontSize: "1.2rem",
        color: "#dc2626",
        padding: "20px",
        textAlign: "center",
      }}>
        <p>Lỗi: {error}</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!postData) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontSize: "1.2rem",
        color: "#4b5563",
      }}>
        Không có dữ liệu bài viết để hiển thị.
      </div>
    );
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: "Inter, sans-serif", // Sử dụng Inter font (nếu có, không thì fallback về sans-serif)
      }}
    >
      <div
        style={{
          maxWidth: "960px", // Giảm max-width để trông gọn gàng hơn
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // Shadow mạnh hơn
            overflow: "hidden",
          }}
        >
          {/* Header Section */}
          <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
            {/* Status and Category Badges */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px", // Tăng padding
                  backgroundColor: getStatusColor(postData.status),
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "13px", // Tăng font size
                  fontWeight: "600",
                }}
              >
                {getStatusText(postData.status)}
              </span>

              {postData.category && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 14px",
                    backgroundColor: "#e0f2fe", // light blue
                    color: "#0369a1", // dark blue
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    gap: "6px", // Tăng gap
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>🏷️</span>{" "}
                  {postData.category.name}
                </span>
              )}

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  backgroundColor: "#f3f4f6", // gray-100
                  color: "#4b5563", // gray-700
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "1px solid #e5e7eb",
                }}
              >
                ID: {postData.id}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "3.2rem", // Tăng kích thước tiêu đề
                fontWeight: "800", // Rất đậm
                marginBottom: "24px",
                lineHeight: "1.2",
                color: "#1f2937", // gray-900
                wordBreak: "break-word", // Đảm bảo tiêu đề dài không tràn
              }}
            >
              {postData.title}
            </h1>

            {/* Author and Meta Info */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "28px", // Tăng khoảng cách giữa các mục
                fontSize: "15px", // Tăng font size
                color: "#6b7280",
              }}
            >
              {/* Author */}
              {postData.author && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <img
                    src={postData.author.avatar_url || "/placeholder.svg"}
                    alt={postData.author.username || "Tác giả"}
                    style={{
                      width: "48px", // Tăng kích thước avatar
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #a78bfa", // Viền tím
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px", // Tăng gap
                        fontWeight: "700", // Đậm hơn
                        color: "#1f2937", // gray-900
                        fontSize: "16px",
                      }}
                    >
                      👤 {postData.author.username}
                    </div>
                    <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                      {postData.author.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>📅</span> Tạo:{" "}
                {formatDate(postData.created_at)}
              </div>

              {/* Updated Date */}
              {postData.created_at !== postData.updated_at && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span style={{ fontSize: "16px" }}>🔄</span> Cập nhật:{" "}
                  {formatDate(postData.updated_at)}
                </div>
              )}

              {/* Comments */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>💬</span>{" "}
                {postData.comments?.length || 0} bình luận
              </div>
            </div>
          </div>

          {/* Thumbnail Image */}
          <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)", // Shadow lớn hơn
              }}
            >
              <img
                src={postData.image_thumbnail_url || "/placeholder.svg"}
                alt={postData.title}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "450px", // Tăng chiều cao tối đa
                  objectFit: "cover",
                  display: "block", // Loại bỏ khoảng trắng dưới ảnh
                }}
              />
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "20px",
                color: "#1f2937",
              }}
            >
              Nội dung bài viết
            </h2>
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "28px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                lineHeight: "1.7",
              }}
            >
            <div
              className="prose"
              style={{
                color: "#374151",
                fontSize: "17px",
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: postData.content || "<p>Không có nội dung</p>" }}
            ></div>


            </div>
          </div>

          {/* Category Section */}
          {postData.category && (
            <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>📚</span> Thông tin danh mục
              </h3>

              <div
                style={{
                  background: "linear-gradient(to right, #e0f7fa, #e0f2f7)", // Màu gradient nhẹ hơn
                  padding: "28px",
                  borderRadius: "12px",
                  border: "1px solid #b2ebf2", // Viền xanh nhạt
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "24px" }}
                >
                  <img
                    src={postData.category.image_url || "/placeholder.svg"}
                    alt={postData.category.name}
                    style={{
                      width: "90px", // Tăng kích thước ảnh
                      height: "90px",
                      borderRadius: "12px",
                      objectFit: "cover",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      border: "2px solid #00bcd4", // Viền xanh
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        color: "#00796b", // Màu xanh đậm
                        marginBottom: "10px",
                      }}
                    >
                      {postData.category.name}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "10px",
                        fontSize: "15px",
                        color: "#4b5563",
                      }}
                    >
                      <p>
                        <strong>Slug:</strong> {postData.category.slug}
                      </p>
                      <p>
                        <strong>ID:</strong> {postData.category.id}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {postData.category.status === 1
                          ? "Hoạt động"
                          : "Không hoạt động"}
                      </p>
                      <p>
                        <strong>Tạo bởi:</strong> User ID{" "}
                        {postData.category.created_by}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Author Section */}
          {postData.author && (
            <div style={{ padding: "32px" }}>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: "#1f2937",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>👨‍💻</span> Thông tin chi tiết tác giả
              </h3>

              <div
                style={{
                  background: "linear-gradient(to right, #ecfdf5, #d1fae5)", // Màu gradient nhẹ hơn
                  padding: "28px",
                  borderRadius: "12px",
                  border: "1px solid #a7f3d0", // Viền xanh lá nhạt
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "28px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={postData.author.avatar_url || "/placeholder.svg"}
                      alt={postData.author.username}
                      style={{
                        width: "100px", // Tăng kích thước avatar
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        border: "3px solid #34d399", // Viền xanh lá
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0px", // Đẩy xuống một chút
                        right: "0px", // Đẩy vào một chút
                        width: "28px", // Tăng kích thước chấm xanh
                        height: "28px",
                        backgroundColor: "#10b981", // green-500
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid white", // Viền trắng
                      }}
                    >
                      <div
                        style={{
                          width: "14px", // Tăng kích thước chấm trắng bên trong
                          height: "14px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "26px", // Tăng kích thước tên tác giả
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginBottom: "16px",
                      }}
                    >
                      {postData.author.username}
                    </h4>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: "16px", // Tăng khoảng cách
                        fontSize: "15px",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>📧</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            Email
                          </p>
                          <p style={{ color: "#4b5563" }}>
                            {postData.author.email}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>📱</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            Số điện thoại
                          </p>
                          <p style={{ color: "#4b5563" }}>
                            {postData.author.phone}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>💰</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            Mã donate
                          </p>
                          <p
                            style={{
                              color: "#4b5563",
                              fontFamily: "monospace",
                              backgroundColor: "#e5e7eb", // gray-200
                              padding: "6px 10px", // Tăng padding
                              borderRadius: "6px",
                              display: "inline-block",
                              fontWeight: "bold", // Đậm hơn
                            }}
                          >
                            {postData.author.donate_code}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>🆔</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            User ID
                          </p>
                          <p style={{ color: "#4b5563" }}>
                            {postData.author.id}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>🌐</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            Web ID
                          </p>
                          <p style={{ color: "#4b5563" }}>
                            {postData.author.web_id}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span style={{ fontSize: "22px" }}>✅</span>
                        <div>
                          <p
                            style={{ fontWeight: "600", color: "#1f2937" }}
                          >
                            Trạng thái
                          </p>
                          <p style={{ color: "#4b5563" }}>
                            {postData.author.status === 1
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "20px", // Tăng margin-top
                        paddingTop: "20px",
                        borderTop: "1px solid #d1d5db",
                      }}
                    >
                      <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                        Tham gia từ: {formatDate(postData.author.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              padding: "24px",
              backgroundColor: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              color: "#9ca3af",
              flexWrap: "wrap",
              gap: "16px",
              borderRadius: "0 0 12px 12px", // Bo tròn góc dưới
            }}
          >
            <p>
              Bài viết #{postData.id} • Slug: {postData.slug}
            </p>
            <p>Cập nhật lần cuối: {formatDate(postData.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}