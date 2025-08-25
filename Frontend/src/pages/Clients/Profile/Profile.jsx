"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Edit3, Save, X, User, Mail, Phone, CreditCard, Calendar } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useNotification } from "@contexts/NotificationContext";
import "react-datepicker/dist/react-datepicker.css";

// Component con cho các trường input để tránh lặp code
const ProfileInput = ({ icon, label, isEditing, type = "text", previewImage, onImageChange, value, onChange, ...props }) => {
    const Icon = icon;

    if (type === "file") {
        return (
            <div>
                <label className="block text-sm font-semibold text-secondary mb-2">{label}</label>
                <div className="space-y-3">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary z-10">
                            <Icon size={18} />
                        </span>
                        <input
                            type="file"
                            disabled={!isEditing}
                            className={`w-full rounded-lg px-4 py-3 pl-12 bg-input text-input border-themed transition-all duration-200
                          ${isEditing ? "border-hover cursor-pointer" : "bg-background cursor-not-allowed opacity-50"}`}
                            onChange={onImageChange}
                            accept="image/*"
                            {...props}
                        />
                    </div>
                    {/* Preview image - chỉ hiển thị khi có ảnh thực sự */}
                    {previewImage && previewImage.trim() !== "" && previewImage !== "undefined" ? (
                        <div className="mt-3">
                            <img
                                src={previewImage}
                                alt={label}
                                className="w-32 h-24 object-cover rounded-lg border-2 border-themed"
                                onError={(e) => {
                                    console.log(`Error loading image: ${previewImage}`);
                                    e.target.style.display = "none";
                                }}
                            />
                        </div>
                    ) : (
                        <div className="mt-3 text-center py-8 border-2 border-dashed border-themed rounded-lg bg-background">
                            <p className="text-secondary text-sm">Chưa có ảnh</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (type === "date") {
        return (
            <div>
                <label className="block text-sm font-semibold text-secondary mb-2">{label}</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary z-10">
                        <Icon size={18} />
                    </span>
                    <DatePicker
                        selected={value ? new Date(value) : null}
                        onChange={onChange}
                        disabled={!isEditing}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Chọn ngày"
                        className={`w-full rounded-lg px-4 py-3 pl-12 bg-input text-input border-themed transition-all duration-200
                        ${isEditing ? "border-hover cursor-pointer" : "bg-background cursor-not-allowed opacity-50"}`}
                        wrapperClassName="w-full"
                        popperClassName="z-50"
                        {...props}
                    />
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-semibold text-secondary mb-2">{label}</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                    <Icon size={18} />
                </span>
                <input
                    type={type}
                    readOnly={!isEditing}
                    value={value || ""}
                    onChange={onChange}
                    className={`w-full rounded-lg px-4 py-3 pl-12 bg-input text-input border-themed transition-all duration-200
                        ${isEditing ? "border-hover" : "bg-background cursor-not-allowed"}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { pop } = useNotification();
    const [userData, setUserData] = useState({
        username: "...",
        email: "",
        phone: "",
        avatar_url: "",
        cccd_number: "",
        cccd_frontend: "",
        cccd_backend: "",
        cccd_created_at: "",
    });
    const [editData, setEditData] = useState({});

    // Files để upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [cccdFrontendFile, setCccdFrontendFile] = useState(null);
    const [cccdBackendFile, setCccdBackendFile] = useState(null);

    // Preview URLs
    const [avatarPreview, setAvatarPreview] = useState("");
    const [cccdFrontendPreview, setCccdFrontendPreview] = useState("");
    const [cccdBackendPreview, setCccdBackendPreview] = useState("");

    const fileInputRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const response = await api.get("/user/profile");
            const { username, email, phone, avatar_url, cccd_number, cccd_frontend_url, cccd_backend_url, cccd_created_at } = response.data;

            const newUserData = {
                username,
                email: email || "",
                phone: phone || "",
                avatar_url: avatar_url || "",
                cccd_number: cccd_number || "",
                cccd_frontend: cccd_frontend_url || "",
                cccd_backend: cccd_backend_url || "",
                cccd_created_at: cccd_created_at || "",
            };

            setUserData(newUserData);
            setEditData({
                email: email || "",
                phone: phone || "",
                cccd_number: cccd_number || "",
                cccd_created_at: cccd_created_at || "",
            });

            // Set preview URLs
            setAvatarPreview(avatar_url || "");
            setCccdFrontendPreview(cccd_frontend_url || "");
            setCccdBackendPreview(cccd_backend_url || "");
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Không thể tải thông tin người dùng.");
        }
    };

    const updateUserData = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();

            // Append basic data
            formData.append("email", editData.email);
            formData.append("phone", editData.phone || "");
            formData.append("cccd_number", editData.cccd_number || "");
            formData.append("cccd_created_at", editData.cccd_created_at || "");

            // Handle avatar
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            } else if (userData.avatar_url) {
                formData.append("avatar_url", userData.avatar_url);
            }

            // Handle CCCD frontend
            if (cccdFrontendFile) {
                formData.append("cccd_frontend", cccdFrontendFile);
            } else if (userData.cccd_frontend) {
                formData.append("cccd_frontend_url", userData.cccd_frontend);
            }

            // Handle CCCD backend
            if (cccdBackendFile) {
                formData.append("cccd_backend", cccdBackendFile);
            } else if (userData.cccd_backend) {
                formData.append("cccd_backend_url", userData.cccd_backend);
            }

            await api.post("/user/profile-update", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setIsEditing(false);
            pop("Cập nhật thông tin thành công!");
            await fetchUserData();

            // Reset files và previews
            resetFiles();

            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error("Error updating user data:", error);
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                for (const key in errors) {
                    toast.error(errors[key][0]);
                }
            } else {
                toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetFiles = () => {
        setAvatarFile(null);
        setCccdFrontendFile(null);
        setCccdBackendFile(null);

        // Reset preview về data gốc
        setAvatarPreview(userData.avatar_url || "");
        setCccdFrontendPreview(userData.cccd_frontend || "");
        setCccdBackendPreview(userData.cccd_backend || "");
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditData({
            email: userData.email,
            phone: userData.phone,
            cccd_number: userData.cccd_number,
            cccd_created_at: userData.cccd_created_at,
        });
        resetFiles();
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        resetFiles();
    };

    const handleSaveClick = async () => {
        await updateUserData();
    };

    const triggerFileInput = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    // Handle file changes
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCccdFrontendChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCccdFrontendFile(file);
            setCccdFrontendPreview(URL.createObjectURL(file));
        }
    };

    const handleCccdBackendChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCccdBackendFile(file);
            setCccdBackendPreview(URL.createObjectURL(file));
        }
    };

    if (isLoading) return <div>Loading...</div>;
    return (
        <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-themed">
                <div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">Thông tin tài khoản</h1>
                    <p className="text-secondary mt-1">Quản lý và bảo mật thông tin cá nhân của bạn.</p>
                </div>
                {!isEditing && (
                    <button onClick={handleEditClick} disabled={isLoading} className="action-button action-button-primary mt-4 sm:mt-0 !w-auto">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* Avatar Section */}
                <div className="lg:col-span-1 flex flex-col items-center text-center">
                    <div className="relative group w-40 h-40">
                        <img
                            src={avatarPreview || "/default-avatar.png"}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-full ring-4 ring-offset-4 ring-offset-content-bg ring-accent/70"
                            onError={(e) => {
                                e.target.src = "/default-avatar.png";
                            }}
                        />
                        {isEditing && (
                            <>
                                <button
                                    onClick={triggerFileInput}
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera size={24} />
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </>
                        )}
                    </div>
                    <p className="text-secondary text-sm mt-4">Ảnh đại diện của bạn.</p>
                </div>

                {/* Form Fields Section */}
                <div className="lg:col-span-2 space-y-6">
                    <ProfileInput icon={User} label="Tên đăng nhập" isEditing={false} value={userData.username} placeholder="Tên đăng nhập" />

                    <ProfileInput
                        icon={Mail}
                        label="Địa chỉ Email"
                        isEditing={isEditing}
                        name="email"
                        type="email"
                        value={editData.email || ""}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        placeholder="example@email.com"
                    />

                    <ProfileInput
                        icon={Phone}
                        label="Số điện thoại"
                        isEditing={isEditing}
                        name="phone"
                        type="tel"
                        value={editData.phone || ""}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="0123 456 789"
                    />

                    <ProfileInput
                        icon={CreditCard}
                        label="Số CCCD"
                        isEditing={isEditing}
                        name="cccd_number"
                        type="text"
                        value={editData.cccd_number || ""}
                        onChange={(e) => setEditData({ ...editData, cccd_number: e.target.value })}
                        placeholder="Nhập số CCCD"
                    />

                    <ProfileInput
                        icon={Camera}
                        label="Ảnh mặt trước CCCD"
                        isEditing={isEditing}
                        type="file"
                        previewImage={cccdFrontendPreview}
                        onImageChange={handleCccdFrontendChange}
                    />

                    <ProfileInput
                        icon={Camera}
                        label="Ảnh mặt sau CCCD"
                        isEditing={isEditing}
                        type="file"
                        previewImage={cccdBackendPreview}
                        onImageChange={handleCccdBackendChange}
                    />

                    <ProfileInput
                        icon={Calendar}
                        label="Ngày cấp"
                        isEditing={isEditing}
                        type="date"
                        value={editData.cccd_created_at}
                        onChange={(date) =>
                            setEditData({
                                ...editData,
                                cccd_created_at: date ? date.toISOString().split("T")[0] : "",
                            })
                        }
                        placeholder="Chọn ngày"
                    />

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={handleCancelClick} disabled={isLoading} className="action-button action-button-secondary !w-auto">
                                <X className="h-4 w-4 mr-2" />
                                Hủy
                            </button>
                            <button onClick={handleSaveClick} disabled={isLoading} className="action-button action-button-primary !w-auto">
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
