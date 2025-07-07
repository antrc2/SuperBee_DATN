// src/pages/EditPostPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams to get the post ID
import api from '../../../utils/http';

// --- IMPORT CSS CỦA FROALA EDITOR ---
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';
// --- THÊM CÁC THEME NẾU CÓ (VÍ DỤ: CÓ THỂ CÓ 'material', 'dark',...) ---
// import 'froala-editor/css/themes/gray.min.css'; // Ví dụ một theme khác

// --- IMPORT COMPONENT CHÍNH CỦA FROALA ---
import FroalaEditorComponent from 'react-froala-wysiwyg';

// --- IMPORT TẤT CẢ CÁC PLUGIN CẦN THIẾT CHO GIAO DIỆN NHƯ WORD ---
// Các plugin cơ bản
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/char_counter.min.js';
import 'froala-editor/js/plugins/code_view.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import 'froala-editor/js/plugins/emoticons.min.js';
import 'froala-editor/js/plugins/entities.min.js';
import 'froala-editor/js/plugins/fullscreen.min.js';
import 'froala-editor/js/plugins/help.min.js';
import 'froala-editor/js/plugins/image.min.js'; // Quan trọng cho chèn ảnh
import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/lists.min.js';
import 'froala-editor/js/plugins/paragraph_format.min.js';
import 'froala-editor/js/plugins/paragraph_style.min.js';
import 'froala-editor/js/plugins/quick_insert.min.js';
import 'froala-editor/js/plugins/quote.min.js';
import 'froala-editor/js/plugins/table.min.js';
import 'froala-editor/js/plugins/url.min.js';
import 'froala-editor/js/plugins/video.min.js'; // Quan trọng cho chèn video

// Các plugin nâng cao (tùy chọn)
import 'froala-editor/js/plugins/line_breaker.min.js';
import 'froala-editor/js/plugins/word_paste.min.js';
import 'froala-editor/js/plugins/save.min.js'; // Nếu muốn có nút save riêng trên toolbar

// Hàm chuyển đổi chuỗi thành slug
const slugify = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// Hàm kiểm tra nội dung Froala có rỗng không (loại bỏ thẻ HTML)
const isContentEmpty = (htmlContent) => {
    // Loại bỏ tất cả các thẻ HTML và khoảng trắng, sau đó kiểm tra độ dài
    return htmlContent === null || htmlContent.trim() === '' || htmlContent.replace(/<[^>]*>/g, '').trim() === '';
};

