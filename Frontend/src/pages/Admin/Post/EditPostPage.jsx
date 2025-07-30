import React, { useState, useEffect, useMemo } from "react"; // Thêm useMemo
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/http";
import TurndownService from "turndown";
import { marked } from "marked";
import { toast } from "react-toastify"; // Chỉ cần toast, không cần ToastContainer ở đây nếu đã đặt ở cấp cao hơn

// --- IMPORT CSS CỦA FROALA EDITOR ---
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";

// --- IMPORT COMPONENT CHÍNH CỦA FROALA ---
import FroalaEditorComponent from "react-froala-wysiwyg";
import $ from "jquery"; // Đảm bảo jQuery được import để Froala có thể sử dụng

// --- IMPORT TẤT CẢ CÁC PLUGIN CẦN THIẾT CHO GIAO DIỆN NHƯ WORD ---
import "froala-editor/js/plugins/align.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/js/plugins/code_view.min.js";
import "froala-editor/js/plugins/colors.min.js";
import "froala-editor/js/plugins/emoticons.min.js";
import "froala-editor/js/plugins/entities.min.js";
import "froala-editor/js/plugins/fullscreen.min.js";
import "froala-editor/js/plugins/help.min.js";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/link.min.js";
import "froala-editor/js/plugins/lists.min.js";
import "froala-editor/js/plugins/paragraph_format.min.js";
import "froala-editor/js/plugins/paragraph_style.min.js";
import "froala-editor/js/plugins/quick_insert.min.js";
import "froala-editor/js/plugins/quote.min.js";
import "froala-editor/js/plugins/table.min.js";
import "froala-editor/js/plugins/url.min.js";
import "froala-editor/js/plugins/video.min.js";
import "froala-editor/js/plugins/line_breaker.min.js";
import "froala-editor/js/plugins/word_paste.min.js";
import "froala-editor/js/plugins/save.min.js";
import "froala-editor/js/plugins/file.min.js"; // Import plugin cho file upload
import LoadingDomain from "../../../components/Loading/LoadingDomain";

// Hàm chuyển đổi chuỗi thành slug
const slugify = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

// Hàm kiểm tra nội dung Froala có rỗng không
const isContentEmpty = (htmlContent) => {
  return (
    htmlContent === null ||
    htmlContent.trim() === "" ||
    htmlContent.replace(/<[^>]*>/g, "").trim() === ""
  );
};

