import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/http";
import TurndownService from "turndown";
import $ from "jquery";
import { ArrowLeft } from "lucide-react";
// --- IMPORT CSS CỦA FROALA EDITOR ---
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
// *** MỚI: IMPORT THEME DARK CỦA FROALA ***
import "froala-editor/css/themes/dark.min.css";

// --- IMPORT COMPONENT CHÍNH CỦA FROALA ---
import FroalaEditorComponent from "react-froala-wysiwyg";
import LoadingDomain from "../../../components/Loading/LoadingDomain";
// --- IMPORT CÁC PLUGIN CẦN THIẾT ---
// (Các import plugin của bạn được giữ nguyên)
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
import "froala-editor/js/plugins/file.min.js";

import { useNotification } from "../../../contexts/NotificationContext";

// Các hàm tiện ích (slugify, isContentEmpty, processMediaContentForDisplayOrSave) được giữ nguyên

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

const isContentEmpty = (htmlContent) => {
  return (
    htmlContent === null ||
    htmlContent.trim() === "" ||
    htmlContent.replace(/<[^>]*>/g, "").trim() === ""
  );
};
const processMediaContentForDisplayOrSave = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent || "<div></div>", "text/html");
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    img.style.display = "block";
    img.style.marginLeft = "auto";
    img.style.marginRight = "auto";
    img.classList.remove("fr-fic", "fr-dib", "fr-fil", "fr-fir");
  });
  const videos = doc.querySelectorAll("video, iframe");
  videos.forEach((media) => {
    if (media.tagName === "VIDEO" && !media.getAttribute("controls")) {
      media.setAttribute("controls", "");
    }
    media.style.display = "block";
    media.style.marginLeft = "auto";
    media.style.marginRight = "auto";
    media.style.width = "100%";
    if (media.tagName === "IFRAME") {
      media.style.height = "auto";
    }
  });

  return doc.body.innerHTML;
};

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { pop } = useNotification();

  // Các state và logic (turndownService, categories, post...) được giữ nguyên
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
        const width = node.getAttribute("width") || "560"; // Giữ lại kích thước nếu có
        const height = node.getAttribute("height") || "315";
        // Trả về thẻ iframe nguyên bản hoặc một biểu diễn Markdown đơn giản
        // Lưu ý: Markdown không hỗ trợ iframe trực tiếp, nên chúng ta sẽ giữ lại HTML
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
  }, []);

  // State cho danh mục
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  // State cho bài viết
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageFile, setPostImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // State chung
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const authToken = sessionStorage.getItem("access_token");

  // *** TỐI ƯU: Lấy trạng thái dark mode từ class trên thẻ <html> ***
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // Kiểm tra ban đầu
    checkDarkMode();

    // Theo dõi sự thay đổi của class trên <html>
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const froalaConfig = useMemo(
    () => ({
      // *** DARK MODE: Kích hoạt theme tối của Froala ***
      theme: isDarkMode ? "dark" : "gray", // 'dark' là theme có sẵn

      placeholderText: "Nhập nội dung bài viết...",
      // Các cấu hình toolbarButtons, imageUpload, videoUpload... giữ nguyên
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
      imageUpload: true,
      imageUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload`,
      requestHeaders: {
        Authorization: "Bearer " + authToken,
      },
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

      // --- CẤU HÌNH VIDEO ---
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

      // --- Cấu hình File Upload ---
      fileUpload: true,
      fileUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload`,
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
      fileMaxSize: 20 * 1024 * 1024,

      // *** Cấu hình HTML allowed tags/attrs/empty tags để cho phép IFRAME ***
      htmlAllowedTags: [".*"],
      htmlAllowedAttrs: [".*"],
      htmlAllowedEmptyTags: ["video", "source", "iframe"], // *** Đảm bảo 'iframe' có ở đây ***
      events: {
        // Các events (image.inserted, video.inserted...) giữ nguyên
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
        "video.inserted": function ($video, response) {
          try {
            let videoLink = null;
            if (typeof response === "string") {
              const serverResponse = JSON.parse(response);
              videoLink = serverResponse.link;
            } else if (response && response.link) {
              videoLink = response.link;
            } else if ($video.attr("src")) {
              videoLink = $video.attr("src");
            } else if ($video.find("source").length) {
              videoLink = $video.find("source").attr("src");
            }

            if (videoLink) {
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
                pop("Video đã được chèn thành công!", "s");
              }
            } else if ($video[0].tagName === "IFRAME") {
              $video.css({
                display: "block",
                "margin-left": "auto",
                "margin-right": "auto",
                width: "100%",
                height: "auto",
                border: "none",
              });
              pop("Video nhúng đã được chèn thành công!", "s");
            } else {
              console.warn(
                "Không xác định được loại video được chèn:",
                $video,
                response
              );
              pop(
                "Có lỗi xảy ra: Không xác định được loại video được chèn.",
                "e"
              );
            }
          } catch (err) {
            console.error("Lỗi khi chèn video Froala:", err);
            pop("Có lỗi xảy ra khi chèn video. Vui lòng thử lại.", "e");
          }
        },
        "video.replaced": function ($video, response) {
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
          pop(
            `Có lỗi khi tải lên/chèn video: ${
              error.message || "Không rõ lỗi"
            }. Vui lòng thử lại.`,
            "e"
          );
        },
        "file.inserted": function ($file, response) {
          try {
            const serverResponse =
              typeof response === "string" ? JSON.parse(response) : response;
            const fileLink = serverResponse.link;
            const fileName = serverResponse.name || "Tệp đính kèm";

            if (!fileLink) {
              pop(
                "Có lỗi xảy ra: Không nhận được liên kết tệp từ máy chủ.",
                "e"
              );
              return;
            }

            $file.html(`<i class="fas fa-file-alt"></i> ${fileName}`);
            $file.attr("href", fileLink);
            $file.attr("target", "_blank");
            $file.attr("download", fileName);

            pop(`Tệp "${fileName}" đã được chèn.`, "s");
          } catch (err) {
            console.error("Lỗi khi chèn file:", err);
            pop("Có lỗi xảy ra khi chèn tệp. Vui lòng thử lại.", "e");
          }
        },
        "file.error": function (error, response) {
          console.error("Lỗi Froala File:", error);
          pop(
            `Có lỗi khi tải lên/chèn tệp: ${
              error.message || "Không rõ lỗi"
            }. Vui lòng thử lại.`,
            "e"
          );
        },
      },
      heightMin: 400,
      heightMax: 800,
      charCounterCount: true,
      wordPasteKeepFormatting: false,
    }),
    [isDarkMode, BACKEND_API_BASE_URL, authToken, pop]
  );

  // Các hàm logic (useEffect tải categories, handleCreateCategory, validatePostForm, handleSubmitPost) giữ nguyên
  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get("/admin/categoryPost");
        setCategories(response.data?.data?.data || []);
      } catch (error) {
        console.error(
          "Lỗi khi lấy danh mục:",
          error.response?.data || error.message
        );
        setGlobalError("Không thể tải danh mục. Vui lòng thử lại.");
        pop("Không thể tải danh mục. Vui lòng thử lại.", "e");
      } finally {
        setLoadingCategories(false);
      }
    };
    getCategories();
  }, [pop]);
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setNewCategoryError("Tên danh mục không được để trống.");
      return;
    }
    setNewCategoryError("");
    setSubmittingPost(true);
    setGlobalError(null);

    try {
      const response = await api.post("/admin/categoryPost/new", {
        name: newCategoryName.trim(),
        slug: slugify(newCategoryName.trim()),
        description: newCategoryDescription.trim(),
      });
      const createdCategory = response.data.data || response.data;
      setCategories((prevCategories) => [...prevCategories, createdCategory]);
      setSelectedCategoryId(createdCategory.id.toString());
      setShowNewCategoryForm(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      pop("Danh mục đã được tạo thành công!", "s");
    } catch (error) {
      console.error(
        "Lỗi khi tạo danh mục:",
        error.response?.data || error.message
      );
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data?.errors;
        if (backendErrors && backendErrors.name) {
          setNewCategoryError(backendErrors.name[0]);
        } else {
          setGlobalError(
            "Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại thông tin."
          );
        }
      } else {
        setGlobalError(
          error.response?.data?.message ||
            "Không thể tạo danh mục. Vui lòng thử lại."
        );
      }
      pop("Không thể tạo danh mục.", "e");
    } finally {
      setSubmittingPost(false);
    }
  };
  const validatePostForm = () => {
    const newErrors = {};
    if (!postTitle.trim()) {
      newErrors.title = "Tiêu đề bài viết không được để trống.";
    }
    if (isContentEmpty(postContent)) {
      newErrors.content = "Nội dung bài viết không được để trống.";
    }
    if (!selectedCategoryId && !showNewCategoryForm) {
      newErrors.category = "Vui lòng chọn hoặc tạo một danh mục.";
    }
    if (!postImageFile) {
      newErrors.image = "Vui lòng tải ảnh thumbnail lên.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmitPost = async (e) => {
    e.preventDefault();

    if (!validatePostForm()) {
      pop("Vui lòng kiểm tra lại các trường bị lỗi.", "e");
      return;
    }

    setSubmittingPost(true);
    setGlobalError(null);

    try {
      const processedHtml = processMediaContentForDisplayOrSave(postContent);
      const markdownContent = turndownService.turndown(processedHtml);

      const formData = new FormData();
      formData.append("title", postTitle.trim());
      formData.append("slug", slugify(postTitle.trim()));
      formData.append("content", markdownContent);
      formData.append("descriptionPost", postDescription.trim() || "");
      formData.append("category_id", selectedCategoryId || "");
      formData.append("author_id", 1);
      formData.append("status", 0);
      if (postImageFile) {
        formData.append("image_thumbnail", postImageFile);
      }

      const response = await api.post("/admin/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        pop("Bài viết đã được tạo thành công!", "s");
        navigate("/admin/post");
      }
    } catch (err) {
      console.error("Lỗi khi tạo bài viết:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.message ||
        "Có lỗi xảy ra khi tạo bài viết, vui lòng thử lại.";
      setGlobalError(errorMessage);
      if (err.response?.data?.errors) {
        const backendErrors = {};
        for (const key in err.response.data.errors) {
          backendErrors[key] = err.response.data.errors[key][0];
        }
        setErrors((prev) => ({ ...prev, ...backendErrors }));
      }
      pop(errorMessage, "e");
    } finally {
      setSubmittingPost(false);
    }
  };

  if (loadingCategories) {
    return <LoadingDomain />;
  }

  // Tối ưu class cho các input để tái sử dụng
  const inputClassName =
    "w-full px-3 py-2 leading-tight text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors";
  const labelClassName =
    "block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300";

  return (
    // DARK MODE: Thêm màu nền và chữ cho chế độ tối
    // RESPONSIVE: Điều chỉnh padding cho các màn hình khác nhau
    <div className="max-w-5xl mx-auto my-8 p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-colors">
      <button
        type="button" // Quan trọng: để không submit form
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
      >
        <ArrowLeft size={18} />
        Quay Lại
      </button>
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
        Tạo Bài Viết Mới
      </h2>
      {globalError && (
        // DARK MODE: Cập nhật màu cho alert
        <div
          className="bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-500/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{globalError}</span>
        </div>
      )}
      <form onSubmit={handleSubmitPost} className="space-y-8">
        {/* Tiêu đề */}
        <div>
          <label htmlFor="postTitle" className={labelClassName}>
            Tiêu đề bài viết
          </label>
          <input
            type="text"
            id="postTitle"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className={inputClassName}
            placeholder="Nhập tiêu đề bài viết"
          />
          {errors.title && (
            <p className="text-red-500 text-xs italic mt-2">{errors.title}</p>
          )}
        </div>

        {/* Mô tả */}
        <div>
          <label htmlFor="postDescription" className={labelClassName}>
            Mô tả ngắn
          </label>
          <textarea
            id="postDescription"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            rows={3}
            className={`${inputClassName} resize-y`}
            placeholder="Mô tả ngắn gọn, hấp dẫn về bài viết"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label htmlFor="postContent" className={labelClassName}>
            Nội dung bài viết
          </label>
          <div className="froala-container rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
            <FroalaEditorComponent
              tag="textarea"
              config={froalaConfig}
              model={postContent}
              onModelChange={setPostContent}
            />
          </div>
          {errors.content && (
            <p className="text-red-500 text-xs italic mt-2">{errors.content}</p>
          )}
        </div>

        {/* Ảnh Thumbnail */}
        <div>
          <label htmlFor="imageFile" className={labelClassName}>
            Ảnh Thumbnail
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
            className="block w-full text-sm text-gray-700 dark:text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300
              hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 transition-colors"
          />
          {imagePreviewUrl && (
            <div className="mt-4">
              <img
                src={imagePreviewUrl}
                alt="Ảnh xem trước"
                className="w-48 h-auto rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
              />
            </div>
          )}
          {errors.image && (
            <p className="text-red-500 text-xs italic mt-2">{errors.image}</p>
          )}
        </div>

        {/* Danh mục */}
        <div>
          <label htmlFor="categorySelect" className={labelClassName}>
            Danh mục
          </label>
          {!showNewCategoryForm ? (
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
              className={`${inputClassName} cursor-pointer`}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="dark:bg-gray-800"
                >
                  {category.name}
                </option>
              ))}
              <option
                value="new"
                className="font-bold text-indigo-600 dark:text-indigo-400"
              >
                -- Thêm danh mục mới --
              </option>
            </select>
          ) : (
            // Form tạo danh mục mới
            <div className="border border-dashed border-gray-400 dark:border-gray-600 p-4 sm:p-6 rounded-lg bg-indigo-50 dark:bg-gray-700/50 mt-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Tạo Danh Mục Mới
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newCategoryName" className={labelClassName}>
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={inputClassName}
                    placeholder="VD: Tin công nghệ"
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
                    className={labelClassName}
                  >
                    Mô tả
                  </label>
                  <textarea
                    id="newCategoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className={`${inputClassName} h-24 resize-y`}
                    placeholder="Mô tả ngắn về danh mục"
                  ></textarea>
                </div>
                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryForm(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={submittingPost}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    {submittingPost ? "Đang tạo..." : "Tạo Danh Mục"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {errors.category && !showNewCategoryForm && (
            <p className="text-red-500 text-xs italic mt-2">
              {errors.category}
            </p>
          )}
        </div>

        {/* Nút Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={submittingPost}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg
                       hover:bg-green-700
                       focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50
                       disabled:bg-green-400 dark:disabled:bg-green-800 disabled:cursor-not-allowed
                       transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
          >
            {submittingPost ? "Đang tạo bài viết..." : "Tạo Bài Viết"}
          </button>
        </div>
      </form>
    </div>
  );
}
