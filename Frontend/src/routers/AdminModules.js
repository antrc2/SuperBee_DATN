import React from "react";
import EditCategoryPost from "../pages/Admin/CategoryPost/EditCategoryPostPage";
import NotFound from "../pages/NotFound/NotFound";

// ================== LAZY LOAD COMPONENTS (Giữ nguyên) ==================
const BusinessSettingPage = React.lazy(() =>
  import("@pages/Admin/BusinessSettings/BusinessSettingPage")
);
const CategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CategoryPage")
);
const CreateCategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/CreateCategoryPage")
);
const EditCategoryPage = React.lazy(() =>
  import("@pages/Admin/Category/EditCategoryPage")
);
const TrangDanhSachCategoryPost = React.lazy(() =>
  import("@pages/Admin/CategoryPost/TrangDanhSachCategoryPost")
);
const CreateCategoryPostPage = React.lazy(() =>
  import("@pages/Admin/CategoryPost/CreateCategoryPostPage.jsx")
);
const DiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/DiscountCodePage")
);
const CreateDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/CreateDiscountCodePage")
);
const EditDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/EditDiscountCodePage")
);
const ShowDiscountCodePage = React.lazy(() =>
  import("@pages/Admin/DiscountCode/ShowDiscountCodePage")
);
const DonatePromotionDashboard = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionDashboard")
);
const CreateDonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/CreateDonatePromotionPage")
);
const EditDonatePromotionPage = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/EditDonatePromotionPage")
);
const DonatePromotionDetail = React.lazy(() =>
  import("@pages/Admin/DonatePromotion/DonatePromotionDetail")
);
const AccountListPage = React.lazy(() =>
  import("@pages/Admin/Account/AccountPage")
);
const ShowAccountPage = React.lazy(() =>
  import("@pages/Admin/Account/ShowAccountPage")
);
const CreateAccountPage = React.lazy(() =>
  import("@pages/Admin/Account/CreateAccountPage")
);
const BannersListPage = React.lazy(() =>
  import("@pages/Admin/Banners/BannersListPage")
);
const CreateBanners = React.lazy(() =>
  import("@pages/Admin/Banners/CreateBanners")
);
const EditBanner = React.lazy(() => import("@pages/Admin/Banners/EditBanner"));
const BannerDetailPage = React.lazy(() =>
  import("@pages/Admin/Banners/BannerDetailPage")
);
const TrangDanhSachPost = React.lazy(() =>
  import("../pages/Admin/Post/TrangDanhSachPost")
);
const CreatePostPage = React.lazy(() =>
  import("../pages/Admin/Post/CreatePostPage")
);
const EditPostPage = React.lazy(() =>
  import("../pages/Admin/Post/EditPostPage")
);
const ShowPostPage = React.lazy(() =>
  import("../pages/Admin/Post/ShowPostPage")
);
const TrangDanhSachAccGame = React.lazy(() =>
  import("@pages/Admin/Products/TrangDanhSachAccGame")
);
const CreateProducts = React.lazy(() =>
  import("../pages/Admin/Products/CreateProducts")
);
const EditProducts = React.lazy(() =>
  import("../pages/Admin/Products/EditProducts")
);
const ProductDetailPage = React.lazy(() =>
  import("../pages/Admin/Products/ProductDetailPage")
);
const TrangDanhSachAccGameBrowse = React.lazy(() =>
  import("../pages/Admin/Products/TrangDanhSachAccGameBrowse")
);
const UpdateProductBrowse = React.lazy(() =>
  import("../pages/Admin/Products/UpdateProductBrowse")
);
const ListOrderPage = React.lazy(() =>
  import("../pages/Admin/Orders/ListOrderPage")
);
const ShowOrderPage = React.lazy(() =>
  import("../pages/Admin/Orders/ShowOrderPage")
);
const AgentDashboardPage = React.lazy(() =>
  import("../pages/AgentDashboard/AgentDashboardPage")
);
const AuthorizationDashboardPage = React.lazy(() =>
  import("../pages/Admin/Authorization/AuthorizationDashboardPage")
);
const RolesPage = React.lazy(() =>
  import("../pages/Admin/Authorization/RolesPage")
);
const PermissionsPage = React.lazy(() =>
  import("../pages/Admin/Authorization/PermissionsPage")
);
import { UserListPage } from "../pages/Admin/Authorization/UserRolesPage";
import DisputesPage from "../pages/Admin/DisputesPage/DisputesPage";
import DisputeDetailPage from "../pages/Admin/DisputesPage/DisputeDetailPage";
import WithdrawalsPage from "../pages/Admin/Withdrawals/WithdrawalsPage";
import { EmployeeListPage } from "../pages/Admin/Employees/EmployeeListPage";
import { EmployeeCreatePage } from "../pages/Admin/Employees/EmployeeCreatePage";
import { EmployeeEditPage } from "../pages/Admin/Employees/EmployeeEditPage";

