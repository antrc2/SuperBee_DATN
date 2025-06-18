import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@assets/icons";
import { useAuth } from "@contexts/AuthContext.jsx";
import LoadingDomain from "../../components/Loading/LoadingDomain";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { register: authRegister, loading, error: errorBE, user } = useAuth();
  console.log("🚀 ~ SignUpForm ~ error:", errorBE?.message);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    trigger,
    setError: setFormError,
  } = useForm();

  // Function to extract 'aff' parameter from URL
  const getAffiliateId = () => {
    const params = new URLSearchParams(location.search);
    return params.get("aff") || null;
  };

  const onSubmit = async (data) => {
    clearErrors();
    const affiliateId = getAffiliateId();
    getAffiliateId();
    try {
      await authRegister({ ...data, aff: affiliateId });
    } catch (err) {
      console.error("Register form submission error:", err);
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
          className="inline-flex items-center text-sm text-gray-50 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-white text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-50 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          {/* Display User Data on Success (using user from useAuth) - This will likely be handled by a redirect */}
          {user && (
            <div className="p-4 bg-green-100 rounded-md dark:bg-green-900 dark:text-green-200 mb-5">
              <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-100">
                Đăng ký thành công!
              </h3>
              <p className="text-sm">
                Chào mừng, {user.name || "Người dùng"}! Bạn sẽ được chuyển
                hướng.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Username Field */}
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
                    onChange: () => trigger("username"),
                  })}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
                {errorBE?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorBE.message["username"]}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-50 dark:text-gray-200 mb-1"
                >
                  Email<span className="text-error-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="block w-full px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Invalid email address",
                    },
                    onChange: () => trigger("email"),
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}{" "}
                {errorBE?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorBE.message["email"]}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-50 dark:text-gray-200 mb-1"
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

              {errors.termsAccepted && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.termsAccepted.message}
                </p>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading} // Disable if loading or terms not accepted
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
                      Đang đăng ký...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-50 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
