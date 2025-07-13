import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import LoadingDomain from "../../components/Loading/LoadingDomain";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: authRegister, loading } = useAuth();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError: setFormError,
  } = useForm({});

  const getAffiliateId = () => {
    const params = new URLSearchParams(location.search);
    return params.get("aff") || null;
  };

  const onSubmit = async (data) => {
    clearErrors();
    const affiliateId = getAffiliateId();
    const result = await authRegister({ ...data, aff: affiliateId });

    if (!result.success && result.validationErrors) {
      Object.entries(result.validationErrors).forEach(([field, messages]) => {
        setFormError(field, {
          type: "server",
          message: Array.isArray(messages) ? messages[0] : messages,
        });
      });
    }
  };

  if (loading) {
    return <LoadingDomain />;
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar ">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-5" />
          Quay lại trang chủ
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="font-heading mb-2 font-semibold text-primary text-title-sm sm:text-title-md">
              Đăng Ký
            </h1>
            <p className="text-sm text-secondary">
              Nhập thông tin của bạn để tạo tài khoản mới!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-primary mb-1"
                >
                  Tên đăng nhập<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  className="block w-full px-4 py-[12px] text-sm rounded-lg border-hover placeholder-theme bg-input text-input"
                  {...register("username", {
                    required: "Tên đăng nhập là bắt buộc",
                    minLength: {
                      value: 3,
                      message: "Tên đăng nhập phải có ít nhất 3 ký tự",
                    },
                  })}
                  onChange={(e) => {
                    clearErrors("username");
                    register("username").onChange(e);
                  }}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary mb-1"
                >
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  className="block w-full px-4 py-[12px] text-sm rounded-lg border-hover placeholder-theme bg-input text-input"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                  onChange={(e) => {
                    clearErrors("email");
                    register("email").onChange(e);
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-primary mb-1"
                >
                  Mật khẩu<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Nhập mật khẩu"
                    className="block w-full px-4 py-[12px] text-sm rounded-lg border-hover placeholder-theme pr-10 bg-input text-input"
                    {...register("password", {
                      required: "Mật khẩu là bắt buộc",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                    onChange={(e) => {
                      clearErrors("password");
                      register("password").onChange(e);
                    }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-10 -translate-y-1/2 cursor-pointer right-4 top-1/2 text-secondary"
                  >
                    {showPassword ? (
                      <Eye className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
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
                  className="font-heading flex items-center justify-center w-full px-4 py-3 text-sm font-bold rounded-lg transition-all text-accent-contrast bg-gradient-button hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng Ký"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-secondary sm:text-start">
              Đã có tài khoản?{" "}
              <Link
                to="/auth/login"
                className="font-heading font-semibold transition-colors text-highlight hover:brightness-125"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