// ================== MODULES DEFINITION (ĐÃ CẬP NHẬT THEO SEEDER) ==================
export const adminModules = [
  // Phân quyền
  {
    name: "authorization",
    list: AuthorizationDashboardPage,
    // Không cần quyền cụ thể cho dashboard chung, chỉ cần đăng nhập
  },
  {
    name: "authorization/roles",
    list: RolesPage,
    permissions: { view: "roles.view" },
  },
  {
    name: "authorization/permissions",
    list: PermissionsPage,
    permissions: { view: "permissions.view" },
  },
  {
    name: "authorization/users",
    list: UserListPage,
    permissions: { view: "users.view" }, // Seeder dùng `users.view` cho danh sách
  },
  // Nhân viên
  {
    name: "employees",
    list: EmployeeListPage,
    create: EmployeeCreatePage,
    edit: EmployeeEditPage,
    show: NotFound, // Không có trang chi tiết cho nhân viên
    permissions: {
      view: "employees.view",
      create: "employees.create",
      edit: "employees.edit",
    },
  },
  // Mã giảm giá
  {
    name: "discountcode",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage,
    show: ShowDiscountCodePage,
    permissions: {
      view: "promotions.view",
      show: "promotions.view",
      create: "promotions.create",
      edit: "promotions.edit",
    },
  },
  // Khuyến mãi nạp thẻ
  {
    name: "donatePromotions",
    list: DonatePromotionDashboard,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    show: DonatePromotionDetail,
    permissions: {
      view: "donate_promotions.view",
      show: "donate_promotions.view",
      create: "donate_promotions.create",
      edit: "donate_promotions.edit",
    },
  },
  // Danh mục sản phẩm
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
    show: NotFound,
    permissions: {
      view: "categories.view",
      create: "categories.create",
      edit: "categories.edit",
    },
  },
  // Danh mục bài viết
  {
    name: "categoryPost",
    list: TrangDanhSachCategoryPost,
    create: CreateCategoryPostPage,
    edit: EditCategoryPost,
    show: NotFound,
    permissions: {
      view: "post_categories.view",
      create: "post_categories.create",
      edit: "post_categories.edit",
    },
  },
  // Người dùng
  {
    name: "users",
    list: AccountListPage,
    show: ShowAccountPage,
    edit: NotFound, // Không có trang edit riêng
    create: CreateAccountPage,
    permissions: {
      view: "users.view",
      show: "users.view", // Xem chi tiết cũng là quyền view
      create: "users.create",
    },
  },
  // Bài viết
  {
    name: "post",
    list: TrangDanhSachPost,
    show: ShowPostPage,
    create: CreatePostPage,
    edit: EditPostPage,
    permissions: {
      view: "posts.view",
      show: "posts.view",
      create: "posts.create",
      edit: "posts.edit",
    },
  },
  // Sản phẩm
  {
    name: "products",
    list: TrangDanhSachAccGame,
    show: ProductDetailPage,
    create: CreateProducts,
    edit: EditProducts,
    permissions: {
      view: "products.view",
      show: "products.view",
      create: "products.create",
      edit: "products.edit",
    },
  },
  // Duyệt sản phẩm
  {
    name: "pendingProducts",
    list: TrangDanhSachAccGameBrowse,
    show: UpdateProductBrowse,
    edit: NotFound,
    create: NotFound,
    permissions: {
      view: "products.view", // Vẫn cần quyền xem sản phẩm để vào danh sách
      show: "products.approve", // Hành động "show" ở đây thực chất là để duyệt
    },
  },
  // Banner
  {
    name: "banners",
    list: BannersListPage,
    show: BannerDetailPage,
    create: CreateBanners,
    edit: EditBanner,
    permissions: {
      view: "banners.view",
      show: "banners.view",
      create: "banners.create",
      edit: "banners.edit",
    },
  },
  // Đơn hàng
  {
    name: "orders",
    list: ListOrderPage,
    show: ShowOrderPage,
    create: NotFound,
    edit: NotFound,
    permissions: {
      view: "orders.view",
      show: "orders.view",
    },
  },
  // Khiếu nại
  {
    name: "disputes",
    list: DisputesPage,
    show: DisputeDetailPage,
    create: NotFound,
    edit: NotFound, // Hành động edit nằm trong trang show
    permissions: {
      view: "product_reports.view",
      show: "product_reports.edit", // Xem chi tiết khiếu nại là để xử lý nó
    },
  },
  // Rút tiền
  {
    name: "withdrawals",
    list: WithdrawalsPage,
    show: NotFound, // Hành động duyệt/từ chối nằm ngay trên list
    create: NotFound,
    edit: NotFound,
    permissions: {
      view: "withdrawals.view",
      edit: "withdrawals.edit", // Quyền edit để thực hiện duyệt/từ chối
    },
  },
  // Module Agent
  {
    name: "agent",
    list: AgentDashboardPage,
    show: NotFound,
    create: NotFound,
    edit: NotFound,
    permissions: {
      view: "chat.view",
    },
  },
  // Cài đặt chung
  {
    name: "business_settings",
    list: BusinessSettingPage,
    show: NotFound,
    create: NotFound,
    edit: NotFound, // Hành động edit nằm trên trang list
    permissions: {
      view: "business_settings.view",
      edit: "business_settings.edit",
    },
  },
];
