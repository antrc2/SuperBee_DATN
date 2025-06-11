import {
  Home,
  RechargeCard,
  ShopAccount,
  ListProducts,
  ProductDetail,
  HistoryProducts,
  Profile,
  ChangePassword,
  TransactionHistoryPage,
  CartPage,
  Pay,
} from "@pages";
import { EmailVerification, ForgotPassword, ResetPassword } from "../pages";
import UnauthorizedPage from "../pages/Error/UnauthorizedPage";

export const clientModules = [
  {
    // Trang chủ
    path: "/",
    view: Home,
  },
  {
    // Bạn không có quyền truy cập
    path: "/not-authorized",
    view: UnauthorizedPage,
  },
  {
    // Trang Thanh Toán
    path: "/recharge-atm",
    view: RechargeCard,
    requiresAuth: true,
  },
  // Trang danh sách category con
  {
    path: "/mua-acc",
    view: ShopAccount,
  },
  // Trang chi tiết của một category con gồm list sản phẩm
  {
    path: "/mua-acc/:slug",
    view: ListProducts,
  },
  // Trang chi tiết sản phẩm
  {
    path: "/acc/:id",
    view: ProductDetail,
  },
  // Trang lịch sử đã xem
  {
    path: "/viewed",
    view: HistoryProducts,
  },
  // trang giỏ hàng
  {
    path: "/cart",
    view: CartPage,
    requiresAuth: true,
  },
  // trang thanh toán
  {
    path: "/pay",
    view: Pay,
    requiresAuth: true,
  },
  // trang kích hoạt
  {
    path: "/verify-email",
    view: EmailVerification,
  },
  {
    path: "/reset-password",
    view: ResetPassword,
  },
  {
    path: "/forgot-password",
    view: ForgotPassword,
  },
];

export const profileModule = [
  // profile
  {
    path: "/info",
    view: Profile,
    requiresAuth: true,
  },
  // thay đổi mk
  {
    path: "/info/change-password",
    view: ChangePassword,
    requiresAuth: true,
  },
  // lịch sử giao dịch
  {
    path: "/info/transactions",
    view: TransactionHistoryPage,
    requiresAuth: true,
  },
];
