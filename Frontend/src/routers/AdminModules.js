import React from "react";
import EditCategoryPost from "../pages/Admin/CategoryPost/EditCategoryPostPage";
import NotFound from "../pages/NotFound/NotFound";

// ================== LAZY LOAD COMPONENTS ==================
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

// ================== MODULES DEFINITION ==================
export const adminModules = [
  // Phân quyền
  {
    name: "authorization",
    list: AuthorizationDashboardPage,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization/roles",
    list: RolesPage,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization/permissions",
    list: PermissionsPage,
    allowedRoles: ["admin"],
  },
  {
    name: "authorization/users",
    list: UserListPage,
    allowedRoles: ["admin"],
  },

  // Khuyến mãi sản phẩm
  {
    name: "discountcode",
    list: DiscountCodePage,
    create: CreateDiscountCodePage,
    edit: EditDiscountCodePage,
    show: ShowDiscountCodePage,
    // === BỔ SUNG: Thêm 'nv-ho-tro' ===
    allowedRoles: [
      "admin",
      "admin-super",
      "reseller",
      "nv-marketing",
      "nv-ho-tro",
    ],
    permissions: {
      create: "promotions.create",
      edit: "promotions.edit",
      view: "promotions.view",
      show: "promotions.view",
    },
  },
  // Khuyến mãi nạp thẻ
  {
    name: "donatePromotions",
    list: DonatePromotionDashboard,
    create: CreateDonatePromotionPage,
    edit: EditDonatePromotionPage,
    show: DonatePromotionDetail,
    // === BỔ SUNG: Thêm 'nv-ho-tro' ===
    allowedRoles: [
      "admin",
      "admin-super",
      "reseller",
      "nv-marketing",
      "nv-ho-tro",
    ],
    permissions: {
      create: "donate_promotions.create",
      edit: "donate_promotions.edit",
      view: "donate_promotions.view",
      show: "donate_promotions.view",
    },
  },
  // Danh mục sản phẩm
  {
    name: "categories",
    list: CategoryPage,
    create: CreateCategoryPage,
    edit: EditCategoryPage,
    show: NotFound,
    allowedRoles: ["admin", "admin-super", "reseller", "nv-kiem-duyet"],
    permissions: {
      create: "categories.create",
      edit: "categories.edit",
      view: "categories.view",
    },
  },
  // Danh mục bài viết
  {
    name: "categoryPost",
    list: TrangDanhSachCategoryPost,
    create: CreateCategoryPostPage,
    edit: EditCategoryPost,
    show: NotFound,
    allowedRoles: ["admin", "admin-super", "nv-marketing"],
    permissions: {
      create: "post_categories.create",
      edit: "post_categories.edit",
      view: "post_categories.view",
    },
  },
  // Người dùng
  {
    name: "users",
    list: AccountListPage,
    show: ShowAccountPage,
    edit: NotFound,
    create: CreateAccountPage,
    allowedRoles: [
      "admin",
      "admin-super",
      "reseller",
      "nv-ho-tro",
      "nv-kiem-duyet",
    ],
    permissions: {
      view: "users.view",
      show: "users.view",
    },
  },
  // Bài viết
  {
    name: "post",
    list: TrangDanhSachPost,
    show: ShowPostPage,
    create: CreatePostPage,
    edit: EditPostPage,
    allowedRoles: ["admin", "admin-super", "nv-marketing"],
    permissions: {
      create: "posts.create",
      edit: "posts.edit",
      view: "posts.view",
      show: "posts.view",
    },
  },
  // Sản phẩm
  {
    name: "products",
    list: TrangDanhSachAccGame,
    show: ProductDetailPage,
    create: CreateProducts,
    edit: EditProducts,
    allowedRoles: ["admin", "admin-super", "reseller", "nv-kiem-duyet"],
    permissions: {
      create: "products.create",
      edit: "products.edit",
      view: "products.view",
      show: "products.view",
    },
  },
  // Duyệt sản phẩm
  {
    name: "pendingProducts",
    list: TrangDanhSachAccGameBrowse,
    show: UpdateProductBrowse,
    edit: NotFound,
    create: NotFound,
    allowedRoles: ["admin", "admin-super", "nv-kiem-duyet"],
    permissions: {
      view: "products.view",
      show: "products.edit",
    },
  },
  // Banner
  {
    name: "banners",
    list: BannersListPage,
    show: BannerDetailPage,
    create: CreateBanners,
    edit: EditBanner,
    allowedRoles: ["admin", "admin-super", "nv-marketing"],
    permissions: {
      create: "banners.create",
      edit: "banners.edit",
      view: "banners.view",
      show: "banners.view",
    },
  },
  // Đơn hàng
  {
    name: "orders",
    list: ListOrderPage,
    show: ShowOrderPage,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "admin-super", "reseller", "nv-ho-tro"],
    permissions: {
      view: "orders.view",
      show: "orders.view",
    },
  },
  {
    name: "disputes",
    list: DisputesPage,
    show: DisputeDetailPage,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "admin-super", "reseller", "nv-ho-tro"],
    permissions: {
      view: "product_reports.view",
      edit: "product_reports.edit",
    },
  },
  {
    name: "withdrawals",
    list: WithdrawalsPage,
    show: NotFound,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "admin-super", "reseller"],
    permissions: {
      view: "withdrawals.view",
      edit: "withdrawals.edit",
    },
  },
  // Module Agent
  {
    name: "agent",
    list: AgentDashboardPage,
    show: NotFound,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "admin-super", "nv-ho-tro"],
    permissions: {
      view: "chat.view",
    },
  },
  {
    name: "settings",
    list: BusinessSettingPage,
    show: NotFound,
    create: NotFound,
    edit: NotFound,
    allowedRoles: ["admin", "admin-super"],
    permissions: {
      view: "settings.view",
    },
  },
];
