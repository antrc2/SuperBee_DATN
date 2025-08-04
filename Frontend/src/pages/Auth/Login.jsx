import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import LoadingDomain from "../../components/Loading/LoadingDomain";


export default function LoginForm() {
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReady, setCaptchaReady] = useState(false);
  // const captchaRef = useRef(null);
  // const sitekey = import.meta.env.VITE_SITE_KEY;
  const turnstileWidgetId = useRef(null);
  const { login, loading, user } = useAuth();
  // const navigate = useNavigate();
  const webId = localStorage.getItem("web_id") || 1;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  // Load turnstile script
  // useEffect(() => {
  //   if (window.turnstile) {
  //     setCaptchaReady(true);
  //     return;
  //   }

    // const script = document.createElement("script");
    // script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&rnd=${Date.now()}`;
    // script.async = true;
    // script.defer = true;
    // document.body.appendChild(script);

    // window.onloadTurnstileCallback = () => {
    //   setCaptchaReady(true);
    // };

  //   return () => {
  //     if (window.turnstile && turnstileWidgetId.current) {
  //       window.turnstile.remove(turnstileWidgetId.current);
  //     }
  //     delete window.onloadTurnstileCallback;
  //     document.body.removeChild(script);
  //   };
  // }, []);

  // Render CAPTCHA widget
  // useEffect(() => {
  //   if (captchaReady && window.turnstile && captchaRef.current) {
  //     if (turnstileWidgetId.current) {
  //       window.turnstile.remove(turnstileWidgetId.current);
  //     }

  //     turnstileWidgetId.current = window.turnstile.render(captchaRef.current, {
  //       sitekey: sitekey,
  //       callback: (token) => {
  //         setCaptchaToken(token);
  //       },
  //       "expired-callback": () => {
  //         setCaptchaToken("");
  //       },
  //       "error-callback": () => {
  //         setCaptchaToken("");
  //       },
  //     });
  //   }
  // }, [captchaReady, captchaRefreshKey]);


  // const resetCaptcha = () => {
  //   if (window.turnstile && turnstileWidgetId.current) {
  //     window.turnstile.reset(turnstileWidgetId.current);
  //   }
  //   setCaptchaToken("");
  //   setCaptchaRefreshKey(prev => prev + 1);
  // };
  // const resetCaptcha = () => {
  //   if (window.turnstile && turnstileWidgetId.current !== null) {
  //     window.turnstile.remove(turnstileWidgetId.current);
  //     turnstileWidgetId.current = null;
  //   }
  //   setCaptchaToken("");
  //   setCaptchaRefreshKey((prev) => prev + 1);
  // };
  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    clearErrors();
    // resetCaptcha(); 
    // if (!captchaToken) {
    //   setError("captcha", {
    //     type: "manual",
    //     message: "Vui lòng xác thực CAPTCHA",
    //   });
    //   return;
    // }

    const result = await login({
      ...data,
      // "cf-turnstile-response": captchaToken,
      web_id: webId,
    });

    // resetCaptcha();

    if (!result.success) {
      // Xử lý lỗi validation từ backend
      if (result.validationErrors) {
        Object.entries(result.validationErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      }

      // Xử lý lỗi CAPTCHA
      // if (result.code === 'CAPTCHA_FAILED' || result.code === 'CAPTCHA_ERROR') {
      //   setError("captcha", {
      //     type: "server",
      //     message: result.message || "Xác thực CAPTCHA thất bại",
      //   });
      // }
      // if (result.code === "VALIDATION_ERROR" && result.validationErrors?.["cf-turnstile-response"]) {
      //   resetCaptcha();
      // }

      // Xử lý lỗi thông tin đăng nhập sai
      if (result.code === 'INVALID_CREDENTIALS') {
        setError("username", {
          type: "server",
          message: result.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        });
        setError("password", {
          type: "server",
          message: result.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }

      // Xử lý các lỗi khác
      if (result.code === 'NO_ACTIVE' || result.code === 'LOCKED_ACCOUNT' || result.code === 'INVALID_STATUS') {
        setError("username", {
          type: "server",
          message: result.message,
        });
      }
    }
  };

  if (loading) return <LoadingDomain />;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
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
              Đăng Nhập
            </h1>
            <p className="text-sm text-secondary">
              Chào mừng bạn trở lại! Vui lòng nhập thông tin.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Username */}
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
                  placeholder="Nhập tên đăng nhập của bạn"
                  className="block w-full px-4 py-[12px] text-sm rounded-lg border-hover placeholder-theme bg-input text-input"
                  {...register("username", {
                    required: "Tên đăng nhập là bắt buộc",
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

              {/* Password */}
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
                    placeholder="Nhập mật khẩu của bạn"
                    className="block w-full px-4 py-[12px] text-sm rounded-lg border-hover placeholder-theme pr-10 bg-input text-input"
                    {...register("password", {
                      required: "Mật khẩu là bắt buộc",
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
                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CAPTCHA */}
              {/* <div>
                <div ref={captchaRef} id="captcha" className="mb-2" />
                {errors.captcha && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.captcha.message}
                  </p>
                )}
              </div> */}

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="font-heading flex items-center justify-center w-full px-4 py-3 text-sm font-bold rounded-lg transition-all text-accent-contrast bg-gradient-button hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || (captchaReady && !captchaToken)}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </button>
              </div>
            </div>
          </form>

          {/* Links */}
          <div className="mt-5 flex items-center justify-between flex-wrap gap-y-2">
            <p className="text-sm font-normal text-secondary">
              Chưa có tài khoản?{" "}
              <Link
                to="/auth/register"
                className="font-heading font-semibold transition-colors text-highlight hover:brightness-125"
              >
                Đăng ký
              </Link>
            </p>
            <p className="text-sm font-normal">
              <Link
                to="/forgot-password"
                className="font-heading font-semibold transition-colors text-secondary hover:text-highlight"
              >
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
