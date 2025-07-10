import { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Camera, Edit3, Save, X } from "lucide-react";
import api from "@utils/http";
import { toast } from "react-toastify";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: "...",
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
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: "var(--bg-content-900)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-6 border-b"
        style={{ borderColor: "var(--bg-content-800)" }}
      >
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Thông tin tài khoản
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--button-text)",
            }}
          >
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </button>
        )}
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
          <div>
            <label
              className="text-sm font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Username
            </label>
            <input
              type="text"
              value={userData.username}
              readOnly
              className="w-full rounded-lg px-4 py-3 cursor-not-allowed"
              style={{
                backgroundColor: "var(--bg-content-800)",
                border: "1px solid var(--bg-content-700)",
                color: "var(--text-secondary)",
              }}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={isEditing ? editData.email : userData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full rounded-lg px-4 py-3 transition-colors`}
              style={{
                backgroundColor: isEditing
                  ? "var(--input-bg)"
                  : "var(--bg-content-800)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="text-sm font-medium mb-2 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={isEditing ? editData.phone : userData.phone}
              onChange={(e) =>
                setEditData({ ...editData, phone: e.target.value })
              }
              readOnly={!isEditing}
              className={`w-full rounded-lg px-4 py-3 transition-colors`}
              style={{
                backgroundColor: isEditing
                  ? "var(--input-bg)"
                  : "var(--bg-content-800)",
                border: "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div
          className="flex justify-end gap-3 mt-8 pt-6 border-t"
          style={{ borderColor: "var(--bg-content-800)" }}
        >
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--bg-content-700)",
              color: "var(--text-primary)",
            }}
          >
            Hủy
          </button>
          <button
            onClick={() => {
              /* save logic */
            }}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--button-text)",
            }}
          >
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
}
