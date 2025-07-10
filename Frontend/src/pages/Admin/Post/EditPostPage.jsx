
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/http';
import TurndownService from 'turndown';
import { marked } from 'marked';

// --- IMPORT CSS CỦA FROALA EDITOR ---
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';

// --- IMPORT COMPONENT CHÍNH CỦA FROALA ---
import FroalaEditorComponent from 'react-froala-wysiwyg';

// --- IMPORT TẤT CẢ CÁC PLUGIN CẦN THIẾT CHO GIAO DIỆN NHƯ WORD ---
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/char_counter.min.js';
import 'froala-editor/js/plugins/code_view.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import 'froala-editor/js/plugins/emoticons.min.js';
import 'froala-editor/js/plugins/entities.min.js';
import 'froala-editor/js/plugins/fullscreen.min.js';
import 'froala-editor/js/plugins/help.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/lists.min.js';
import 'froala-editor/js/plugins/paragraph_format.min.js';
import 'froala-editor/js/plugins/paragraph_style.min.js';
import 'froala-editor/js/plugins/quick_insert.min.js';
import 'froala-editor/js/plugins/quote.min.js';
import 'froala-editor/js/plugins/table.min.js';
import 'froala-editor/js/plugins/url.min.js';
import 'froala-editor/js/plugins/video.min.js';
import 'froala-editor/js/plugins/line_breaker.min.js';
import 'froala-editor/js/plugins/word_paste.min.js';
import 'froala-editor/js/plugins/save.min.js';

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

// Hàm kiểm tra nội dung Froala có rỗng không
const isContentEmpty = (htmlContent) => {
    return htmlContent === null || htmlContent.trim() === '' || htmlContent.replace(/<[^>]*>/g, '').trim() === '';
};

// Hàm xử lý nội dung HTML để đảm bảo ảnh căn giữa
const processImageContent = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent || '<div></div>', 'text/html');
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
        img.style.display = 'block';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        img.classList.remove('fr-fic', 'fr-dib', 'fr-fil', 'fr-fir');
    });
    return doc.body.innerHTML;
};

// Khởi tạo TurndownService
const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '*',
    codeBlockStyle: 'fenced',
});

export default function EditPostPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [postData, setPostData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [newCategoryError, setNewCategoryError] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [postDescription, setPostDescription] = useState('');
    const [postContent, setPostContent] = useState('');
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
        imageMaxSize: 5 * 1024 * 1024,
        imageEditButtons: [
            'imageDisplay',
            'imageAlign',
            'imageSize',
            'imageRemove',
            'imageLink',
            'imageAlt',
        ],
        imageDefaultAlign: 'center',
        imageDefaultDisplay: 'block',
        events: {
            'image.inserted': function ($img, response) {
                $img.css({
                    display: 'block',
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                });
                $img.removeClass('fr-fic fr-dib fr-fil fr-fir');
            },
            'image.replaced': function ($img, response) {
                $img.css({
                    display: 'block',
                    'margin-left': 'auto',
                    'margin-right': 'auto',
                });
                $img.removeClass('fr-fic fr-dib fr-fil fr-fir');
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
                    api.get("/admin/categoryPost")
                ]);
                const post = postResponse.data.data;
                setPostData(post);
                setPostTitle(post.title || '');
                setPostDescription(post.description || '');
                const htmlContent = marked.parse(post.content || '');
                setPostContent(htmlContent);
                setSelectedCategoryId(post.category_id?.toString() || '');
                setImagePreviewUrl(post.image_thumbnail_url || null);
                setCategories(categoriesResponse.data?.data || []);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error.response?.data || error.message);
                setGlobalError('Không thể tải dữ liệu bài viết hoặc danh mục.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Xử lý tạo danh mục mới
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setNewCategoryError('Tên danh mục không được để trống.');
            return;
        }
        setNewCategoryError('');
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
            setNewCategoryName('');
            setNewCategoryDescription('');
            alert('Danh mục đã được tạo thành công!');
        } catch (error) {
            console.error('Lỗi khi tạo danh mục:', error.response?.data || error.message);
            if (error.response?.status === 422) {
                const backendErrors = error.response.data?.errors;
                if (backendErrors && backendErrors.name) {
                    setNewCategoryError(backendErrors.name[0]);
                } else {
                    setGlobalError('Lỗi xác thực dữ liệu.');
                }
            } else {
                setGlobalError('Không thể tạo danh mục.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!postTitle.trim()) newErrors.title = 'Tiêu đề không được để trống.';
        if (isContentEmpty(postContent)) newErrors.content = 'Nội dung không được để trống.';
        if (!selectedCategoryId && !showNewCategoryForm) newErrors.category = 'Vui lòng chọn hoặc tạo danh mục.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý gửi form chỉnh sửa
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        setGlobalError(null);

        try {
            const processedHtml = processImageContent(postContent);
            const markdownContent = turndownService.turndown(processedHtml);

            const formData = new FormData();
            formData.append('title', postTitle.trim());
            formData.append('slug', slugify(postTitle.trim()));
            formData.append('content', markdownContent);
            formData.append('descriptionPost', postDescription.trim() || '');
            formData.append('category_id', selectedCategoryId || '');
            formData.append('status', postData.status || 0);
            formData.append('author_id', 1);
            if (postImageFile) formData.append('image_thumbnail', postImageFile);

            const response = await api.post(`/admin/post/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                alert('Bài viết đã được cập nhật thành công!');
                navigate("/admin/post");
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật bài viết:", err.response?.data || err.message);
            setGlobalError(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật.");
            if (err.response?.data?.errors) {
                setErrors((prev) => ({ ...prev, ...err.response.data.errors }));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-lg text-gray-600">Đang tải...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Chỉnh Sửa Bài Viết</h2>

            {globalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Lỗi: </strong>
                    <span className="block sm:inline">{globalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div>
                    <label htmlFor="postDescription" className="block text-gray-700 text-sm font-bold mb-2">
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
                    {errors.descriptionPost && <p className="text-red-500 text-xs italic mt-2">{errors.descriptionPost}</p>}
                </div>
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
                <div>
                    <label htmlFor="imageFile" className="block text-gray-700 text-sm font-bold mb-2">
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
                        <p className="text-gray-600 text-xs italic mt-2">Đã chọn file: {postImageFile.name}</p>
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
                    {errors.image && <p className="text-red-500 text-xs italic mt-2">{errors.image}</p>}
                </div>
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
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`
                            ${submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                            text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 text-lg
                        `}
                    >
                        {submitting ? 'Đang cập nhật...' : 'Cập Nhật Bài Viết'}
                    </button>
                </div>
            </form>
        </div>
    );
}
