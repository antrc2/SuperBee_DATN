// src/components/LoginForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@assets/icons";
import { useAuth } from "@contexts/AuthContext.jsx";
import LoadingDomain from "../../components/Loading/LoadingDomain";
// import { decodeData } from "../../utils/hook"; // <-- Không cần import decodeData ở đây nữa

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  // Không cần setUser và navigator ở đây nữa vì AuthContext đã tự xử lý sau login
  const { login, loading, error, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    trigger,
    watch,
    setError: setFormError, // Đổi tên để tránh xung đột với error từ useAuth
  } = useForm();

  const username = watch("username");
  const password = watch("password");

  const onSubmit = async (data) => {
    clearErrors();
    try {
      const result = await login(data); // Gọi hàm login từ AuthContext

      if (!result.success) {
        // AuthContext đã tự set error nếu login thất bại, bạn có thể display nó
        // hoặc nếu muốn có lỗi validation riêng cho form thì dùng setFormError ở đây
        // setFormError("general", {
        //   type: "manual",
        //   message: result.message || "Đăng nhập thất bại. Vui lòng thử lại."
        // });
      } else {
        // Không cần làm gì ở đây vì AuthContext đã xử lý setUser và navigate
        // alert("Đăng nhập thành công!"); // Có thể bỏ alert này
      }
    } catch (err) {
      // Lỗi này chỉ xảy ra nếu hàm login trong AuthContext ném lỗi,
      // chứ không phải trả về result.success: false
      console.error("Login form submission error:", err);
      setFormError("general", {
        type: "manual",
        message:
          err.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
      });
    }
  };

  if (loading) {
    return <LoadingDomain />;
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          {/* Display General Login Error (using error from useAuth) */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300 mb-5">
              <p>{error.message}</p>
            </div>
          )}

          {/* Display User Data on Success (using user from useAuth) - this will now be handled by the main app layout */}
          {user && (
            <div className="p-4 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-200 mb-5">
              <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-100">
                Đăng nhập thành công!
              </h3>
              <p className="text-sm">Chào mừng, {user.name || "Người dùng"}!</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Username Field */}
              <div className="sm:col-span-1">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  User Name<span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    onChange: () => trigger("username"),
                  })}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Password<span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500 pr-10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      onChange: () => trigger("password"),
                    })}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading} // Sử dụng `loading` từ useAuth
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang đăng nhập...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/auth/register"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
