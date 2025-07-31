import React from "react";
import WithdrawPage from "../pages/Clients/Profile/WithdrawPage";

// Thay đổi các import trực tiếp thành React.lazy
const Home = React.lazy(() => import("@pages/Clients/Home/Home"));
const RechargeCard = React.lazy(() =>
  import("@pages/Clients/RechargeCard/RechargeCard")
);
const ShopAccount = React.lazy(() =>
  import("@pages/Clients/ShopAccount/ShopAccount")
);
const ListProducts = React.lazy(() =>
  import("@pages/Clients/ListProducts/ListProducts")
);
const ProductDetail = React.lazy(() =>
  import("@pages/Clients/ProductDetail/ProductDetail")
);
const HistoryProducts = React.lazy(() =>
  import("@pages/Clients/HistoryProducts/HistoryProducts")
);
const Profile = React.lazy(() => import("@pages/Clients/Profile/Profile"));
const ChangePassword = React.lazy(() =>
  import("@pages/Clients/Profile/ChangePassword")
);
const TransactionHistoryPage = React.lazy(() =>
  import("@pages/Clients/Profile/TransactionHistoryPage")
);
const CartPage = React.lazy(() => import("@pages/Clients/CartPage/CartPage"));
const Pay = React.lazy(() => import("@pages/Clients/Pay/Pay"));

const ActivateWebPage = React.lazy(() =>
  import("../pages/Clients/ActiveDomain/ActivateWebPage")
);
const ActiveAcc = React.lazy(() =>
  import("../pages/Clients/ResetPassword/ActiveAcc")
);
const ChatComponent = React.lazy(() => import("../pages/Chat/Chat"));
const EmailVerification = React.lazy(() =>
  import("../pages/Clients/EmailVerification/EmailVerification")
);
const ForgotPassword = React.lazy(() =>
  import("../pages/Clients/ForgotPassword/ForgotPassword")
);
const HistoryOrder = React.lazy(() =>
  import("../pages/Clients/Profile/HistoryOrder")
);
const ResetPassword = React.lazy(() =>
  import("../pages/Clients/ResetPassword/ResetPassword")
);
const UnauthorizedPage = React.lazy(() =>
  import("../pages/Error/UnauthorizedPage")
);
const News = React.lazy(() => import("../pages/Clients/Post/News"));

const NewDetail = React.lazy(() => import("../pages/Clients/Post/NewDetail"));

const SearchPage = React.lazy(() =>
  import("../pages/Clients/SearchPage/SearchPage ")
);
const NotificationPage = React.lazy(() =>
  import("../pages/Clients/Notification/NotificationPage")
);
const AffiliateHistory = React.lazy(() =>
  import("@pages/Clients/Profile/AffiliateHistory")
);

export const clientModules = [
  {
    // Trang chủ
    path: "/",
    view: Home,
    requiresAuth: false,
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
    requiresAuth: false,
  },
  // Trang chi tiết của một category con gồm list sản phẩm
  {
    path: "/mua-acc/:slug",
    view: ListProducts,
    requiresAuth: false,
  },
  // Trang chi tiết sản phẩm
  {
    path: "/acc/:slug",
    view: ProductDetail,
    requiresAuth: false,
  },
  // Trang lịch sử đã xem
  {
    path: "/viewed",
    view: HistoryProducts,
    requiresAuth: false,
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
  {
    path: "/activeAcc",
    view: ActiveAcc,
  },
  {
    path: "/activeWeb",
    view: ActivateWebPage,
  },
  // Thêm ChatComponent nếu nó là một route độc lập
  {
    path: "/chat",
    view: ChatComponent,
    requiresAuth: true, // Hoặc false tùy vào yêu cầu của bạn
  },
  {
    path: "/tin-tuc",
    view: News,
    requiresAuth: false,
  },
  {
    path: "/tin-tuc/:categorySlug",
    view: News,
    requiresAuth: false,
  },
  {
    path: "/tin-tuc/:categorySlug/:slug",
    view: NewDetail,
    requiresAuth: false,
  },
  {
    path: "/search",
    view: SearchPage,
    requiresAuth: false, // Hoặc false tùy vào yêu cầu của bạn
  },
  {
    path: "/notifications",
    view: NotificationPage,
    requiresAuth: true, // Hoặc false tùy vào yêu cầu của bạn
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
  {
    path: "/info/orders",
    view: HistoryOrder,
    requiresAuth: true,
  },
  // Thêm route lịch sử tiếp thị liên kết
  {
    path: "/info/affiliate-history",
    view: AffiliateHistory,
    requiresAuth: true,
  },
  {
    path: "/info/withdraw",
    view: WithdrawPage,
    requiresAuth: true,
  },
];