export default function EditPostPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the post ID from the URL

    // State cho danh mục
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [newCategoryError, setNewCategoryError] = useState('');

    // State cho bài viết
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState(''); // Đây là state sẽ được Froala Editor cập nhật
    const [postImageFile, setPostImageFile] = useState(null); // Để upload file ảnh thumbnail (ảnh đại diện)
    const [currentImageThumbnail, setCurrentImageThumbnail] = useState(''); // To display existing image

    // State chung
    const [loading, setLoading] = useState(true); // For both post and categories
    const [submittingPost, setSubmittingPost] = useState(false); // Dùng cho cả post và category
    const [errors, setErrors] = useState({}); // Lỗi cho form bài viết
    const [globalError, setGlobalError] = useState(null); // Lỗi tổng thể từ API

    const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const authToken = sessionStorage.getItem("access_token");

    // Cấu hình Froala Editor
    const froalaConfig = {
        placeholderText: 'Nhập nội dung bài viết...',
        toolbarButtons: {
            moreText: {
                buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'clearFormatting'],
                buttonsVisible: 6
            },
            moreParagraph: {
                buttons: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent'],
                buttonsVisible: 5
            },
            moreRich: {
                buttons: ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'specialCharacters', 'insertHR', 'undo', 'redo'],
                buttonsVisible: 5
            },
            moreMisc: {
                buttons: ['quote', 'codeView', 'fullscreen', 'help', 'selectAll', 'print', 'getPDF', 'html', 'save'],
                buttonsVisible: 3
            }
        },
        imageUpload: true,
        imageUploadURL: `${BACKEND_API_BASE_URL}/admin/post/upload`,
        requestHeaders: {
            Authorization: 'Bearer ' + authToken
        },
        imageUploadMethod: 'POST',
        imageManagerLoadURL: `${BACKEND_API_BASE_URL}/admin/post/load-images`,
        imageManagerDeleteURL: `${BACKEND_API_BASE_URL}/admin/post/delete-image`,
        imageManagerDeleteMethod: 'POST',
        imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif'],
        imageMaxSize: 5 * 1024 * 1024, // 5MB

        heightMin: 400,
        heightMax: 800,
        charCounterCount: true,
        wordPasteKeepFormatting: false,
    };

    // Tải danh mục và dữ liệu bài viết khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch categories
                const postResponse = await api.get(`/admin/post/${id}`);
                const categoriesResponse = await api.get("/admin/categoryPost");
                setCategories(categoriesResponse.data?.data);

                // Fetch post data
                const postData = postResponse.data?.data;
                setPostTitle(postData.title || '');
                setPostContent(postData.content || '');
                setSelectedCategoryId(postData.category_id ? postData.category_id.toString() : '');
                setCurrentImageThumbnail(postData.image_thumbnail ? `${BACKEND_API_BASE_URL}/${postData.image_thumbnail}` : ''); // Assuming image_thumbnail is a path

            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error.response?.data || error.message);
                setGlobalError('Không thể tải dữ liệu bài viết hoặc danh mục. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]); // Re-run when ID changes

    // Xử lý tạo danh mục mới thông qua API Laravel
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        // console.log('--- handleCreateCategory được gọi ---');

        if (!newCategoryName.trim()) {
            setNewCategoryError('Tên danh mục không được để trống.');
            return;
        }
        setNewCategoryError(''); // Reset lỗi trước khi submit
        setSubmittingPost(true);
        setGlobalError(null);

        try {
            console.log('Chuẩn bị gọi API tạo danh mục với dữ liệu:', {
                name: newCategoryName.trim(),
                slug: slugify(newCategoryName.trim()),
                description: newCategoryDescription.trim(),
            });

            const response = await api.post("/admin/categoryPost/new", {
                name: newCategoryName.trim(),
                slug: slugify(newCategoryName.trim()),
                description: newCategoryDescription.trim(),
            });

            console.log('API tạo danh mục thành công, phản hồi:', response.data);

            const createdCategory = response.data.data || response.data; // Lấy đối tượng category
            setCategories((prevCategories) => [...prevCategories, createdCategory]);
            setSelectedCategoryId(createdCategory.id.toString()); // Tự động chọn danh mục vừa tạo
            setShowNewCategoryForm(false); // Ẩn form tạo danh mục mới
            setNewCategoryName(''); // Reset input
            setNewCategoryDescription(''); // Reset input
            alert('Danh mục đã được tạo thành công!');
        } catch (error) {
            console.error('Lỗi khi tạo danh mục:', error.response?.data || error.message);

            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data?.errors;
                if (backendErrors && backendErrors.name) {
                    setNewCategoryError(backendErrors.name[0]);
                } else {
                    setGlobalError('Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại thông tin.');
                }
            } else {
                setGlobalError(
                    error.response?.data?.message || 'Không thể tạo danh mục. Vui lòng thử lại.'
                );
            }
        } finally {
            setSubmittingPost(false);
            console.log('--- Kết thúc handleCreateCategory ---');
        }
    };

    // Validate form bài viết
    const validatePostForm = () => {
        const newErrors = {};
        if (!postTitle.trim()) {
            newErrors.title = 'Tiêu đề bài viết không được để trống.';
        }
        // Kiểm tra nội dung Froala Editor bằng hàm isContentEmpty
        if (isContentEmpty(postContent)) {
            newErrors.content = 'Nội dung bài viết không được để trống.';
        }
        if (!selectedCategoryId && !showNewCategoryForm) {
            newErrors.category = 'Vui lòng chọn hoặc tạo một danh mục.';
        }
        // For editing, image is optional if one already exists
        if (!postImageFile && !currentImageThumbnail) {
            newErrors.image = 'Vui lòng tải ảnh thumbnail lên hoặc giữ lại ảnh hiện có.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý gửi form bài viết chính (cập nhật)
    const handleUpdatePost = async (e) => {
        e.preventDefault();

        if (!validatePostForm()) {
            return;
        }

        setSubmittingPost(true);
        setGlobalError(null);

        try {
            const formData = new FormData();
            formData.append('title', postTitle.trim());
            formData.append('slug', slugify(postTitle.trim()));
            formData.append('content', postContent);
            formData.append('category_id', selectedCategoryId || '');
            formData.append('author_id', 1); // Giả sử ID tác giả là 1
            formData.append('status', 0); // Mặc định là draft

            // If a new image file is selected, append it. Otherwise, the backend should retain the old one.
            if (postImageFile) {
                formData.append('image_thumbnail', postImageFile);
            }

            // Important: For PUT/PATCH with FormData in Laravel, you often need to spoof the method
            formData.append('_method', 'post');

            const response = await api.post(`/admin/post/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) { // Laravel typically returns 200 for successful updates
                alert('Bài viết đã được cập nhật thành công!');
                navigate("/admin/post"); // Chuyển hướng đến trang quản lý bài viết
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật bài viết:", err.response?.data || err.message);
            setGlobalError(
                err.response?.data?.message || "Có lỗi xảy ra khi cập nhật bài viết, vui lòng thử lại."
            );
            if (err.response?.data?.errors) {
                const backendErrors = {};
                for (const key in err.response.data.errors) {
                    backendErrors[key] = err.response.data.errors[key][0];
                }
                setErrors((prev) => ({ ...prev, ...backendErrors }));
            }
        } finally {
            setSubmittingPost(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-600">
                Đang tải dữ liệu bài viết...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Chỉnh Sửa Bài Viết</h2>

            {globalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Lỗi: </strong>
                    <span className="block sm:inline">{globalError}</span>
                </div>
            )}

            <form onSubmit={handleUpdatePost} className="space-y-6">
                {/* Tiêu đề bài viết */}
                <div>
                    <label htmlFor="postTitle" className="block text-gray-700 text-sm font-bold mb-2">
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
                    {errors.title && <p className="text-red-500 text-xs italic mt-2">{errors.title}</p>}
                </div>

                {/* Nội dung bài viết với Froala Editor */}
                <div>
                    <label htmlFor="postContent" className="block text-gray-700 text-sm font-bold mb-2">
                        Nội dung bài viết:
                    </label>
                    <FroalaEditorComponent
                        tag='textarea'
                        config={froalaConfig}
                        model={postContent}
                        onModelChange={setPostContent}
                    />
                    {errors.content && <p className="text-red-500 text-xs italic mt-2">{errors.content}</p>}
                </div>

                {/* Upload ảnh thumbnail */}
                <div>
                    <label htmlFor="imageFile" className="block text-gray-700 text-sm font-bold mb-2">
                        Ảnh Thumbnail:
                    </label>
                    {currentImageThumbnail && !postImageFile && (
                        <div className="mb-4">
                            <p className="text-gray-600 text-sm mb-2">Ảnh hiện tại:</p>
                            <img src={currentImageThumbnail} alt="Current Thumbnail" className="max-w-xs h-auto rounded-lg shadow-md" />
                            <button
                                type="button"
                                onClick={() => setCurrentImageThumbnail('')} // Allow removing existing image
                                className="mt-2 text-red-500 hover:text-red-700 text-sm font-semibold"
                            >
                                Xóa ảnh hiện tại
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={(e) => setPostImageFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-700
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                    {postImageFile && (
                        <p className="text-gray-600 text-xs italic mt-2">Đã chọn file mới: {postImageFile.name}</p>
                    )}
                    {errors.image && <p className="text-red-500 text-xs italic mt-2">{errors.image}</p>}
                </div>

                {/* Chọn danh mục */}
                <div>
                    <label htmlFor="categorySelect" className="block text-gray-700 text-sm font-bold mb-2">
                        Danh mục:
                    </label>
                    {!showNewCategoryForm && (
                        <select
                            id="categorySelect"
                            value={selectedCategoryId}
                            onChange={(e) => {
                                if (e.target.value === 'new') {
                                    setShowNewCategoryForm(true);
                                    setSelectedCategoryId('');
                                } else {
                                    setSelectedCategoryId(e.target.value);
                                    setErrors((prev) => ({ ...prev, category: '' }));
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
                    {errors.category && <p className="text-red-500 text-xs italic mt-2">{errors.category}</p>}
                </div>

                {/* Form tạo danh mục mới (hiển thị có điều kiện) */}
                {showNewCategoryForm && (
                    <div className="border border-dashed border-gray-400 p-6 rounded-lg bg-blue-50">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Tạo Danh Mục Mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newCategoryName" className="block text-gray-700 text-sm font-bold mb-2">
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
                                {newCategoryError && <p className="text-red-500 text-xs italic mt-2">{newCategoryError}</p>}
                            </div>
                            <div>
                                <label htmlFor="newCategoryDescription" className="block text-gray-700 text-sm font-bold mb-2">
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                                >
                                    Tạo Danh Mục
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewCategoryForm(false);
                                        setNewCategoryName('');
                                        setNewCategoryDescription('');
                                        setNewCategoryError('');
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nút gửi bài viết */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={submittingPost}
                        className={`
                            ${submittingPost ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                            text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 text-lg
                        `}
                    >
                        {submittingPost ? 'Đang cập nhật bài viết...' : 'Cập Nhật Bài Viết'}
                    </button>
                </div>
            </form>
        </div>
    );
}