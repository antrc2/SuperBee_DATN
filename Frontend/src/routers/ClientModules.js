import {
  Home,
  RechargeCard,
  ShopAccount,
  ListProducts,
  Pay,
  HistoryProducts,
  Profile,
  ChangePassword,
  TransactionHistoryPage
} from "@pages";

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
  // Trang thanh toán
  {
    path: "/acc/:id",
    view: Pay
  },
  // Trang lịch sử đã xem
  {
    path: "/viewed",
    view: HistoryProducts
  }
];

export const profileModule = [
  // profile
  {
    path: "/info",
    view: Profile
  },
  {
    path: "/info/change-password",
    view: ChangePassword
  },
  {
    path: "/info/transactions",
    view: TransactionHistoryPage
  }
];
