import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmployeeForm } from "./components/EmployeeForm";
import { createEmployee } from "@services/employeeService";

export const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleName = searchParams.get("role");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // useEffect(() => {
  //   if (!roleName) {
  //     console.warn("Không có vai trò nào được chọn. Đang điều hướng...");
  //     navigate("/admin/employees");
  //   }
  // }, [roleName, navigate]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setErrors({});
    try {
      await createEmployee(formData);
      alert("Tạo nhân viên mới thành công!");
      navigate("/admin/employees");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          if (error.response.data.error_type === "no_available_slots") {
            alert(error.response.data.message);
            navigate("/admin/employees");
          } else {
            setErrors(error.response.data.errors);
          }
        } else {
          console.error("Lỗi khi tạo nhân viên:", error);
          alert("Đã có lỗi xảy ra từ máy chủ.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Bọc trong một div container chính để dễ dàng căn giữa và giới hạn chiều rộng
    <div className="container mx-auto px-4 py-8 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Thêm Nhân viên mới
        </h1>
        {/* Thêm class dark mode cho card chứa form */}
        <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
          <EmployeeForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            serverErrors={errors}
            preselectedRoleName={roleName}
          />
        </div>
      </div>
    </div>
  );
};
