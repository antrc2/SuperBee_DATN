import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Hoặc import từ file cấu hình axios của bạn
import { useTheme } from "../../../contexts/ThemeContext";
import api from "../../../utils/http";

// Component Card để hiển thị số liệu thống kê
function StatCard({ title, value, icon, linkTo }) {
  return (
    <Link
      to={linkTo}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center"
    >
      <div className="p-3 bg-indigo-500 rounded-full text-white mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </Link>
  );
}

// Component chính của trang Dashboard
export default function AuthorizationDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/authorization/dashboard");
        setDashboardData(response.data.data);
      } catch (err) {
        setError("Không thể tải dữ liệu tổng quan. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading)
    return (
      <div className="text-center p-8 animate-pulse dark:text-gray-400">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );

  const { stats, power_users } = dashboardData;

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Tổng quan Phân quyền
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Tổng số Vai trò"
          value={stats?.role_count ?? 0}
          linkTo="/admin/authorization/roles"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Tổng số Quyền hạn"
          value={stats?.permission_count ?? 0}
          linkTo="/admin/authorization/permissions"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 017.743-5.743z"
              />
            </svg>
          }
        />
        <StatCard
          title="Tài khoản có quyền"
          value={stats?.power_user_count ?? 0}
          linkTo="/admin/authorization/users"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"
              />
            </svg>
          }
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Danh sách Tài khoản được gán quyền
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Hành động</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {power_users &&
                power_users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar_url}
                            alt={user.username}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 capitalize"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* ĐÂY LÀ ĐƯỜNG DẪN ĐƯỢC CẬP NHẬT */}
                      <Link
                        to={`/admin/authorization/users/${user.id}/manage`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Quản lý
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
