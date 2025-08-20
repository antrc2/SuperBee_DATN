"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Edit3, Save, X, User, Mail, Phone } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";

// Component con cho các trường input để tránh lặp code
const ProfileInput = ({ icon, label, isEditing, type = "text", ...props }) => {
  const Icon = icon;
  return (
    <div>
      <label className="block text-sm font-semibold text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
          <Icon size={18} />
        </span>
        <input
          type={type}
          readOnly={type !== "file" && !isEditing}
          disabled={type === "file" && !isEditing} // Thêm disabled cho file input
          className={`w-full rounded-lg px-4 py-3 pl-12 bg-input text-input border-themed transition-all duration-200
                        ${
                          isEditing
                            ? "border-hover"
                            : "bg-background cursor-not-allowed"
                        }
                        ${type === "file" && !isEditing ? "opacity-50" : ""}`} // Thêm opacity khi disabled
          {...props}
        />
      </div>
    </div>
  );
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: "...",
    email: "",
    phone: "",
    avatar: "",
    cccd_number: "",
    cccd_frontend: "",
    cccd_backend: "",
    cccd_created_at: "",
  });
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/profile");
      const { username, email, phone, avatar, cccd_number, cccd_frontend_url, cccd_backend_url, cccd_created_at } = response.data;
      setUserData({
        username,
        email: email || "",
        phone: phone || "",
        avatar: avatar || "",
        cccd_number: cccd_number || "",
        cccd_frontend: cccd_frontend_url || "",
        cccd_backend: cccd_backend_url || "",
        cccd_created_at: cccd_created_at || "",
      });
      setEditData({
        email: email || "",
        phone: phone || "",
        avatar: avatar || "",
        cccd_number: cccd_number || "",
        cccd_frontend: cccd_frontend_url || "",
        cccd_backend: cccd_backend_url || "",
        cccd_created_at: cccd_created_at || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin người dùng.");
    }
  };

  const updateUserData = async () => {
    try {
      const formData = new FormData();
      formData.append("email", editData.email);
      formData.append("phone", editData.phone);
      formData.append("cccd_frontend", editData.cccd_frontend);
      formData.append("cccd_backend", editData.cccd_backend);
      formData.append("cccd_number", editData.cccd_number);
      formData.append("cccd_created_at", editData.cccd_created_at);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else {
        formData.append("avatar_url", editData.avatar);
      }

      await api.post("/user/profile-update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUserData();
      setIsEditing(false);
      setAvatarFile(null);
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
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({ ...userData });
    setAvatarFile(null);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Không cần reset data ở đây vì khi fetch lại đã có data mới
  };

  const handleSaveClick = async () => {
    await updateUserData();
  };

  const triggerFileInput = () => {
    if (isEditing) { // Chỉ cho phép khi đang ở chế độ chỉnh sửa
      fileInputRef.current?.click();
    }
  };

  return (
    <section className="section-bg p-6 md:p-8 rounded-2xl shadow-lg">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-themed">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
            Thông tin tài khoản
          </h1>
          <p className="text-secondary mt-1">
            Quản lý và bảo mật thông tin cá nhân của bạn.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="action-button action-button-primary mt-4 sm:mt-0 !w-auto"
          >
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
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : userData.avatar || "/default-avatar.png"
              }
              alt="Avatar"
              className="w-full h-full object-cover rounded-full ring-4 ring-offset-4 ring-offset-content-bg ring-accent/70"
            />
            {isEditing && (
              <>
                <button
                  onClick={triggerFileInput}
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={24} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </>
            )}
          </div>
          <p className="text-secondary text-sm mt-4">Ảnh đại diện của bạn.</p>
        </div>

        {/* Form Fields Section */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileInput
            icon={User}
            label="Tên đăng nhập"
            isEditing={false}
            value={userData.username}
            placeholder="Tên đăng nhập"
          />
          <ProfileInput
            icon={Mail}
            label="Địa chỉ Email"
            isEditing={isEditing}
            name="email"
            type="email"
            value={isEditing ? editData.email : userData.email}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
            placeholder="example@email.com"
          />
          <ProfileInput
            icon={Phone}
            label="Số điện thoại"
            isEditing={isEditing}
            name="phone"
            type="tel"
            value={isEditing ? editData.phone : userData.phone}
            onChange={(e) =>
              setEditData({ ...editData, phone: e.target.value })
            }
            placeholder="0123 456 789"
          />
          <ProfileInput
            icon={Phone}
            label="Số CCCD"
            isEditing={isEditing}
            name="cccd_number"
            type="text"
            value={isEditing ? editData.cccd_number : userData.cccd_number}
            onChange={(e) =>
              setEditData({ ...editData, cccd_number: e.target.value })
            }
            placeholder=""
          />
          <ProfileInput
            icon={Phone}
            label="Ảnh mặt trước"
            isEditing={isEditing}
            name="cccd_frontend"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setEditData({ ...editData, cccd_frontend: e.target.files[0] })
            }
          />
          <ProfileInput
            icon={Phone}
            label="Ảnh mặt sau"
            isEditing={isEditing}
            name="cccd_backend"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setEditData({ ...editData, cccd_backend: e.target.files[0] })
            }
          />
          <ProfileInput
            icon={Phone}
            label="Ngày cấp"
            isEditing={isEditing}
            name="cccd_created_at"
            type="date"
            value={isEditing ? editData.cccd_created_at : userData.cccd_created_at}
            onChange={(e) =>
              setEditData({ ...editData, cccd_created_at: e.target.value })
            }
          />

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancelClick}
                className="action-button action-button-secondary !w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </button>
              <button
                onClick={handleSaveClick}
                className="action-button action-button-primary !w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}