// Hàm xử lý nội dung HTML để đảm bảo ảnh và video/iframe căn giữa
const processMediaContentForDisplayOrSave = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent || "<div></div>", "text/html");

  // Xử lý hình ảnh
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    img.style.display = "block";
    img.style.marginLeft = "auto";
    img.style.marginRight = "auto";
    img.classList.remove("fr-fic", "fr-dib", "fr-fil", "fr-fir"); // Xóa class căn chỉnh của Froala nếu có
  });

  // Xử lý video và iframe
  const mediaElements = doc.querySelectorAll("video, iframe"); // Chọn cả video và iframe
  mediaElements.forEach((media) => {
    if (media.tagName === "VIDEO") {
      if (!media.getAttribute("controls")) {
        media.setAttribute("controls", ""); // Đảm bảo video có controls
      }
    }
    // Áp dụng styling căn giữa và responsive cho cả video và iframe
    media.style.display = "block";
    media.style.marginLeft = "auto";
    media.style.marginRight = "auto";
    media.style.width = "100%";
    if (media.tagName === "IFRAME") {
      media.style.height = "auto"; // Cho phép tự điều chỉnh chiều cao
      media.style.border = "none"; // Xóa border mặc định cho iframe
    }
  });

  return doc.body.innerHTML;
};

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Khởi tạo TurndownService và các quy tắc chỉ một lần bằng useMemo
  const turndownService = useMemo(() => {
    const td = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "*",
      codeBlockStyle: "fenced",
    });

    // Quy tắc cho Video: Chuyển đổi thẻ <video> thành Markdown link
    td.addRule("videoLink", {
      filter: function (node) {
        return (
          node.nodeName === "VIDEO" &&
          (node.getAttribute("src") || node.querySelector("source"))
        );
      },
      replacement: function (content, node) {
        const src =
          node.getAttribute("src") ||
          (node.querySelector("source")
            ? node.querySelector("source").getAttribute("src")
            : null);
        return src ? `![Video](${src})` : "";
      },
    });

    // *** MỚI: Quy tắc cho IFRAME (Video nhúng) ***
    td.addRule("iframeEmbed", {
      filter: function (node) {
        return (
          node.nodeName === "IFRAME" &&
          (node.getAttribute("src") || node.getAttribute("data-src"))
        );
      },
      replacement: function (content, node) {
        const src = node.getAttribute("src") || node.getAttribute("data-src");
        const width = node.getAttribute("width") || "560";
        const height = node.getAttribute("height") || "315";
        // Trả về thẻ iframe nguyên bản để hiển thị đúng trong HTML
        return `<iframe src="${src}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
      },
    });

    // Quy tắc cho File Links: Chuy đổi các liên kết file được chèn bởi Froala
    td.addRule("fileLink", {
      filter: function (node) {
        return node.nodeName === "A" && node.classList.contains("fr-file");
      },
      replacement: function (content, node) {
        const href = node.getAttribute("href");
        const text = node.textContent.trim();
        return `[${text}](${href})`;
      },
    });

    return td;
  }, []); // Chỉ khởi tạo một lần

  const [postData, setPostData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const authToken = sessionStorage.getItem("access_token");

  // Cấu hình Froala Editor
  const froalaConfig = {
    placeholderText: "Nhập nội dung bài viết...",
    toolbarButtons: {
      moreText: {
        buttons: [
          "bold",
          "italic",
          "underline",
          "strikeThrough",
          "subscript",
          "superscript",
          "fontFamily",
          "fontSize",
          "textColor",
          "backgroundColor",
          "clearFormatting",
        ],
        buttonsVisible: 6,
      },
      moreParagraph: {
        buttons: [
          "alignLeft",
          "alignCenter",
          "alignRight",
          "alignJustify",
          "formatOL",
          "formatUL",
          "paragraphFormat",
          "paragraphStyle",
          "lineHeight",
          "outdent",
          "indent",
        ],
        buttonsVisible: 5,
      },
      moreRich: {
        buttons: [
          "insertLink",
          "insertImage",
          "insertVideo",
          "insertFile",
          "insertTable",
          "emoticons",
          "specialCharacters",
          "insertHR",
          "undo",
          "redo",
        ],
        buttonsVisible: 6,
      },
      moreMisc: {
        buttons: [
          "quote",
          "codeView",
          "fullscreen",
          "help",
          "selectAll",
          "print",
          "getPDF",
          "html",
          "save",
        ],
        buttonsVisible: 3,
      },
    },
    // Cấu hình Image Upload
    imageUpload: true,
    imageUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload`,
    imageUploadMethod: "POST",
    imageManagerLoadURL: `${BACKEND_API_BASE_URL}/admin/post/load-images`,
    imageManagerDeleteURL: `${BACKEND_API_BASE_URL}/admin/post/delete-image`,
    imageManagerDeleteMethod: "POST",
    imageAllowedTypes: ["jpeg", "jpg", "png", "gif"],
    imageMaxSize: 5 * 1024 * 1024,
    imageEditButtons: [
      "imageDisplay",
      "imageAlign",
      "imageSize",
      "imageRemove",
      "imageLink",
      "imageAlt",
    ],
    imageDefaultAlign: "center",
    imageDefaultDisplay: "block",

    // --- Cấu hình Video Upload (đã cập nhật) ---
    videoUpload: true,
    videoUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload`,
    videoUploadMethod: "POST",
    videoAllowedTypes: ["mp4", "webm", "ogg", "avi", "mov"],
    videoMaxSize: 50 * 1024 * 1024,
    videoEditButtons: [
      "videoDisplay",
      "videoAlign",
      "videoSize",
      "videoRemove",
      "videoLink",
    ],
    videoDefaultAlign: "center",
    videoDefaultDisplay: "block",
    // *** Quan trọng cho chèn video qua URL / Embed ***
    videoAllowedProviders: ["youtube", "vimeo", "dailymotion", "tiktok"], // Có thể thêm 'tiktok' nếu Froala hỗ trợ
    videoInsertButtons: [
      "videoBack",
      "|",
      "videoByURL",
      "videoEmbed",
      "videoUpload",
    ], // 'videoByURL' và 'videoEmbed' là quan trọng

    // Cấu hình File Upload
    fileUpload: true,
    fileUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload-file`, // Endpoint riêng cho file
    fileUploadMethod: "POST",
    fileAllowedTypes: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "zip",
      "rar",
      "txt",
      "csv",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-rar-compressed",
      "text/plain",
      "text/csv",
    ],
    fileMaxSize: 20 * 1024 * 1024, // 20MB

    // *** Cấu hình HTML allowed tags/attrs/empty tags để cho phép IFRAME ***
    htmlAllowedTags: [".*"],
    htmlAllowedAttrs: [".*"],
    htmlAllowedEmptyTags: ["video", "source", "iframe"], // *** Đảm bảo 'iframe' có ở đây ***

    requestHeaders: {
      Authorization: "Bearer " + authToken,
    },

    events: {
      "image.inserted": function ($img, response) {
        $img.css({
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
        });
        $img.removeClass("fr-fic fr-dib fr-fil fr-fir");
      },
      "image.replaced": function ($img, response) {
        $img.css({
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
        });
        $img.removeClass("fr-fic fr-dib fr-fil fr-fir");
      },
      // --- Cải thiện EVENT CHO VIDEO/IFRAME ---
      "video.inserted": function ($video, response) {
        try {
          // Xử lý response từ server (upload) hoặc kiểm tra thuộc tính hiện có (URL/Embed)
          let videoLink = null;
          if (typeof response === "string") {
            const serverResponse = JSON.parse(response);
            videoLink = serverResponse.link;
          } else if (response && response.link) {
            videoLink = response.link;
          } else if ($video.attr("src")) {
            // Video chèn từ URL có thể đã có src
            videoLink = $video.attr("src");
          } else if ($video.find("source").length) {
            // Hoặc có thẻ source
            videoLink = $video.find("source").attr("src");
          }

          if (videoLink) {
            // Đảm bảo là thẻ <video> và đặt thuộc tính
            if ($video[0].tagName === "VIDEO") {
              $video.attr("controls", "true");
              $video.css({
                display: "block",
                "margin-left": "auto",
                "margin-right": "auto",
                width: "100%",
                height: "auto",
              });
              $video.removeClass("fr-fic fr-dib fr-fil fr-fir");
              toast.success("Video đã được chèn thành công!");
            }
          } else if ($video[0].tagName === "IFRAME") {
            // *** Xử lý IFRAME khi chèn từ URL/Embed ***
            $video.css({
              display: "block",
              "margin-left": "auto",
              "margin-right": "auto",
              width: "100%",
              height: "auto", // Hoặc có thể đặt height cố định hoặc tỷ lệ responsive
              border: "none", // Loại bỏ border mặc định
            });
            toast.success("Video nhúng đã được chèn thành công!");
          } else {
            console.warn(
              "Không xác định được loại video được chèn:",
              $video,
              response
            );
            toast.error(
              "Có lỗi xảy ra: Không xác định được loại video được chèn."
            );
          }
        } catch (err) {
          console.error("Lỗi khi chèn video Froala:", err);
          toast.error("Có lỗi xảy ra khi chèn video. Vui lòng thử lại.");
        }
      },
      "video.replaced": function ($video, response) {
        // Áp dụng lại style khi video/iframe được thay thế
        $video.css({
          display: "block",
          "margin-left": "auto",
          "margin-right": "auto",
          width: "100%",
          height: "auto",
        });
        if ($video[0].tagName === "VIDEO") {
          $video.attr("controls", "true");
        } else if ($video[0].tagName === "IFRAME") {
          $video.css("border", "none");
        }
        $video.removeClass("fr-fic fr-dib fr-fil fr-fir");
      },
      "video.error": function (error, response) {
        console.error("Lỗi Froala Video:", error);
        toast.error(
          `Có lỗi khi tải lên/chèn video: ${
            error.message || "Không rõ lỗi"
          }. Vui lòng thử lại.`
        );
      },
      "file.inserted": function ($file, response) {
        try {
          const serverResponse =
            typeof response === "string" ? JSON.parse(response) : response;
          const fileLink = serverResponse.link;
          const fileName = serverResponse.name || "Tệp đính kèm";

          if (!fileLink) {
            toast.error(
              "Có lỗi xảy ra: Không nhận được liên kết tệp từ máy chủ."
            );
            return;
          }

          $file.html(`<i class="fas fa-file-alt"></i> ${fileName}`);
          $file.attr("href", fileLink);
          $file.attr("target", "_blank");
          $file.attr("download", fileName);

          toast.success(`Tệp "${fileName}" đã được chèn.`);
        } catch (err) {
          console.error("Lỗi khi chèn file:", err);
          toast.error("Có lỗi xảy ra khi chèn tệp. Vui lòng thử lại.");
        }
      },
      "file.error": function (error, response) {
        console.error("Lỗi Froala File:", error);
        toast.error(
          `Có lỗi khi tải lên/chèn tệp: ${
            error.message || "Không rõ lỗi"
          }. Vui lòng thử lại.`
        );
      },
    },
    heightMin: 400,
    heightMax: 800,
    charCounterCount: true,
    wordPasteKeepFormatting: false,
  };

  // Tải bài viết và danh mục khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postResponse, categoriesResponse] = await Promise.all([
          api.get(`/admin/post/${id}`),
          api.get("/admin/categoryPost"),
        ]);

        // SỬA LỖI 1: Lấy toàn bộ object bài viết, không chỉ riêng 'content'
        const post = postResponse.data.data;
        if (!post) {
          throw new Error(
            "Không tìm thấy dữ liệu bài viết trong phản hồi API."
          );
        }

        setPostData(post); // Lưu lại toàn bộ dữ liệu gốc
        setPostTitle(post.title || "");
        setPostDescription(post.description || "");

        // Chuyển đổi content từ Markdown sang HTML để hiển thị trong Froala
        let htmlContent = marked.parse(post.content || "");

        // Xử lý để đảm bảo media (ảnh, video, iframe) hiển thị đúng
        htmlContent = processMediaContentForDisplayOrSave(htmlContent);
        setPostContent(htmlContent);

        setSelectedCategoryId(post.category_id?.toString() || "");
        setImagePreviewUrl(post.image_thumbnail_url || null);

        // SỬA LỖI 2: Truy cập đúng vào mảng danh mục
        setCategories(categoriesResponse.data?.data?.data || []);
      } catch (error) {
        console.error(
          "Lỗi khi tải dữ liệu:",
          error.response?.data || error.message
        );
        const errorMessage =
          error.message || "Không thể tải dữ liệu bài viết hoặc danh mục.";
        setGlobalError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]); // Giữ nguyên dependency
  // Xử lý tạo danh mục mới
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setNewCategoryError("Tên danh mục không được để trống.");
      return;
    }
    setNewCategoryError("");
    setSubmitting(true);
    setGlobalError(null);

    try {
      const response = await api.post("/admin/categoryPost/new", {
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim()),
        description: newCategoryDescription.trim(),
      });
      const createdCategory = response.data.data || response.data;
      setCategories((prev) => [...prev, createdCategory]);
      setSelectedCategoryId(createdCategory.id.toString());
      setShowNewCategoryForm(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      toast.success("Danh mục đã được tạo thành công!");
    } catch (error) {
      console.error(
        "Lỗi khi tạo danh mục:",
        error.response?.data || error.message
      );
      if (error.response?.status === 422) {
        const backendErrors = error.response.data?.errors;
        if (backendErrors && backendErrors.name) {
          setNewCategoryError(backendErrors.name[0]);
        } else {
          setGlobalError("Lỗi xác thực dữ liệu.");
        }
      } else {
        setGlobalError("Không thể tạo danh mục.");
      }
      toast.error("Không thể tạo danh mục.");
    } finally {
      setSubmitting(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!postTitle.trim()) newErrors.title = "Tiêu đề không được để trống.";
    if (isContentEmpty(postContent))
      newErrors.content = "Nội dung không được để trống.";
    if (!selectedCategoryId && !showNewCategoryForm)
      newErrors.category = "Vui lòng chọn hoặc tạo danh mục.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý gửi form chỉnh sửa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại các trường bị lỗi.");
      return;
    }

    setSubmitting(true);
    setGlobalError(null);

    try {
      // Đảm bảo nội dung HTML được xử lý đúng trước khi chuyển sang Markdown
      const processedHtml = processMediaContentForDisplayOrSave(postContent);
      const markdownContent = turndownService.turndown(processedHtml);

      const formData = new FormData();
      formData.append("title", postTitle.trim());
      formData.append("slug", slugify(postTitle.trim()));
      formData.append("content", markdownContent);
      formData.append("descriptionPost", postDescription.trim() || "");
      formData.append("category_id", selectedCategoryId || "");
      formData.append("status", postData.status || 0);
      formData.append("author_id", 1); // Cần thay bằng ID tác giả thực tế
      if (postImageFile) formData.append("image_thumbnail", postImageFile);
      formData.append("_method", "POST"); // Froala editor doesn't support PATCH natively, use PUT with _method for Laravel

      const response = await api.post(`/admin/post/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Bài viết đã được cập nhật thành công!");
        navigate("/admin/post");
      }
    } catch (err) {
      console.error(
        "Lỗi khi cập nhật bài viết:",
        err.response?.data || err.message
      );
      setGlobalError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật bài viết, vui lòng thử lại."
      );
      if (err.response?.data?.errors) {
        setErrors((prev) => ({ ...prev, ...err.response.data.errors }));
      }
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài viết."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingDomain />;
  }

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Chỉnh Sửa Bài Viết
      </h2>

      {globalError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="postTitle"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Tiêu đề bài viết:
          </label>
          <input
            type="text"
            id="postTitle"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            placeholder="Nhập tiêu đề bài viết"
          />
          {errors.title && (
            <p className="text-red-500 text-xs italic mt-2">{errors.title}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="postDescription"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Mô tả bài viết:
          </label>
          <textarea
            id="postDescription"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-y"
            placeholder="Nhập mô tả bài viết"
          />
          {errors.descriptionPost && (
            <p className="text-red-500 text-xs italic mt-2">
              {errors.descriptionPost}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="postContent"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Nội dung bài viết:
          </label>
          <FroalaEditorComponent
            tag="textarea"
            config={froalaConfig}
            model={postContent}
            onModelChange={setPostContent}
          />
          {errors.content && (
            <p className="text-red-500 text-xs italic mt-2">{errors.content}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="imageFile"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Ảnh Thumbnail:
          </label>
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setPostImageFile(file);
                setImagePreviewUrl(URL.createObjectURL(file));
              }
            }}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {postImageFile && (
            <p className="text-gray-600 text-xs italic mt-2">
              Đã chọn file: {postImageFile.name}
            </p>
          )}
          {imagePreviewUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Xem trước ảnh:</p>
              <img
                src={imagePreviewUrl}
                alt="Ảnh xem trước"
                className="w-48 h-auto rounded-lg border border-gray-300 shadow-sm"
              />
            </div>
          )}
          {errors.image && (
            <p className="text-red-500 text-xs italic mt-2">{errors.image}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="categorySelect"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Danh mục:
          </label>
          {!showNewCategoryForm && (
            <select
              id="categorySelect"
              value={selectedCategoryId}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setShowNewCategoryForm(true);
                  setSelectedCategoryId("");
                } else {
                  setSelectedCategoryId(e.target.value);
                  setErrors((prev) => ({ ...prev, category: "" }));
                }
              }}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value="new">-- Thêm danh mục mới --</option>
            </select>
          )}
          {errors.category && (
            <p className="text-red-500 text-xs italic mt-2">
              {errors.category}
            </p>
          )}
        </div>
        {showNewCategoryForm && (
          <div className="border border-dashed border-gray-400 p-6 rounded-lg bg-blue-50">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Tạo Danh Mục Mới
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="newCategoryName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Tên danh mục:
                </label>
                <input
                  type="text"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Nhập tên danh mục mới"
                />
                {newCategoryError && (
                  <p className="text-red-500 text-xs italic mt-2">
                    {newCategoryError}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="newCategoryDescription"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Mô tả:
                </label>
                <textarea
                  id="newCategoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-24 resize-y"
                  placeholder="Mô tả ngắn về danh mục"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                >
                  Tạo Danh Mục
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm(false);
                    setNewCategoryName("");
                    setNewCategoryDescription("");
                    setNewCategoryError("");
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`
                            ${
                              submitting
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }
                            text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 text-lg
                        `}
          >
            {submitting ? "Đang cập nhật..." : "Cập Nhật Bài Viết"}
          </button>
        </div>
      </form>
    </div>
  );
}
