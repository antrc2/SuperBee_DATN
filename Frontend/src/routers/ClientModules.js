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
  Pay
} from "@pages";
import { EmailVerification, ForgotPassword, ResetPassword } from "../pages";

export const clientModules = [
  {
    // Trang chủ
    path: "/",
    view: Home
  },
  {
    // Trang Thanh Toán
    path: "/recharge-atm",
    view: RechargeCard
  },
  // Trang danh sách category con
  {
    path: "/mua-acc",
    view: ShopAccount
  },
  // Trang chi tiết của một category con gồm list sản phẩm
  {
    path: "/mua-acc/:slug",
    view: ListProducts
  },
  // Trang chi tiết sản phẩm
  {
    path: "/acc/:id",
    view: ProductDetail
  },
  // Trang lịch sử đã xem
  {
    path: "/viewed",
    view: HistoryProducts
  },
  // trang giỏ hàng
  {
    path: "/cart",
    view: CartPage
  },
  // trang thanh toán
  {
    path: "/pay",
    view: Pay
  },
  // trang kích hoạt
  {
    path: "/verify-email",
    view: EmailVerification
  },
  {
    path: "/reset-password",
    view: ResetPassword
  },
  {
    path: "/forgot-password",
    view: ForgotPassword
  }
];

export const profileModule = [
  // profile
  {
    path: "/info",
    view: Profile
  },
  // thay đổi mk
  {
    path: "/info/change-password",
    view: ChangePassword
  },
  // lịch sử giao dịch
  {
    path: "/info/transactions",
    view: TransactionHistoryPage
  }
];
