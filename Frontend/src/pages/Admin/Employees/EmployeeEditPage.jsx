import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EmployeeForm } from "./components/EmployeeForm";
import { getEmployeeById, updateEmployee } from "@services/employeeService";

export const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEmployee = async () => {
      setIsFetching(true);
      try {
        const response = await getEmployeeById(id);
        // Dữ liệu API trả về được đưa thẳng vào state
        setEmployee(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nhân viên:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setErrors({});
    try {
      // TỐI ƯU: Không cần xử lý formData ở đây nữa, vì EmployeeForm đã làm việc đó.
      await updateEmployee(id, formData);
      alert("Cập nhật thông tin nhân viên thành công!");
      navigate("/admin/employees");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 422) {
          // MỚI: Xử lý lỗi hết slot khi đổi vai trò sang NV Hỗ Trợ
          if (error.response.data.error_type === "no_available_slots") {
            alert(error.response.data.message);
          } else {
            setErrors(error.response.data.errors);
          }
        } else {
          console.error("Lỗi khi cập nhật nhân viên:", error);
          alert("Đã có lỗi xảy ra từ máy chủ.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Đang tải dữ liệu...</div>;
  if (!employee) return <div>Không tìm thấy nhân viên.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Sửa thông tin: {employee.user?.username}
      </h1>
      <div className="bg-white p-6 shadow rounded-lg">
        <EmployeeForm
          initialData={employee} // Truyền thẳng dữ liệu từ API xuống
          onSubmit={handleSubmit}
          isEditMode={true}
          isLoading={isLoading}
          serverErrors={errors}
        />
      </div>
    </div>
  );
};
