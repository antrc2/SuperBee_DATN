// LoginForm.jsx - Chỉ xử lý UI và gọi AuthContext
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ChevronLeft, EyeOff, Eye } from "lucide-react";
import { useAuth } from "@contexts/AuthContext.jsx";
import LoadingDomain from "../../components/Loading/LoadingDomain";

export default function LoginForm() {
  const [passwordType, setPasswordType] = useState("password");
  const { login, loading, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    // Clear any previous form errors
    clearErrors();

    // Call login function from AuthContext
    const result = await login(data);

    // Handle validation errors from server if any
    if (!result.success && result.validationErrors) {
      Object.entries(result.validationErrors).forEach(([field, messages]) => {
        setError(field, {
          type: "server",
          message: Array.isArray(messages) ? messages[0] : messages,
        });
      });
    }

    // All other error handling (notifications, navigation) is done in AuthContext
    // We only need to check if login was successful for any additional UI updates
    if (result.success) {
      // Login successful - AuthContext handles navigation and notifications
      console.log("Login successful");
    } else {
      // Login failed - AuthContext handles error notifications
      console.log("Login failed");
    }
  };

  if (loading) return <LoadingDomain />;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-50 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeft className="size-5" /> {/* Updated icon */}
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-white text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-50 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          {/* 
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-300 mb-5">
              <p>{error.message}</p>
            </div>
          )} */}

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
              {/* Username */}
              <div className="sm:col-span-1">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-50 dark:text-gray-200 mb-1"
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
                  })}
                  onChange={(e) => {
                    clearErrors("username");
                    register("username").onChange(e); // Ensure react-hook-form's onChange is still called
                  }}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-50 dark:text-gray-200 mb-1"
                >
                  Password<span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={passwordType}
                    id="password"
                    placeholder="Enter your password"
                    className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500 pr-10"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    onChange={(e) => {
                      clearErrors("password");
                      register("password").onChange(e); // Ensure react-hook-form's onChange is still called
                    }}
                  />
                  <span
                    onClick={() =>
                      setPasswordType((prev) =>
                        prev === "password" ? "text" : "password"
                      )
                    }
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {passwordType === "password" ? (
                      <EyeOff className="fill-gray-500 dark:fill-gray-400 size-5" /> // Updated icon
                    ) : (
                      <Eye className="fill-gray-500 dark:fill-gray-400 size-5" /> // Updated icon
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
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

          {/* Đăng ký */}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-50 dark:text-gray-100 sm:text-start">
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
