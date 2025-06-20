"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Camera, Edit3, Save, X } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: "hikariuisu",
    email: "",
    phone: "",
    avatar: "",
  });
  const [editData, setEditData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/profile");
      const { username, email, phone, avatar } = response.data;
      setUserData({
        username,
        email: email || "",
        phone: phone || "",
        avatar: avatar || "",
      });
      setEditData({
        email: email || "",
        phone: phone || "",
        avatar: avatar || "",
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
    setEditData({ ...userData });
    setAvatarFile(null);
  };

  const handleSaveClick = () => {
    updateUserData();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setEditData((prevData) => ({
        ...prevData,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto ">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700 rounded-lg">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Thông tin tài khoản
                </h1>
                <p className="text-slate-400 text-sm">
                  Quản lý thông tin cá nhân của bạn
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-600 shadow-lg">
                <img
                  src={avatarFile ? editData.avatar : userData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <>
                  <div
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-white mx-auto mb-1" />
                      <span className="text-white text-xs font-medium">
                        Đổi ảnh
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                  />
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Username - Read-only */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                type="text"
                value={userData.username}
                readOnly
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={isEditing ? editData.email : userData.email}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                  isEditing
                    ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-700/50 border-slate-600 text-slate-300 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={isEditing ? editData.phone : userData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full border rounded-lg px-4 py-3 transition-colors ${
                  isEditing
                    ? "bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "bg-slate-700/50 border-slate-600 text-slate-300 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={handleCancelClick}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Hủy
              </button>
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                Lưu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
